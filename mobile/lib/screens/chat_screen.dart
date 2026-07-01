import 'package:flutter/material.dart';
import '../services/socket_service.dart';
import '../theme/app_theme.dart';
import '../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class ChatScreen extends StatefulWidget {
  final String type;
  final String? roomId;
  final String? targetName;
  const ChatScreen({super.key, required this.type, this.roomId, this.targetName});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _msgCtrl = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initSocket();
    _loadMessages();
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    super.dispose();
  }

  void _initSocket() {
    SocketService.on('chat_message', (data) {
      if (!mounted) return;
      setState(() => _messages.add(Map<String, dynamic>.from(data)));
    });
  }

  Future<void> _loadMessages() async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  void _sendMessage() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    final msg = {'text': text, 'role': 'user', 'timestamp': DateTime.now().toIso8601String()};
    setState(() => _messages.add(msg));
    _msgCtrl.clear();
    SocketService.emit('chat_message', {'text': text, 'room': widget.roomId ?? widget.type});
  }

  @override
  Widget build(BuildContext context) {
    final role = context.watch<AuthProvider>().user?.role ?? '';
    return Scaffold(
      appBar: AppBar(
        title: Row(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              widget.type == 'teacher' ? Icons.school : widget.type == 'support' ? Icons.support_agent : Icons.group,
              size: 18, color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(widget.targetName ?? _getTitle(), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            Text(_getSubtitle(), style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ]),
        ]),
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty
                    ? Center(
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(Icons.chat_bubble_outline, size: 64, color: AppColors.textTertiary),
                          const SizedBox(height: 16),
                          Text('ابدأ المحادثة', style: AppTheme.body),
                        ]),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (_, i) => _buildBubble(_messages[i], role),
                      ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: SafeArea(
              top: false,
              child: Row(children: [
                Expanded(
                  child: TextField(
                    controller: _msgCtrl,
                    decoration: InputDecoration(
                      hintText: 'اكتب رسالة...',
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                      filled: true,
                      fillColor: AppColors.surfaceVariant,
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primary),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white, size: 20),
                    onPressed: _sendMessage,
                  ),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBubble(Map<String, dynamic> msg, String role) {
    final isUser = msg['role'] == 'user';
    return Align(
      alignment: isUser ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : AppColors.surfaceVariant,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: isUser ? const Radius.circular(4) : const Radius.circular(18),
            bottomRight: isUser ? const Radius.circular(18) : const Radius.circular(4),
          ),
        ),
        child: Text(
          msg['text'] ?? '',
          style: TextStyle(color: isUser ? Colors.white : null, fontSize: 15),
        ),
      ),
    );
  }

  String _getTitle() {
    switch (widget.type) {
      case 'teacher': return 'المدرس';
      case 'support': return 'الدعم الفني';
      case 'group': return 'المجموعة';
      default: return 'المحادثة';
    }
  }

  String _getSubtitle() {
    switch (widget.type) {
      case 'teacher': return 'متصل';
      case 'support': return 'نحن هنا لمساعدتك';
      case 'group': return 'جميع الطلاب';
      default: return '';
    }
  }
}
