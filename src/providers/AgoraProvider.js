const crypto = require('crypto');
const config = require('../config');
const LiveProvider = require('./LiveProvider');
const logger = require('../config/logger');

/**
 * Agora uses client-side tokens; server generates RTC/RTM tokens via the
 * agora-token npm package (optional). Here we provide a minimal implementation
 * using a manually-built token. For production install `agora-token`.
 */
class AgoraProvider extends LiveProvider {
  constructor() {
    super();
    this.appId = config.live.agora.appId;
    this.appCertificate = config.live.agora.appCertificate;
  }

  name() {
    return 'agora';
  }

  async createRoom({ name }) {
    return { name, sid: name };
  }

  async deleteRoom(_name) {
    // Agora rooms are ephemeral channels; nothing to delete server-side.
  }

  async getToken(roomName, identity, role = 'student') {
    if (!this.appCertificate) {
      logger.warn('Agora appCertificate missing, returning null token');
      return null;
    }
    // Minimal placeholder: a real Agora RTC token requires the agora-token package.
    // Install `agora-token` and use RtcTokenBuilder with privilege 17 (publisher) for teacher.
    const expire = Math.floor(Date.now() / 1000) + 3600;
    const payload = `${this.appId}|${roomName}|${identity}|${role}|${expire}`;
    const sig = crypto.createHmac('sha256', this.appCertificate).update(payload).digest('hex');
    return Buffer.from(`${payload}|${sig}`).toString('base64');
  }

  async startRecording(/* roomName */) {
    logger.warn('Agora cloud recording requires Media Server / REST API; stubbed.');
    return null;
  }

  async stopRecording() {}
}

module.exports = AgoraProvider;
