import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/ai_provider.dart';
import '../theme/app_theme.dart';

class AiTutorScreen extends StatefulWidget {
  const AiTutorScreen({super.key});

  @override
  State<AiTutorScreen> createState() => _AiTutorScreenState();
}

class _AiTutorScreenState extends State<AiTutorScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    context.read<AiProvider>().sendMessage(text);
    _controller.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 200), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AiProvider>();
    return Scaffold(
      appBar: AppBar(
        title: const Text('المساعد الذكي'),
        actions: [
          if (provider.messages.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () {
                context.read<AiProvider>().clear();
              },
              tooltip: 'مسح المحادثة',
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: provider.messages.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.smart_toy, size: 72, color: AppColors.primary),
                        SizedBox(height: 16),
                        Text('المساعد الذكي', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                        SizedBox(height: 8),
                        Text('يمكنك سؤالي عن أي شيء', style: TextStyle(color: AppColors.textSecondary)),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.messages.length + (provider.isLoading ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == provider.messages.length && provider.isLoading) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 12),
                          child: Row(
                            children: [
                              SizedBox(width: 48),
                              SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                            ],
                          ),
                        );
                      }
                      final msg = provider.messages[index];
                      final isUser = msg.role == 'user';
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!isUser) ...[
                              const CircleAvatar(
                                radius: 16,
                                backgroundColor: AppColors.primary,
                                child: Icon(Icons.smart_toy, size: 18, color: Colors.white),
                              ),
                              const SizedBox(width: 8),
                            ],
                            Flexible(
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: isUser ? AppColors.primary : AppColors.cardBackground,
                                  borderRadius: BorderRadius.only(
                                    topLeft: const Radius.circular(16),
                                    topRight: const Radius.circular(16),
                                    bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
                                    bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                                  ),
                                  border: !isUser ? Border.all(color: AppColors.border) : null,
                                ),
                                child: Text(
                                  msg.content,
                                  style: TextStyle(
                                    color: isUser ? Colors.white : AppColors.textPrimary,
                                    fontSize: 15,
                                  ),
                                ),
                              ),
                            ),
                            if (isUser) ...[
                              const SizedBox(width: 8),
                              const CircleAvatar(
                                radius: 16,
                                backgroundColor: AppColors.secondary,
                                child: Icon(Icons.person, size: 18, color: Colors.white),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: AppColors.cardBackground,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      decoration: const InputDecoration(
                        hintText: 'اكتب سؤالك...',
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(borderSide: BorderSide.none),
                        filled: true,
                        fillColor: AppColors.background,
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: AppColors.primary,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 20),
                      onPressed: provider.isLoading ? null : _sendMessage,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
