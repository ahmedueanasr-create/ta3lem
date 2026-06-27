import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/session.dart';

class SessionProvider extends ChangeNotifier {
  List<Session> _sessions = [];
  Session? _currentSession;
  bool _isLoading = false;
  String? _error;

  List<Session> get sessions => _sessions;
  Session? get currentSession => _currentSession;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadSessions() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await ApiService.getSessions();
      final data = res['data'];
      if (data is List) {
        _sessions = data.map((s) => Session.fromJson(s)).toList();
      } else if (data is Map && data['rows'] != null) {
        _sessions = (data['rows'] as List).map((s) => Session.fromJson(s)).toList();
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'خطأ: $e';
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<Map<String, dynamic>?> joinSession(int sessionId) async {
    try {
      final res = await ApiService.joinSession(sessionId);
      return res['data'];
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> joinAsObserver(int sessionId) async {
    try {
      final res = await ApiService.joinAsObserver(sessionId);
      return res['data'];
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<Map<String, dynamic>?> startSession(int sessionId) async {
    try {
      final res = await ApiService.startSession(sessionId);
      return res['data'];
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<bool> enrollSession(int sessionId) async {
    try {
      await ApiService.enrollSession(sessionId);
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  void setCurrentSession(Session? s) {
    _currentSession = s;
    notifyListeners();
  }
}
