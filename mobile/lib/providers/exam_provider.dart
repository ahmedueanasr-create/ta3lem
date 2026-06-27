import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/exam.dart';

class ExamProvider extends ChangeNotifier {
  List<Exam> _exams = [];
  Exam? _currentExam;
  List<Question> _questions = [];
  ExamAttempt? _currentAttempt;
  int _currentQuestionIndex = 0;
  Map<int, int> _answers = {};
  bool _isLoading = false;
  String? _error;

  List<Exam> get exams => _exams;
  Exam? get currentExam => _currentExam;
  List<Question> get questions => _questions;
  ExamAttempt? get currentAttempt => _currentAttempt;
  int get currentQuestionIndex => _currentQuestionIndex;
  Map<int, int> get answers => _answers;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Question? get currentQuestion => _currentQuestionIndex < _questions.length ? _questions[_currentQuestionIndex] : null;

  Future<void> loadExams() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await ApiService.getExams();
      final data = res['data'];
      if (data is List) {
        _exams = data.map((e) => Exam.fromJson(e)).toList();
      } else if (data is Map && data['rows'] != null) {
        _exams = (data['rows'] as List).map((e) => Exam.fromJson(e)).toList();
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'خطأ: $e';
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<ExamAttempt?> startExam(int examId) async {
    _error = null;
    notifyListeners();
    try {
      final res = await ApiService.startAttempt(examId);
      _currentAttempt = ExamAttempt.fromJson(res['data']);
      _currentExam = Exam.fromJson(res['data']['exam'] ?? {});
      _questions = (res['data']['questions'] as List?)?.map((q) => Question.fromJson(q)).toList() ?? [];
      _answers = {};
      _currentQuestionIndex = 0;
      notifyListeners();
      return _currentAttempt;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return null;
    }
  }

  Future<void> submitAnswer(int questionId, int selectedIndex) async {
    if (_currentAttempt == null) return;
    _answers[questionId] = selectedIndex;
    try {
      await ApiService.submitAnswer(_currentAttempt!.id, {
        'question_id': questionId,
        'selected_index': selectedIndex,
      });
    } catch (_) {}
    notifyListeners();
  }

  Future<ExamAttempt?> finishExam() async {
    if (_currentAttempt == null) return null;
    try {
      final res = await ApiService.finishAttempt(_currentAttempt!.id);
      _currentAttempt = ExamAttempt.fromJson(res['data']);
      notifyListeners();
      return _currentAttempt;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return null;
    }
  }

  void nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      _currentQuestionIndex++;
      notifyListeners();
    }
  }

  void previousQuestion() {
    if (_currentQuestionIndex > 0) {
      _currentQuestionIndex--;
      notifyListeners();
    }
  }

  void reset() {
    _currentExam = null;
    _questions = [];
    _currentAttempt = null;
    _answers = {};
    _currentQuestionIndex = 0;
    notifyListeners();
  }
}
