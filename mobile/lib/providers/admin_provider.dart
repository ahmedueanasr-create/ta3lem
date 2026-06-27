import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/session.dart';
import '../models/subject.dart' show Subject;
import '../models/teacher.dart' show TeacherProfile;

class AdminProvider extends ChangeNotifier {
  List<Session> _sessions = [];
  List<TeacherProfile> _teachers = [];
  List<Subject> _subjects = [];
  bool _isLoading = false;
  String? _error;

  List<Session> get sessions => _sessions;
  List<TeacherProfile> get teachers => _teachers;
  List<Subject> get subjects => _subjects;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadSessions() async {
    _isLoading = true;
    try {
      final res = await ApiService.getSessions();
      final data = res['data'];
      if (data is List) {
        _sessions = data.map((s) => Session.fromJson(s)).toList();
      } else if (data is Map && data['rows'] != null) {
        _sessions = (data['rows'] as List).map((s) => Session.fromJson(s)).toList();
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadTeachers() async {
    _isLoading = true;
    try {
      final res = await ApiService.getTeachers();
      final data = res['data'];
      if (data is List) {
        _teachers = data.map((t) => TeacherProfile.fromJson(t)).toList();
      } else if (data is Map && data['rows'] != null) {
        _teachers = (data['rows'] as List).map((t) => TeacherProfile.fromJson(t)).toList();
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> approveTeacher(int id) async {
    try {
      await ApiService.updateUser(id, {'status': 'approved'});
      await loadTeachers();
      return true;
    } catch (_) { return false; }
  }

  Future<bool> suspendTeacherUser(int id) async {
    try {
      await ApiService.updateUser(id, {'status': 'suspended'});
      await loadTeachers();
      return true;
    } catch (_) { return false; }
  }

  Future<void> loadSubjects() async {
    try {
      final res = await ApiService.getSubjects();
      final data = res['data'];
      if (data is List) {
        _subjects = data.map((s) => Subject.fromJson(s)).toList();
      } else if (data is Map && data['rows'] != null) {
        _subjects = (data['rows'] as List).map((s) => Subject.fromJson(s)).toList();
      }
    } catch (_) {}
    notifyListeners();
  }

  Future<bool> createSubject(Map<String, dynamic> data) async {
    try {
      await ApiService.createSubject(data);
      await loadSubjects();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }
}
