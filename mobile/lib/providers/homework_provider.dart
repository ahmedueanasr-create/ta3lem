import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/homework.dart';

class HomeworkProvider extends ChangeNotifier {
  List<Homework> _homeworks = [];
  bool _isLoading = false;
  String? _error;

  List<Homework> get homeworks => _homeworks;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadHomework() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await ApiService.getHomework();
      final data = res['data'];
      if (data is List) {
        _homeworks = data.map((h) => Homework.fromJson(h)).toList();
      } else if (data is Map && data['rows'] != null) {
        _homeworks = (data['rows'] as List).map((h) => Homework.fromJson(h)).toList();
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'خطأ: $e';
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> submitHomework(int id, String filePath) async {
    try {
      await ApiService.submitHomework(id, filePath);
      await loadHomework();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }
}
