import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class ChatMessage {
  final String role;
  final String content;
  final DateTime timestamp;
  ChatMessage({required this.role, required this.content, DateTime? timestamp})
    : timestamp = timestamp ?? DateTime.now();
}

class AiProvider extends ChangeNotifier {
  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _error;

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> sendMessage(String text) async {
    _messages.add(ChatMessage(role: 'user', content: text));
    _isLoading = true;
    notifyListeners();

    try {
      final res = await ApiService.aiChat(text);
      if (res['success'] == true) {
        final reply = res['data']?['reply'] ?? res['message'] ?? '';
        _messages.add(ChatMessage(role: 'assistant', content: reply));
      } else {
        _messages.add(ChatMessage(role: 'assistant', content: 'عذراً، حدث خطأ في المساعد الذكي'));
      }
    } catch (e) {
      _messages.add(ChatMessage(role: 'assistant', content: 'عذراً، تعذر الاتصال بالمساعد الذكي'));
    }
    _isLoading = false;
    notifyListeners();
  }

  void clear() {
    _messages.clear();
    notifyListeners();
  }
}
