import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../models/exam.dart';
import '../theme/app_theme.dart';

class TeacherExamsScreen extends StatefulWidget {
  const TeacherExamsScreen({super.key});

  @override
  State<TeacherExamsScreen> createState() => _TeacherExamsScreenState();
}

class _TeacherExamsScreenState extends State<TeacherExamsScreen> {
  List<Exam> _exams = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadExams();
  }

  Future<void> _loadExams() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getExams();
      final data = res['data'];
      if (data is List) {
        _exams = data.map((e) => Exam.fromJson(e)).toList();
      } else if (data is Map && data['rows'] != null) {
        _exams = (data['rows'] as List).map((e) => Exam.fromJson(e)).toList();
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الاختبارات')),
      body: RefreshIndicator(
        onRefresh: _loadExams,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _exams.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: const [
                      SizedBox(height: 120),
                      Center(
                        child: Column(
                          children: [
                            Icon(Icons.quiz, size: 64, color: AppColors.textSecondary),
                            SizedBox(height: 12),
                            Text('إدارة الاختبارات - قريباً', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                          ],
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: _exams.length,
                    itemBuilder: (context, index) {
                      final exam = _exams[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: AppColors.secondary,
                            child: Icon(Icons.quiz, color: Colors.white),
                          ),
                          title: Text(exam.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (exam.subjectName != null) Text(exam.subjectName!),
                              Row(
                                children: [
                                  Text('${exam.questionCount ?? 0} أسئلة'),
                                  const SizedBox(width: 12),
                                  Text('${exam.durationMin} دقيقة'),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
