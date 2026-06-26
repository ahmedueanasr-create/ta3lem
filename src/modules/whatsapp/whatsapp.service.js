const path = require('path');
const fs = require('fs');
const logger = require('../../config/logger');
const config = require('../../config');
const { WhatsAppMessage } = require('../../models');

let baileys = null;
let sock = null;
let isConnected = false;
let lastQr = null;
let lastPairingCode = null;
let onQrListeners = [];
let onStatusListeners = [];
let reconnectAttempts = 0;
let userCheckInterval = null;
const MAX_RECONNECT = 10;

function loadBaileys() {
  if (baileys) return baileys;
  try {
    baileys = require('@whiskeysockets/baileys');
    return baileys;
  } catch (err) {
    logger.warn('Baileys not installed; WhatsApp service disabled');
    return null;
  }
}

function jid(phone) {
  if (phone.includes('@')) return phone;
  return `${phone.replace(/[^\d]/g, '')}@s.whatsapp.net`;
}

function notifyStatus(status) {
  onStatusListeners.forEach((fn) => { try { fn(status); } catch {} });
}

function clearIntervals() {
  if (userCheckInterval) {
    clearInterval(userCheckInterval);
    userCheckInterval = null;
  }
}

class WhatsAppService {
  async start() {
    if (!config.whatsapp.enabled) {
      logger.info('WhatsApp disabled by config');
      return;
    }
    const lib = loadBaileys();
    if (!lib) return;

    const sessionDir = path.resolve(process.cwd(), config.whatsapp.sessionDir);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

    if (sock) {
      try { sock.end(); } catch {}
      sock = null;
    }

    const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = lib;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    // If already authenticated from saved session, mark connected immediately
    if (state.creds?.me?.id) {
      isConnected = true;
      lastQr = null;
      lastPairingCode = null;
      logger.info('WhatsApp restored from saved session');
    }

    sock = makeWASocket({
      auth: state,
      browser: ['ta3lem', 'Chrome', '1.0.0'],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
      markOnlineOnConnect: false,
      connectTimeoutMs: 120000,
      keepAliveIntervalMs: 30000,
      defaultQueryTimeoutMs: 120000,
      emitOwnEvents: true,
    });

    sock.ev.on('creds.update', (creds) => {
      saveCreds(creds);
      // If we got a 'me' field, pairing completed
      if (creds.me?.id && !isConnected) {
        logger.info('WhatsApp paired via creds.update');
        isConnected = true;
        lastQr = null;
        lastPairingCode = null;
        notifyStatus('connected');
        this._flushQueue();
      }
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        reconnectAttempts = 0;
        lastQr = qr;
        lastPairingCode = null;
        logger.info('WhatsApp QR generated');
        onQrListeners.forEach((fn) => { try { fn(qr); } catch {} });
        notifyStatus('awaiting_scan');
      }

      if (connection === 'open') {
        reconnectAttempts = 0;
        isConnected = true;
        lastQr = null;
        lastPairingCode = null;
        logger.info('WhatsApp connected');
        notifyStatus('connected');
        this._flushQueue();
      } else if (connection === 'close') {
        isConnected = false;
        const err = lastDisconnect?.error;
        const code = err?.output?.statusCode;
        const msg = err?.message;
        logger.warn('WhatsApp connection closed', { code, msg });

        if (code === DisconnectReason.loggedOut) {
          logger.error('WhatsApp logged out');
          sock = null;
          const dir = path.resolve(process.cwd(), config.whatsapp.sessionDir);
          if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
            fs.mkdirSync(dir, { recursive: true });
          }
          notifyStatus('disconnected');
          return;
        }

        reconnectAttempts++;
        if (reconnectAttempts <= MAX_RECONNECT) {
          const delay = Math.min(reconnectAttempts * 5000, 60000);
          logger.warn(`WhatsApp reconnect ${reconnectAttempts}/${MAX_RECONNECT}`, { code, msg, delay });
          notifyStatus('connecting');
          setTimeout(() => this.start(), delay);
        } else {
          logger.error('WhatsApp max reconnection attempts reached');
          notifyStatus('disconnected');
        }
      } else if (connection === 'connecting') {
        logger.info('WhatsApp connecting...');
        notifyStatus('connecting');
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const m of messages) {
        if (!m.message || m.key.fromMe) continue;
        try {
          await WhatsAppMessage.create({
            jid: m.key.remoteJid,
            message: JSON.stringify(m.message).slice(0, 2000),
            status: 'read',
            direction: 'in',
            wa_message_id: m.key.id,
          });
        } catch {}
      }
    });

    // Fallback: periodically check sock.user for authentication
    clearIntervals();
    userCheckInterval = setInterval(() => {
      if (isConnected) return;
      if (sock?.authState?.creds?.me?.id || sock?.user?.id) {
        logger.info('WhatsApp connected (detected via fallback check)');
        isConnected = true;
        lastQr = null;
        lastPairingCode = null;
        notifyStatus('connected');
        this._flushQueue();
      }
    }, 3000);

    notifyStatus(isConnected ? 'connected' : 'connecting');
  }

  async _flushQueue() {
    try {
      const queued = await WhatsAppMessage.findAll({
        where: { direction: 'out', status: 'queued' },
        limit: 50,
      });
      for (const msg of queued) {
        try {
          const sent = await sock.sendMessage(jid(msg.jid), { text: msg.message });
          await msg.update({ status: 'sent', wa_message_id: sent?.key?.id });
        } catch (e) {
          logger.warn('Flush failed', { id: msg.id });
        }
      }
    } catch {}
  }

  async requestPairingCode(phoneNumber) {
    const lib = loadBaileys();
    if (!lib) throw new Error('Baileys not available');

    if (isConnected) throw new Error('WhatsApp already connected');

    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) throw new Error('رقم الهاتف غير صالح');

    if (!sock) {
      await this.start();
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    if (!sock || !sock.requestPairingCode) {
      throw new Error('Pairing code not supported in this Baileys version');
    }

    const code = await sock.requestPairingCode(cleanPhone);
    lastPairingCode = code;
    lastQr = null;
    logger.info('Pairing code generated', { phone: cleanPhone });
    notifyStatus('awaiting_scan');
    return code;
  }

  isReady() {
    return isConnected && sock !== null;
  }

  getLastQr() {
    return lastQr;
  }

  getPairingCode() {
    return lastPairingCode;
  }

  getStatus() {
    if (isConnected && sock) return 'connected';
    if (lastQr || lastPairingCode) return 'awaiting_scan';
    if (sock) return 'connecting';
    return 'disconnected';
  }

  onQr(fn) {
    onQrListeners.push(fn);
    return () => { onQrListeners = onQrListeners.filter((f) => f !== fn); };
  }

  onStatusChange(fn) {
    onStatusListeners.push(fn);
    return () => { onStatusListeners = onStatusListeners.filter((f) => f !== fn); };
  }

  async restart() {
    reconnectAttempts = 0;
    isConnected = false;
    lastQr = null;
    lastPairingCode = null;
    clearIntervals();
    if (sock) { try { await sock.end(); } catch {} }
    return this.start();
  }

  async logout() {
    reconnectAttempts = 0;
    isConnected = false;
    lastQr = null;
    lastPairingCode = null;
    clearIntervals();
    try { if (sock) await sock.logout(); } catch {}
    const sessionDir = path.resolve(process.cwd(), config.whatsapp.sessionDir);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
    logger.info('WhatsApp session deleted');
    return this.start();
  }

  async send(phone, message) {
    const to = jid(phone);
    try {
      await WhatsAppMessage.create({ jid: to, message, status: 'queued', direction: 'out' });
    } catch {}
    if (!this.isReady()) {
      logger.warn('WhatsApp not ready; message queued', { to });
      return { status: 'queued' };
    }
    try {
      const sendPromise = sock.sendMessage(to, { text: message });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('sendMessage timeout')), 10000));
      const sent = await Promise.race([sendPromise, timeoutPromise]);
      await WhatsAppMessage.update(
        { status: 'sent', wa_message_id: sent?.key?.id },
        { where: { jid: to, message, direction: 'out', status: 'queued', wa_message_id: null } },
      );
      return { status: 'sent', messageId: sent?.key?.id };
    } catch (err) {
      logger.error('WhatsApp send failed', { to, error: err.message });
      return { status: 'failed', error: err.message };
    }
  }

  async broadcast(phones, message) {
    const results = [];
    for (const p of phones) {
      results.push({ phone: p, ...(await this.send(p, message)) });
    }
    return results;
  }
}

module.exports = new WhatsAppService();
