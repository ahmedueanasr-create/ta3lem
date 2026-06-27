const { RoomServiceClient, AccessToken } = require('livekit-server-sdk');
const config = require('../config');
const LiveProvider = require('./LiveProvider');
const logger = require('../config/logger');

class LiveKitProvider extends LiveProvider {
  constructor() {
    super();
    this.client = new RoomServiceClient(
      config.live.livekit.host,
      config.live.livekit.apiKey,
      config.live.livekit.apiSecret,
    );
    this.apiKey = config.live.livekit.apiKey;
    this.apiSecret = config.live.livekit.apiSecret;
  }

  name() {
    return 'livekit';
  }

  async createRoom({ name, emptyTimeout = 600 }) {
    try {
      const room = await this.client.createRoom({ name, emptyTimeout });
      return room;
    } catch (err) {
      logger.error('LiveKit createRoom failed', { message: err.message });
      // room may already exist
      return { name, sid: null };
    }
  }

  async deleteRoom(roomName) {
    try {
      await this.client.deleteRoom(roomName);
    } catch (err) {
      logger.warn('LiveKit deleteRoom failed', { message: err.message });
    }
  }

  async getToken(roomName, identity, role = 'student') {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      ttl: 60 * 60 * 4,
    });
    const isObserver = role === 'observer';
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: role === 'teacher',
      canSubscribe: true,
      canPublishData: !isObserver,
      roomAdmin: role === 'teacher',
      hidden: isObserver,
    });
    return await at.toJwt();
  }

  async startRecording(roomName) {
    try {
      const res = await this.client.startRoomCompositeEgress(roomName, { layout: 'speaker' }, {
        filepath: `storage/recordings/${roomName}-{room_id}-{time}.mp4`,
      });
      return { recordingId: res.egressId, file: res.file };
    } catch (err) {
      logger.error('LiveKit startRecording failed', { message: err.message });
      return null;
    }
  }

  async stopRecording(roomName, recordingId) {
    try {
      await this.client.stopEgress(recordingId);
    } catch (err) {
      logger.warn('LiveKit stopRecording failed', { message: err.message });
    }
  }
}

module.exports = LiveKitProvider;
