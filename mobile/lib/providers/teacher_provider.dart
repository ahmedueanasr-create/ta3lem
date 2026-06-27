import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/teacher.dart';
import '../models/session.dart';
import '../models/subject.dart' show Course;

class TeacherProvider extends ChangeNotifier {
  TeacherProfile? _profile;
  List<Session> _mySessions = [];
  List<Course> _myCourses = [];
  EarningsData? _earnings;
  bool _isLoading = false;
  String? _error;

  TeacherProfile? get profile => _profile;
  List<Session> get mySessions => _mySessions;
  List<Course> get myCourses => _myCourses;
  EarningsData? get earnings => _earnings;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadProfile() async {
    try {
      final res = await ApiService.getTeacherProfile(0);
      if (res['success'] == true && res['data'] != null) {
        _profile = TeacherProfile.fromJson(res['data']);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> loadMySessions() async {
    _isLoading = true;
    try {
      final res = await ApiService.getSessions();
      final data = res['data'];
      if (data is List) {
        _mySessions = data.map((s) => Session.fromJson(s)).toList();
      } else if (data is Map && data['rows'] != null) {
        _mySessions = (data['rows'] as List).map((s) => Session.fromJson(s)).toList();
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadCourses() async {
    try {
      final res = await ApiService.getCourses();
      final data = res['data'];
      if (data is List) {
        _myCourses = data.map((c) => Course.fromJson(c)).toList();
      } else if (data is Map && data['rows'] != null) {
        _myCourses = (data['rows'] as List).map((c) => Course.fromJson(c)).toList();
      }
    } catch (_) {}
    notifyListeners();
  }

  Future<void> loadEarnings() async {
    try {
      final res = await ApiService.getTeacherEarnings();
      if (res['success'] == true && res['data'] != null) {
        _earnings = EarningsData.fromJson(res['data']);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<bool> createSession(Map<String, dynamic> data) async {
    try {
      await ApiService.createSession(data);
      await loadMySessions();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }
}
