import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:shared_preferences/shared_preferences.dart';

class SocketService {
  static io.Socket? _socket;
  static bool _initialized = false;

  static io.Socket? get socket => _socket;

  static Future<void> connect() async {
    if (_initialized) return;
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    if (token == null) return;

    _socket = io.io('https://3lm.zaadllc.com', <String, dynamic>{
      'path': '/socket',
      'auth': {'token': token},
      'transports': ['websocket'],
      'autoConnect': true,
    });

    _socket!.onConnect((_) {});
    _socket!.onDisconnect((_) {});
    _socket!.onError((data) {});
    _socket!.connect();
    _initialized = true;
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _initialized = false;
  }

  static void emit(String event, [dynamic data]) => _socket?.emit(event, data);
  static void on(String event, Function(dynamic) handler) => _socket?.on(event, handler);
  static void off(String event) => _socket?.off(event);
}
