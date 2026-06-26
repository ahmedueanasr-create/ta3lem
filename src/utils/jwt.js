const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const ApiError = require('../utils/ApiError');

class JwtService {
  signAccess(payload) {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessTtl,
      issuer: config.jwt.issuer,
      jwtid: uuidv4(),
    });
  }

  signRefresh(payload) {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshTtl,
      issuer: config.jwt.issuer,
      jwtid: uuidv4(),
    });
  }

  verifyAccess(token) {
    try {
      return jwt.verify(token, config.jwt.accessSecret, { issuer: config.jwt.issuer });
    } catch (e) {
      throw new ApiError(401, e.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid token');
    }
  }

  verifyRefresh(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, { issuer: config.jwt.issuer });
    } catch (e) {
      throw new ApiError(401, e.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token');
    }
  }

  decode(token) {
    return jwt.decode(token);
  }
}

module.exports = new JwtService();
