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
  static String _baseUrl = 'http://10.0.2.2:4000/api/v1';

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
        response = await http.post(
          url,
          headers: _headers(auth: auth, token: token),
          body: body != null ? jsonEncode(body) : null,
        );
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

  // ── Auth ──────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _request('POST', '/auth/login', body: {
      'email': email,
      'password': password,
    }, auth: false);
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

    final res = await _request('POST', '/auth/verify-otp', body: {
      'otp': otp,
      'tempToken': tempToken,
    }, auth: false);

    if (res['success'] == true && res['data'] != null) {
      final accessToken = res['data']['accessToken'];
      if (accessToken != null) await _setToken(accessToken);
    }
    return res;
  }

  static Future<void> logout() async {
    try {
      await _request('POST', '/auth/logout');
    } catch (_) {}
    await _setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('temp_token');
    await prefs.remove('user_data');
  }

  static Future<Map<String, dynamic>> getMe() async {
    return _request('GET', '/auth/me');
  }

  // ── Student Register ──────────────────────────────────────────

  static Future<Map<String, dynamic>> registerStudent(Map<String, dynamic> data) async {
    return _request('POST', '/auth/register', body: data, auth: false);
  }

  // ── Parent ─────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> parentRegister(Map<String, dynamic> data) async {
    return _request('POST', '/parent/register', body: data, auth: false);
  }

  static Future<Map<String, dynamic>> parentDashboard() async {
    return _request('GET', '/parent/dashboard');
  }

  static Future<Map<String, dynamic>> parentLinkStudent(String studentCode) async {
    return _request('POST', '/parent/link-student', body: {'studentCode': studentCode});
  }

  // ── Sessions ──────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getSessions() async {
    return _request('GET', '/sessions');
  }

  // ── Certificates ──────────────────────────────────────────────

  static Future<Map<String, dynamic>> verifyCertificate(String code) async {
    return _request('GET', '/certificates/verify/$code', auth: false);
  }

  static Future<Map<String, dynamic>> myCertificates() async {
    return _request('GET', '/certificates/my');
  }

  // ── Wallet ────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getWallet() async {
    return _request('GET', '/wallet');
  }

  static Future<Map<String, dynamic>> getWalletTransactions() async {
    return _request('GET', '/wallet/transactions');
  }

  // ── Exams ─────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> getExams() async {
    return _request('GET', '/exams');
  }

  static Future<Map<String, dynamic>> getMyAttempts() async {
    return _request('GET', '/exams/my/attempts');
  }

  // ── Notifications ─────────────────────────────────────────────

  static Future<Map<String, dynamic>> getNotifications() async {
    return _request('GET', '/notifications');
  }
}
