import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../models/user.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  bool _requiresOtp = false;
  String? _devOtp;
  String? _errorMessage;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  bool get requiresOtp => _requiresOtp;
  String? get devOtp => _devOtp;
  String? get errorMessage => _errorMessage;

  Future<void> init() async {
    await ApiService.init();
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    final token = prefs.getString('access_token');

    if (token != null && userData != null) {
      try {
        _user = User.fromJson(jsonDecode(userData));
        _isAuthenticated = true;
        notifyListeners();
        // Verify token is still valid
        _refreshUser();
      } catch (_) {}
    }
  }

  Future<void> _refreshUser() async {
    try {
      final res = await ApiService.getMe();
      if (res['success'] == true && res['data'] != null) {
        _user = User.fromJson(res['data']);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));
        notifyListeners();
      }
    } catch (_) {
      // Token might be expired, logout silently
      await logout();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    _requiresOtp = false;
    _devOtp = null;
    notifyListeners();

    try {
      final res = await ApiService.login(email, password);
      if (res['success'] == true && res['data'] != null) {
        _requiresOtp = true;
        _devOtp = res['data']['devOtp'];
        _isLoading = false;
        notifyListeners();
        return true;
      }
      _isLoading = false;
      notifyListeners();
      return false;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'خطأ في الاتصال: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> verifyOtp(String otp) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiService.verifyOtp(otp);
      if (res['success'] == true && res['data'] != null) {
        _user = User.fromJson(res['data']['user'] ?? res['data']);
        _isAuthenticated = true;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_data', jsonEncode(_user!.toJson()));
        _isLoading = false;
        _requiresOtp = false;
        notifyListeners();
        return true;
      }
      _isLoading = false;
      notifyListeners();
      return false;
    } on ApiException catch (e) {
      _errorMessage = e.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = 'خطأ في الاتصال: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await ApiService.logout();
    _user = null;
    _isAuthenticated = false;
    _requiresOtp = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
