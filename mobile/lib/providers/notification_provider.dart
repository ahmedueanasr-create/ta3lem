import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/notification_model.dart';

class NotificationProvider extends ChangeNotifier {
  List<AppNotification> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;

  List<AppNotification> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;

  Future<void> loadNotifications() async {
    _isLoading = true;
    try {
      final res = await ApiService.getNotifications();
      if (res['success'] == true) {
        final data = res['data'];
        if (data is List) {
          _notifications = data.map((n) => AppNotification.fromJson(n)).toList();
          _unreadCount = _notifications.where((n) => !n.read).length;
        }
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> markRead(int id) async {
    try {
      await ApiService.markNotificationRead(id);
      await loadNotifications();
    } catch (_) {}
  }
}
