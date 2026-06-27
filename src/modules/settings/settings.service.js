const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const SETTINGS_PATH = path.resolve(process.cwd(), 'storage', 'settings.json');

const defaults = {
  waFallbackApiUrl: '',
  // App settings
  appName: 'تعليم',
  appDescription: 'منصة تعليمية تفاعلية',
  contactEmail: '',
  contactPhone: '',
  socialFacebook: '',
  socialTwitter: '',
  socialInstagram: '',
  socialWhatsApp: '',
  socialTelegram: '',
  aboutText: '',
  termsText: '',
  privacyText: '',
  appLogo: '',
  appFavicon: '',
};

class SettingsService {
  _read() {
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      }
    } catch {}
    return {};
  }

  _write(data) {
    try {
      const dir = path.dirname(SETTINGS_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Settings write failed', e.message);
    }
  }

  getAll() {
    return { ...defaults, ...this._read() };
  }

  get(key) {
    return this.getAll()[key] || defaults[key] || null;
  }

  update(updates) {
    const current = this._read();
    const merged = { ...current, ...updates };
    this._write(merged);
    return { ...defaults, ...merged };
  }

  async testFallback(phone, message) {
    const url = this.get('waFallbackApiUrl');
    if (!url) return { status: 'error', message: 'Fallback API URL not configured' };
    try {
      const payload = JSON.stringify({ phone, message });
      const result = await new Promise((resolve) => {
        const u = new URL(url);
        const lib = u.protocol === 'https:' ? https : http;
        const opts = {
          hostname: u.hostname,
          port: u.port || (u.protocol === 'https:' ? 443 : 80),
          path: u.pathname + u.search,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
          timeout: 10000,
        };
        const req = lib.request(opts, (res) => {
          let body = '';
          res.on('data', (c) => { body += c; });
          res.on('end', () => resolve({ status: res.statusCode < 400 ? 'sent' : 'failed', httpStatus: res.statusCode, response: body.slice(0, 300) }));
        });
        req.on('error', (e) => resolve({ status: 'error', message: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 'error', message: 'Connection timeout' }); });
        req.write(payload);
        req.end();
      });
      return result;
    } catch (e) {
      return { status: 'error', message: e.message };
    }
  }
}

module.exports = new SettingsService();
