const config = require('../config');
const logger = require('../config/logger');

let provider = null;

function getProvider() {
  if (provider) return provider;
  const name = config.live.provider;
  if (name === 'agora') {
    const AgoraProvider = require('./AgoraProvider');
    provider = new AgoraProvider();
  } else {
    const LiveKitProvider = require('./LiveKitProvider');
    provider = new LiveKitProvider();
  }
  logger.info(`Live provider: ${provider.name()}`);
  return provider;
}

module.exports = { getProvider };
