import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiException implements Exception {
  final int statusCode;
  final String message;
  final Map<String, dynamic>? details;
  ApiException(this.statusCode, this.message, [this.details]);
  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiService {
  static const String _baseUrlKey = 'base_url';
  static String _baseUrl = 'https://3lm.zaadllc.com/api/v1';

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(_baseUrlKey);
    if (saved != null) _baseUrl = saved;
  }

  static Future<void> setBaseUrl(String url) async {
    _baseUrl = url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_baseUrlKey, url);
  }

  static String get baseUrl => _baseUrl;

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }

  static Future<void> _setToken(String? token) async {
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString('access_token', token);
    } else {
      await prefs.remove('access_token');
    }
  }

  static Map<String, String> _headers({bool auth = true, String? token}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth) {
      final t = token;
      if (t != null) headers['Authorization'] = 'Bearer $t';
    }
    return headers;
  }

  static Future<Map<String, dynamic>> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool auth = true,
    String? overrideToken,
  }) async {
    final token = overrideToken ?? await _getToken();
    final url = Uri.parse('$_baseUrl$path');
    late http.Response response;

    switch (method) {
      case 'GET':
        response = await http.get(url, headers: _headers(auth: auth, token: token));
        break;
      case 'POST':
        response = await http.post(url, headers: _headers(auth: auth, token: token), body: body != null ? jsonEncode(body) : null);
        break;
      case 'PUT':
        response = await http.put(url, headers: _headers(auth: auth, token: token), body: body != null ? jsonEncode(body) : null);
        break;
      case 'DELETE':
        response = await http.delete(url, headers: _headers(auth: auth, token: token));
        break;
      default:
        throw ApiException(400, 'Unsupported method: $method');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 400) {
      throw ApiException(response.statusCode, data['message'] ?? 'Unknown error', data['details']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> uploadFile(String path, String filePath) async {
    final token = await _getToken();
    final uri = Uri.parse('$_baseUrl$path');
    final request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(await http.MultipartFile.fromPath('file', filePath));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 400) {
      throw ApiException(response.statusCode, data['message'] ?? 'Upload failed');
    }
    return data;
  }

  // ── Auth ────────────────────────────────────────────────
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _request('POST', '/auth/login', body: {'email': email, 'password': password}, auth: false);
    if (res['success'] == true && res['data'] != null) {
      final tempToken = res['data']['tempToken'];
      if (tempToken != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('temp_token', tempToken);
      }
    }
    return res;
  }

  static Future<Map<String, dynamic>> verifyOtp(String otp) async {
    final prefs = await SharedPreferences.getInstance();
    final tempToken = prefs.getString('temp_token');
    if (tempToken == null) throw ApiException(400, 'No temp token');
    final res = await _request('POST', '/auth/verify-otp', body: {'otp': otp, 'tempToken': tempToken}, auth: false);
    if (res['success'] == true && res['data'] != null) {
      final accessToken = res['data']['accessToken'];
      if (accessToken != null) await _setToken(accessToken);
    }
    return res;
  }

  static Future<void> logout() async {
    try { await _request('POST', '/auth/logout'); } catch (_) {}
    await _setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('temp_token');
    await prefs.remove('user_data');
  }

  static Future<Map<String, dynamic>> getMe() => _request('GET', '/auth/me');
  static Future<Map<String, dynamic>> registerStudent(Map<String, dynamic> data) => _request('POST', '/auth/register', body: data, auth: false);
  static Future<Map<String, dynamic>> changePassword(Map<String, dynamic> data) => _request('POST', '/auth/change-password', body: data);

  // ── Parent ──────────────────────────────────────────────
  static Future<Map<String, dynamic>> parentRegister(Map<String, dynamic> data) => _request('POST', '/parent/register', body: data, auth: false);
  static Future<Map<String, dynamic>> parentDashboard() => _request('GET', '/parent/dashboard');
  static Future<Map<String, dynamic>> parentLinkStudent(String code) => _request('POST', '/parent/link-student', body: {'studentCode': code});
  static Future<Map<String, dynamic>> parentPayments() => _request('GET', '/parent/payments');

  // ── Sessions ────────────────────────────────────────────
  static Future<Map<String, dynamic>> getSessions() => _request('GET', '/sessions');
  static Future<Map<String, dynamic>> getSession(int id) => _request('GET', '/sessions/$id');
  static Future<Map<String, dynamic>> createSession(Map<String, dynamic> data) => _request('POST', '/sessions', body: data);
  static Future<Map<String, dynamic>> startSession(int id) => _request('POST', '/sessions/$id/start');
  static Future<Map<String, dynamic>> endSession(int id) => _request('POST', '/sessions/$id/end');
  static Future<Map<String, dynamic>> joinSession(int id) => _request('POST', '/sessions/$id/join');
  static Future<Map<String, dynamic>> joinAsObserver(int id) => _request('POST', '/sessions/$id/join-as-observer');
  static Future<Map<String, dynamic>> enrollSession(int id) => _request('POST', '/sessions/$id/enroll');
  static Future<Map<String, dynamic>> cancelSession(int id, {String? reason}) => _request('POST', '/sessions/$id/cancel', body: reason != null ? {'reason': reason} : null);
  static Future<Map<String, dynamic>> rateSession(int id, int rating, {String? comment}) => _request('POST', '/sessions/$id/rate', body: {'rating': rating, if (comment != null) 'comment': comment});
  static Future<Map<String, dynamic>> getSessionRecordings(int id) => _request('GET', '/sessions/$id/recordings');
  static Future<Map<String, dynamic>> toggleLock(int id, bool locked) => _request('POST', '/sessions/$id/lock', body: {'locked': locked});
  static Future<Map<String, dynamic>> startRecording(int id) => _request('POST', '/sessions/$id/recording/start');
  static Future<Map<String, dynamic>> stopRecording(int id) => _request('POST', '/sessions/$id/recording/stop');
  static Future<Map<String, dynamic>> forceEndSession(int id) => _request('POST', '/sessions/$id/force-end');
  static Future<Map<String, dynamic>> banUser(int id, int userId, {String? reason}) => _request('POST', '/sessions/$id/ban-user', body: {'user_id': userId, if (reason != null) 'reason': reason});
  static Future<Map<String, dynamic>> suspendTeacher(int id) => _request('POST', '/sessions/$id/suspend-teacher');
  static Future<Map<String, dynamic>> createReport(int id, Map<String, dynamic> data) => _request('POST', '/sessions/$id/report', body: data);
  static Future<Map<String, dynamic>> getReports(int id) => _request('GET', '/sessions/$id/reports');

  // ── Exams ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> getExams() => _request('GET', '/exams');
  static Future<Map<String, dynamic>> getExam(int id) => _request('GET', '/exams/$id');
  static Future<Map<String, dynamic>> createExam(Map<String, dynamic> data) => _request('POST', '/exams', body: data);
  static Future<Map<String, dynamic>> startAttempt(int examId) => _request('POST', '/exams/$examId/start');
  static Future<Map<String, dynamic>> submitAnswer(int attemptId, Map<String, dynamic> data) => _request('POST', '/exams/attempts/$attemptId/answer', body: data);
  static Future<Map<String, dynamic>> finishAttempt(int attemptId) => _request('POST', '/exams/attempts/$attemptId/finish');
  static Future<Map<String, dynamic>> getAttempt(int attemptId) => _request('GET', '/exams/attempts/$attemptId');
  static Future<Map<String, dynamic>> getMyAttempts() => _request('GET', '/exams/my/attempts');

  // ── Homework ────────────────────────────────────────────
  static Future<Map<String, dynamic>> getHomework() => _request('GET', '/homework');
  static Future<Map<String, dynamic>> getHomeworkDetail(int id) => _request('GET', '/homework/$id');
  static Future<Map<String, dynamic>> createHomework(Map<String, dynamic> data) => _request('POST', '/homework', body: data);
  static Future<Map<String, dynamic>> submitHomework(int id, String filePath) => uploadFile('/homework/$id/submit', filePath);

  // ── Wallet ──────────────────────────────────────────────
  static Future<Map<String, dynamic>> getWallet() => _request('GET', '/wallet');
  static Future<Map<String, dynamic>> getWalletTransactions() => _request('GET', '/wallet/transactions');

  // ── Notifications ───────────────────────────────────────
  static Future<Map<String, dynamic>> getNotifications({bool unreadOnly = false}) => _request('GET', '/notifications${unreadOnly ? '?unread=true' : ''}');
  static Future<Map<String, dynamic>> markNotificationRead(int id) => _request('POST', '/notifications/$id/read');

  // ── AI Tutor ────────────────────────────────────────────
  static Future<Map<String, dynamic>> aiChat(String message, {String? sessionId}) => _request('POST', '/ai/tutor/chat', body: {'message': message, if (sessionId != null) 'session_id': sessionId});

  // ── Certificates ────────────────────────────────────────
  static Future<Map<String, dynamic>> verifyCertificate(String code) => _request('GET', '/certificates/verify/$code', auth: false);
  static Future<Map<String, dynamic>> myCertificates() => _request('GET', '/certificates/my');

  // ── Teachers ────────────────────────────────────────────
  static Future<Map<String, dynamic>> getTeachers() => _request('GET', '/teachers');
  static Future<Map<String, dynamic>> getTeacherProfile(int id) => _request('GET', '/teachers/$id');
  static Future<Map<String, dynamic>> updateTeacherProfile(Map<String, dynamic> data) => _request('PUT', '/teachers/profile', body: data);
  static Future<Map<String, dynamic>> getTeacherEarnings() => _request('GET', '/teachers/earnings');

  // ── Courses ─────────────────────────────────────────────
  static Future<Map<String, dynamic>> getCourses() => _request('GET', '/courses');
  static Future<Map<String, dynamic>> createCourse(Map<String, dynamic> data) => _request('POST', '/courses', body: data);

  // ── Subjects ────────────────────────────────────────────
  static Future<Map<String, dynamic>> getSubjects() => _request('GET', '/subjects');
  static Future<Map<String, dynamic>> createSubject(Map<String, dynamic> data) => _request('POST', '/subjects', body: data);

  // ── Admin ───────────────────────────────────────────────
  static Future<Map<String, dynamic>> getUsers({int page = 1}) => _request('GET', '/users?page=$page');
  static Future<Map<String, dynamic>> getUser(int id) => _request('GET', '/users/$id');
  static Future<Map<String, dynamic>> updateUser(int id, Map<String, dynamic> data) => _request('PUT', '/users/$id', body: data);
  static Future<Map<String, dynamic>> getAdminReports() => _request('GET', '/reports');
  static Future<Map<String, dynamic>> getSettings() => _request('GET', '/settings');
  static Future<Map<String, dynamic>> updateSettings(Map<String, dynamic> data) => _request('PUT', '/settings', body: data);
  static Future<Map<String, dynamic>> getWhatsAppStatus() => _request('GET', '/whatsapp/status');
  static Future<Map<String, dynamic>> sendWhatsAppMessage(Map<String, dynamic> data) => _request('POST', '/whatsapp/send', body: data);
}
