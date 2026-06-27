import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:livekit_client/livekit_client.dart' hide ChatMessage;
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../models/chat_message.dart';
import '../theme/app_theme.dart';

class StudentLiveRoomScreen extends StatefulWidget {
  final int sessionId;
  const StudentLiveRoomScreen({super.key, required this.sessionId});

  @override
  State<StudentLiveRoomScreen> createState() => _StudentLiveRoomScreenState();
}

class _StudentLiveRoomScreenState extends State<StudentLiveRoomScreen> {
  final _chatController = TextEditingController();
  final _chatScrollController = ScrollController();
  final List<ChatMessage> _chatMessages = [];
  List<Map<String, dynamic>> _participants = [];
  String _socketStatus = 'connecting';
  String _liveKitStatus = 'جاري الاتصال...';
  bool _handRaised = false;
  bool _canSpeak = false;
  bool _isMuted = true;
  bool _cameraOn = false;

  Room? _room;
  VideoTrack? _teacherVideo;
  bool _lkConnected = false;
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
      final res = await ApiService.joinSession(widget.sessionId);
      final data = res['data'];
      if (data == null) {
        setState(() => _liveKitStatus = 'فشل الاتصال');
        return;
      }
      final url = data['livekitUrl'] ?? 'wss://3lm.zaadllc.com';
      final token = data['token'] as String;
      final room = Room(
        roomOptions: const RoomOptions(adaptiveStream: true, dynacast: true),
      );
      _lkListeners.add(room.events.on<TrackSubscribedEvent>((e) {
        if (e.track is VideoTrack && mounted) {
          setState(() => _teacherVideo = e.track as VideoTrack);
        }
      }));
      _lkListeners.add(room.events.on<TrackUnsubscribedEvent>((e) {
        if (e.track == _teacherVideo && mounted) {
          setState(() => _teacherVideo = null);
        }
      }));
      _lkListeners.add(room.events.on<RoomDisconnectedEvent>((_) {
        if (mounted) setState(() => _lkConnected = false);
      }));
      for (final p in room.remoteParticipants.values) {
        for (final pub in p.videoTrackPublications) {
          if (pub.track is VideoTrack) {
            _teacherVideo = pub.track as VideoTrack;
          }
        }
      }
      await room.connect(url, token,
          connectOptions: const ConnectOptions(autoSubscribe: true));
      _room = room;
      if (mounted) {
        setState(() {
          _lkConnected = true;
          _liveKitStatus = 'متصل';
        });
      }
    } catch (e) {
      if (mounted) setState(() => _liveKitStatus = 'خطأ: $e');
    }
  }

  void _connectSocket() {
    SocketService.connect();
    SocketService.emit('join-room', {'sessionId': widget.sessionId});
    SocketService.on('room-joined', (_) =>
        mounted ? setState(() => _socketStatus = 'connected') : null);
    SocketService.on('participants', (data) {
      if (data is List && mounted) {
        setState(() => _participants = data.cast<Map<String, dynamic>>());
      }
    });
    SocketService.on('chat-message', (data) {
      if (data is Map<String, dynamic> && mounted) {
        setState(() {
          _chatMessages.add(ChatMessage.fromJson(data));
        });
        _scrollToBottom();
      }
    });
    SocketService.on('hand-raise', (data) {
      if (data is Map<String, dynamic> && mounted) {
        setState(() {
          _participants = _participants.map((p) {
            if (p['userId'] == data['userId']) {
              return {...p, 'handRaised': data['raised']};
            }
            return p;
          }).toList();
        });
      }
    });
    SocketService.on('speaker-approved', (_) {
      if (mounted) {
        setState(() => _canSpeak = true);
        _room?.localParticipant?.setMicrophoneEnabled(true);
      }
    });
    SocketService.on('speaker-rejected', (_) {
      if (mounted) {
        setState(() => _canSpeak = false);
      }
    });
    SocketService.on('disconnect', (_) {
      if (mounted) setState(() => _socketStatus = 'disconnected');
    });
  }

  void _scrollToBottom() {
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

  void _sendMessage() {
    final text = _chatController.text.trim();
    if (text.isEmpty) return;
    final user = context.read<AuthProvider>().user;
    SocketService.emit('chat-message', {
      'sessionId': widget.sessionId,
      'text': text,
      'userName': user?.name ?? '',
    });
    _chatController.clear();
  }

  void _toggleHandRaise() {
    _handRaised = !_handRaised;
    SocketService.emit('hand-raise', {
      'sessionId': widget.sessionId,
      'raised': _handRaised,
    });
  }

  void _requestSpeak() {
    SocketService.emit('speak-request', {
      'sessionId': widget.sessionId,
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('تم طلب التحدث، في انتظار موافقة المدرس'),
        backgroundColor: AppColors.warning,
      ),
    );
  }

  void _leaveRoom() {
    _room?.disconnect();
    SocketService.emit('leave-room', {'sessionId': widget.sessionId});
    Navigator.pop(context);
  }

  @override
  void dispose() {
    for (final cancel in _lkListeners) {
      cancel();
    }
    _room?.disconnect();
    SocketService.off('room-joined');
    SocketService.off('participants');
    SocketService.off('chat-message');
    SocketService.off('hand-raise');
    SocketService.off('speaker-approved');
    SocketService.off('speaker-rejected');
    _chatController.dispose();
    _chatScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('غرفة الحصة'),
        actions: [
          _statusBadge(_socketStatus, _socketStatus == 'connected'),
          const SizedBox(width: 4),
          _statusBadge(_liveKitStatus, _lkConnected),
        ],
      ),
      body: Row(children: [
        Expanded(
          flex: 3,
          child: Column(children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (_lkConnected && _teacherVideo != null)
                    VideoTrackRenderer(
                      _teacherVideo!,
                      fit: VideoViewFit.contain,
                    )
                  else
                    Container(
                      color: Colors.black87,
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.videocam,
                                size: 56, color: Colors.white38),
                            const SizedBox(height: 8),
                            Text(_liveKitStatus,
                                style: const TextStyle(
                                    color: Colors.white54, fontSize: 14)),
                          ],
                        ),
                      ),
                    ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.7),
                          ],
                        ),
                      ),
                      child: Row(children: [
                        _controlButton(
                          icon: _cameraOn
                              ? Icons.videocam
                              : Icons.videocam_off,
                          color: _cameraOn
                              ? Colors.white70
                              : AppColors.danger,
                          onPressed: () async {
                            _cameraOn = !_cameraOn;
                            await _room?.localParticipant
                                ?.setCameraEnabled(_cameraOn);
                            setState(() {});
                          },
                        ),
                        const SizedBox(width: 8),
                        _controlButton(
                          icon: _canSpeak
                              ? (_isMuted
                                  ? Icons.mic_off
                                  : Icons.mic)
                              : Icons.mic_off,
                          color: !_canSpeak
                              ? Colors.grey
                              : _isMuted
                                  ? AppColors.danger
                                  : Colors.greenAccent,
                          onPressed: _canSpeak
                              ? () async {
                                  _isMuted = !_isMuted;
                                  await _room?.localParticipant
                                      ?.setMicrophoneEnabled(
                                          !_isMuted);
                                  setState(() {});
                                }
                              : _requestSpeak,
                        ),
                        const Spacer(),
                        if (_canSpeak)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.greenAccent
                                  .withValues(alpha: 0.2),
                              borderRadius:
                                  BorderRadius.circular(4),
                            ),
                            child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.headset,
                                      size: 14,
                                      color: Colors.greenAccent),
                                  SizedBox(width: 4),
                                  Text('متحدث',
                                      style: TextStyle(
                                          fontSize: 11,
                                          color:
                                              Colors.greenAccent)),
                                ]),
                          ),
                        const SizedBox(width: 8),
                        _controlButton(
                          icon: Icons.pan_tool,
                          color: _handRaised
                              ? AppColors.warning
                              : Colors.white70,
                          onPressed: _toggleHandRaise,
                        ),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 160,
              child: _chatMessages.isEmpty
                  ? const Center(
                      child: Text('لا توجد رسائل بعد',
                          style: TextStyle(
                              color: AppColors.textSecondary)))
                  : ListView.builder(
                      controller: _chatScrollController,
                      padding: const EdgeInsets.all(8),
                      itemCount: _chatMessages.length,
                      itemBuilder: (_, i) {
                        final msg = _chatMessages[i];
                        return Padding(
                          padding:
                              const EdgeInsets.only(bottom: 6),
                          child: Row(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  radius: 10,
                                  backgroundColor:
                                      AppColors.primary,
                                  child: Text(
                                    (msg.userName ?? '?')[0],
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment
                                              .start,
                                      children: [
                                        Text(msg.userName ?? '',
                                            style: const TextStyle(
                                                fontSize: 11,
                                                fontWeight:
                                                    FontWeight
                                                        .w600)),
                                        Container(
                                          margin:
                                              const EdgeInsets.only(
                                                  top: 2),
                                          padding:
                                              const EdgeInsets
                                                  .all(8),
                                          decoration:
                                              BoxDecoration(
                                            color: AppColors
                                                .cardBackground,
                                            borderRadius:
                                                BorderRadius
                                                    .circular(10),
                                          ),
                                          child: Text(msg.text,
                                              style: const TextStyle(
                                                  fontSize:
                                                      13)),
                                        ),
                                      ]),
                                ),
                              ]),
                        );
                      },
                    ),
            ),
            Container(
              decoration: BoxDecoration(
                color: AppColors.cardBackground,
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
                  IconButton(
                    icon: const Icon(Icons.exit_to_app,
                        size: 20, color: AppColors.danger),
                    onPressed: _leaveRoom,
                    tooltip: 'مغادرة',
                  ),
                ]),
              ),
            ),
          ]),
        ),
        Container(
          width: 72,
          color: AppColors.cardBackground,
          child: Column(children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Text('${_participants.length}',
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 13)),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                itemCount: _participants.length,
                itemBuilder: (_, i) {
                  final p = _participants[i];
                  final raised = p['handRaised'] == true;
                  return Container(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Column(children: [
                      CircleAvatar(
                        radius: 14,
                        backgroundColor: AppColors.primary,
                        child: Text(
                          (p['userName'] ?? '?').toString()[0],
                          style: const TextStyle(
                              color: Colors.white, fontSize: 11),
                        ),
                      ),
                      if (raised)
                        const Icon(Icons.pan_tool,
                            size: 12, color: AppColors.warning),
                      Text(
                        (p['userName'] ?? '')
                            .toString()
                            .split(' ')
                            .first,
                        style: const TextStyle(fontSize: 9),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ]),
                  );
                },
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _controlButton({
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.4),
        shape: BoxShape.circle,
      ),
      child: IconButton(
        icon: Icon(icon, size: 20, color: color),
        onPressed: onPressed,
        constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
        padding: EdgeInsets.zero,
      ),
    );
  }

  Widget _statusBadge(String text, bool connected) {
    final color =
        connected ? AppColors.success : AppColors.textSecondary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(
          connected ? Icons.wifi : Icons.wifi_off,
          size: 11,
          color: color,
        ),
        const SizedBox(width: 3),
        Text(text,
            style: TextStyle(fontSize: 10, color: color)),
      ]),
    );
  }
}
