const asyncHandler = require('../../utils/asyncHandler');
const { SessionRecording, Session } = require('../../models');
const logger = require('../../config/logger');

/**
 * LiveKit Egress webhook — called when a recording finishes.
 * Body shape (LiveKit): { event, recording: { roomName, file, duration, ... } }
 * Protected in production by signature verification (LIVEKIT_API_SECRET).
 */
const webhook = asyncHandler(async (req, res) => {
  const body = req.body;
  const roomName = body.recording?.roomName || body.roomName || body.room_name;
  const file = body.recording?.file || body.file;
  const duration = body.recording?.duration || body.duration || 0;
  const size = body.recording?.size || body.size || 0;
  const egressId = body.recording?.egressId || body.egressId;

  logger.info('Recording webhook received', { roomName, egressId });

  if (!roomName) return res.status(400).json({ success: false, message: 'roomName required' });

  const session = await Session.findOne({ where: { room_name: roomName } });
  if (!session) return res.status(404).json({ success: false, message: 'session not found' });

  const recording = await SessionRecording.findOne({
    where: { session_id: session.id, status: ['recording', 'processing'] },
    order: [['id', 'DESC']],
  });

  if (recording) {
    await recording.update({
      status: 'ready',
      file_path: file || recording.file_path,
      url: file ? `/storage/recordings/${file}` : recording.url,
      duration_sec: Math.round(duration / 1_000_000_000) || recording.duration_sec,
      size_bytes: size || recording.size_bytes,
    });
  } else {
    await SessionRecording.create({
      session_id: session.id,
      status: 'ready',
      file_path: file,
      url: file ? `/storage/recordings/${file}` : null,
      duration_sec: Math.round(duration / 1_000_000_000) || 0,
      size_bytes: size || 0,
    });
  }

  res.json({ success: true });
});

module.exports = { webhook };
