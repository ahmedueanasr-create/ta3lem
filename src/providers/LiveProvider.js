/**
 * Common interface every live-streaming provider must implement.
 * Methods are async and throw on error.
 */
class LiveProvider {
  async createRoom(/* opts */) {
    throw new Error('createRoom not implemented');
  }
  async deleteRoom(/* roomName */) {
    throw new Error('deleteRoom not implemented');
  }
  /** Returns a token the client uses to connect. */
  async getToken(/* roomName, identity, role */) {
    throw new Error('getToken not implemented');
  }
  async startRecording(/* roomName */) {
    throw new Error('startRecording not implemented');
  }
  async stopRecording(/* roomName, recordingId */) {
    throw new Error('stopRecording not implemented');
  }
  name() {
    return 'base';
  }
}

module.exports = LiveProvider;
