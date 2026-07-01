import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../firebase_options.dart';
import 'api_service.dart';

class FcmService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static String? _currentToken;
  static void Function(Map<String, dynamic>)? onMessageCallback;

  static Future<void> init() async {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('FCM: Permission denied');
      return;
    }

    _currentToken = await _messaging.getToken();
    debugPrint('FCM: Token = $_currentToken');

    if (_currentToken != null) {
      await _registerToken(_currentToken!);
    }

    _messaging.onTokenRefresh.listen((token) {
      _currentToken = token;
      _registerToken(token);
    });

    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    _checkInitialMessage();
  }

  static Future<void> _registerToken(String token) async {
    try {
      await ApiService.registerDeviceToken(token);
    } catch (e) {
      debugPrint('FCM: Failed to register token: $e');
    }
  }

  static void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('FCM: Foreground message: ${message.notification?.title}');
    final data = <String, dynamic>{
      'title': message.notification?.title ?? '',
      'body': message.notification?.body ?? '',
      'data': message.data,
    };
    onMessageCallback?.call(data);
  }

  static void _handleNotificationTap(RemoteMessage message) {
    debugPrint('FCM: Notification tapped: ${message.data}');
  }

  static Future<void> _checkInitialMessage() async {
    final message = await _messaging.getInitialMessage();
    if (message != null) {
      debugPrint('FCM: Initial message: ${message.data}');
    }
  }

  static Future<void> unregisterToken() async {
    if (_currentToken == null) return;
    try {
      await ApiService.unregisterDeviceToken(_currentToken!);
    } catch (e) {
      debugPrint('FCM: Failed to unregister token: $e');
    }
  }
}
