import 'dart:async';
import 'package:flutter/material.dart';
import 'package:livekit_client/livekit_client.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../theme/app_theme.dart';

class TeacherLiveRoomScreen extends StatefulWidget {
  final int sessionId;
  const TeacherLiveRoomScreen({super.key, required this.sessionId});

  @override
  State<TeacherLiveRoomScreen> createState() => _TeacherLiveRoomScreenState();
}

class _TeacherLiveRoomScreenState extends State<TeacherLiveRoomScreen> {
  final _chatController = TextEditingController();
  final _chatScrollController = ScrollController();
  String _lkStatus = 'جاري الاتصال...';
  bool _lkConnected = false;
  bool _isRecording = true;
  final List<Map<String, dynamic>> _messages = [];
  final List<Map<String, dynamic>> _speakRequests = [];
  bool _micOn = true;
  bool _camOn = true;

  Room? _room;
  VideoTrack? _localVideo;
  final List<CancelListenFunc> _lkListeners = [];

  @override
  void initState() {
    super.initState();
    _connectSocket();
    _initLiveKit();
  }

  Future<void> _initLiveKit() async {
    try {
      await LiveKitClient.initialize();
      final res = await ApiService.startSession(widget.sessionId);
      final data = res['data'];
      if (data == null) {
        setState(() => _lkStatus = 'فشل بدء الجلسة');
        return;
      }
      final url = data['livekitUrl'] ?? 'wss://3lm.zaadllc.com';
      final token = data['token'] as String;
      final room = Room(
        roomOptions: const RoomOptions(adaptiveStream: true, dynacast: true),
      );
      _lkListeners.add(room.events.on<LocalTrackPublishedEvent>((e) {
        if (e.publication.track is VideoTrack) {
          setState(() => _localVideo = e.publication.track as VideoTrack);
        }
      }));
      _lkListeners.add(room.events.on<TrackSubscribedEvent>((_) {
        if (mounted) setState(() {});
      }));
      _lkListeners.add(room.events.on<TrackUnsubscribedEvent>((_) {
        if (mounted) setState(() {});
      }));
      _lkListeners.add(room.events.on<ParticipantConnectedEvent>((_) {
        if (mounted) setState(() {});
      }));
      _lkListeners.add(room.events.on<ParticipantDisconnectedEvent>((_) {
        if (mounted) setState(() {});
      }));
      _lkListeners.add(room.events.on<RoomDisconnectedEvent>((_) {
        if (mounted) setState(() => _lkConnected = false);
      }));
      await room.connect(url, token,
          connectOptions: const ConnectOptions(autoSubscribe: true));
      await room.localParticipant?.setCameraEnabled(true);
      await room.localParticipant?.setMicrophoneEnabled(true);
      _room = room;
      if (mounted) {
        setState(() {
          _lkConnected = true;
          _lkStatus = 'متصل';
        });
      }
    } catch (e) {
      if (mounted) setState(() => _lkStatus = 'خطأ: $e');
    }
  }

  void _connectSocket() {
    SocketService.connect();
    SocketService.on('connected', (_) {
      if (mounted) {
        SocketService.emit('join_room', {'session_id': widget.sessionId});
      }
    });
    SocketService.on('chat_message', (data) {
      if (mounted) {
        setState(() => _messages.add(Map<String, dynamic>.from(data)));
        Future.delayed(const Duration(milliseconds: 100), () {
          if (_chatScrollController.hasClients) {
            _chatScrollController.animateTo(
              _chatScrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOut,
            );
          }
        });
      }
    });
    SocketService.on('hand_raise', (data) {
      if (mounted) {
        setState(
            () => _handRaised.add(Map<String, dynamic>.from(data)));
      }
    });
    SocketService.on('speak-request', (data) {
      if (mounted) {
        setState(() {
          _speakRequests.add(Map<String, dynamic>.from(data));
        });
      }
    });
  }

  final List<Map<String, dynamic>> _handRaised = [];

  void _sendMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;
    SocketService.emit('send_message', {
      'session_id': widget.sessionId,
      'message': text,
    });
    _chatController.clear();
  }

  void _muteAll() {
    SocketService.emit('mute_all', {'session_id': widget.sessionId});
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
          content: Text('تم كتم الجميع'),
          backgroundColor: AppColors.success),
    );
  }

  void _approveSpeaker(Map<String, dynamic> request) {
    SocketService.emit('approve-speaker', {
      'session_id': widget.sessionId,
      'userId': request['userId'],
    });
    setState(() => _speakRequests.remove(request));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('تمت الموافقة لـ ${request['userName'] ?? 'الطالب'}'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  void _rejectSpeaker(Map<String, dynamic> request) {
    SocketService.emit('reject-speaker', {
      'session_id': widget.sessionId,
      'userId': request['userId'],
    });
    setState(() => _speakRequests.remove(request));
  }

  Future<void> _endSession() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إنهاء الحصة'),
        content: const Text('هل أنت متأكد من إنهاء الحصة؟'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('تراجع')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style:
                ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('إنهاء'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        await ApiService.endSession(widget.sessionId);
        _room?.localParticipant?.setCameraEnabled(false);
        _room?.localParticipant?.setMicrophoneEnabled(false);
        _room?.disconnect();
        SocketService.emit('leave_room', {'session_id': widget.sessionId});
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('تم إنهاء الحصة'),
                backgroundColor: AppColors.success),
          );
          Navigator.pop(context);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('فشل إنهاء الحصة: $e'),
                backgroundColor: AppColors.danger),
          );
        }
      }
    }
  }

  void _toggleRecording() {
    final recording = !_isRecording;
    setState(() => _isRecording = recording);
    if (recording) {
      ApiService.startRecording(widget.sessionId);
    } else {
      ApiService.stopRecording(widget.sessionId);
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
          content: Text(
              recording ? 'تم بدء التسجيل' : 'تم إيقاف التسجيل'),
          backgroundColor: AppColors.success),
    );
  }

  @override
  void dispose() {
    for (final cancel in _lkListeners) {
      cancel();
    }
    _room?.localParticipant?.setCameraEnabled(false);
    _room?.localParticipant?.setMicrophoneEnabled(false);
    _room?.disconnect();
    _chatController.dispose();
    _chatScrollController.dispose();
    SocketService.off('chat_message');
    SocketService.off('hand_raise');
    SocketService.off('speak-request');
    SocketService.off('connected');
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final students = _room?.remoteParticipants.values.toList() ?? [];
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(children: [
          const Text('غرفة الحصة'),
          Text(_lkStatus,
              style: TextStyle(
                  fontSize: 11,
                  color: _lkConnected
                      ? AppColors.success
                      : AppColors.textSecondary)),
        ]),
        actions: [
          IconButton(
            icon: Icon(_micOn ? Icons.mic : Icons.mic_off,
                color: _micOn ? null : AppColors.danger),
            tooltip: 'المايك',
            onPressed: () async {
              _micOn = !_micOn;
              await _room?.localParticipant?.setMicrophoneEnabled(_micOn);
              setState(() {});
            },
          ),
          IconButton(
            icon: Icon(_camOn ? Icons.videocam : Icons.videocam_off,
                color: _camOn ? null : AppColors.danger),
            tooltip: 'الكاميرا',
            onPressed: () async {
              _camOn = !_camOn;
              await _room?.localParticipant?.setCameraEnabled(_camOn);
              setState(() {});
            },
          ),
          IconButton(
            icon: const Icon(Icons.mic_off),
            tooltip: 'كتم الجميع',
            onPressed: _muteAll,
          ),
          IconButton(
            icon: Icon(_isRecording ? Icons.fiber_manual_record : Icons.videocam,
                color: _isRecording ? AppColors.danger : null),
            tooltip: 'تسجيل',
            onPressed: _toggleRecording,
          ),
          IconButton(
            icon: const Icon(Icons.stop, color: AppColors.danger),
            onPressed: _endSession,
            tooltip: 'إنهاء الحصة',
          ),
        ],
      ),
      body: Column(children: [
        if (_speakRequests.isNotEmpty)
          Container(
            height: 56,
            color: AppColors.warning.withValues(alpha: 0.1),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              itemCount: _speakRequests.length,
              itemBuilder: (_, i) {
                final req = _speakRequests[i];
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.warning.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(Icons.pan_tool, size: 16, color: AppColors.warning),
                    const SizedBox(width: 4),
                    Text(req['userName'] ?? 'طالب',
                        style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () => _approveSpeaker(req),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.success,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('موافقة',
                            style: TextStyle(
                                color: Colors.white, fontSize: 11)),
                      ),
                    ),
                    const SizedBox(width: 4),
                    InkWell(
                      onTap: () => _rejectSpeaker(req),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.danger,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text('رفض',
                            style: TextStyle(
                                color: Colors.white, fontSize: 11)),
                      ),
                    ),
                  ]),
                );
              },
            ),
          ),
        Expanded(
          flex: 2,
          child: _lkConnected
              ? _buildVideoGrid(students)
              : Center(
                  child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                    Icon(Icons.videocam,
                        size: 64, color: AppColors.textSecondary),
                    const SizedBox(height: 12),
                    Text(_lkStatus,
                        style: const TextStyle(
                            color: AppColors.textSecondary)),
                  ])),
        ),
        if (_handRaised.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(8),
            color: AppColors.warning.withValues(alpha: 0.1),
            child: Row(children: [
              const Icon(Icons.pan_tool,
                  size: 16, color: AppColors.warning),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'رفع اليد: ${_handRaised.map((h) => h['student_name'] ?? 'طالب').join('، ')}',
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.warning),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ]),
          ),
        Expanded(
          flex: 2,
          child: Column(children: [
            Expanded(
              child: _messages.isEmpty
                  ? const Center(
                      child: Text('لا توجد رسائل بعد',
                          style: TextStyle(
                              color: AppColors.textSecondary)))
                  : ListView.builder(
                      controller: _chatScrollController,
                      padding: const EdgeInsets.all(8),
                      itemCount: _messages.length,
                      itemBuilder: (_, i) {
                        final msg = _messages[i];
                        final isMe = msg['is_me'] == true;
                        return Align(
                          alignment: isMe
                              ? Alignment.centerLeft
                              : Alignment.centerRight,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: isMe
                                  ? AppColors.primary
                                      .withValues(alpha: 0.1)
                                  : AppColors.surface,
                              borderRadius:
                                  BorderRadius.circular(10),
                            ),
                            child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  if (msg['sender_name'] != null)
                                    Text(msg['sender_name'],
                                        style: const TextStyle(
                                            fontSize: 10,
                                            color: AppColors
                                                .textSecondary)),
                                  Text(msg['message'] ?? '',
                                      style:
                                          const TextStyle(fontSize: 13)),
                                ]),
                          ),
                        );
                      },
                    ),
            ),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border(
                    top: BorderSide(color: AppColors.border)),
              ),
              padding: const EdgeInsets.symmetric(
                  horizontal: 8, vertical: 4),
              child: SafeArea(
                top: false,
                child: Row(children: [
                  Expanded(
                    child: TextField(
                      controller: _chatController,
                      decoration: const InputDecoration(
                        hintText: 'اكتب رسالة...',
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 10, vertical: 8),
                        border: OutlineInputBorder(
                            borderSide: BorderSide.none),
                        filled: true,
                        fillColor: AppColors.background,
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send,
                        size: 20, color: AppColors.primary),
                    onPressed: _sendMessage,
                  ),
                ]),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _buildVideoGrid(List<RemoteParticipant> students) {
    final tiles = <Widget>[];
    if (_localVideo != null) {
      tiles.add(Expanded(
          child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: VideoTrackRenderer(_localVideo!, fit: VideoViewFit.cover),
      )));
    }
    for (final s in students) {
      for (final pub in s.videoTrackPublications) {
        if (pub.track is VideoTrack) {
          tiles.add(Expanded(
              child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: VideoTrackRenderer(pub.track as VideoTrack,
                fit: VideoViewFit.contain),
          )));
        }
      }
    }
    if (tiles.isEmpty) {
      return Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.videocam,
              size: 64, color: AppColors.textSecondary),
          const SizedBox(height: 12),
          const Text('البث المباشر',
              style: TextStyle(color: AppColors.textSecondary)),
        ]),
      );
    }
    return Padding(
      padding: const EdgeInsets.all(6),
      child: Column(children: [
        Expanded(
            child: Row(
                children: tiles.length >= 2
                    ? [tiles[0], const SizedBox(width: 4), tiles[1]]
                    : [tiles[0]])),
        if (tiles.length > 2)
          ...[
            const SizedBox(height: 4),
            Expanded(
                child: Row(children: [
              for (final t in tiles.skip(2))
                ...[t, const SizedBox(width: 4)]
            ].toList()))
          ],
      ]),
    );
  }
}
