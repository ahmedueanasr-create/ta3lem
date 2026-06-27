import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/exam_provider.dart';
import '../models/exam.dart';
import '../theme/app_theme.dart';
import 'exam_attempt_screen.dart';

class StudentExamsScreen extends StatefulWidget {
  const StudentExamsScreen({super.key});

  @override
  State<StudentExamsScreen> createState() => _StudentExamsScreenState();
}

class _StudentExamsScreenState extends State<StudentExamsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ExamProvider>().loadExams();
  }

  Future<void> _refresh() async {
    await context.read<ExamProvider>().loadExams();
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'published':
        return 'منشور';
      case 'draft':
        return 'مسودة';
      case 'closed':
        return 'مغلقة';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'published':
        return AppColors.success;
      case 'draft':
        return AppColors.warning;
      case 'closed':
        return AppColors.textSecondary;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExamProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('الاختبارات')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : provider.error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
                        const SizedBox(height: 12),
                        Text(provider.error!, style: AppTheme.body),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _refresh, child: const Text('إعادة المحاولة')),
                      ],
                    ),
                  )
                : provider.exams.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          SizedBox(height: 120),
                          Center(
                            child: Column(
                              children: [
                                Icon(Icons.assignment, size: 64, color: AppColors.textSecondary),
                                SizedBox(height: 12),
                                Text('لا توجد اختبارات متاحة', style: TextStyle(color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      )
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        itemCount: provider.exams.length,
                        itemBuilder: (context, index) {
                          final exam = provider.exams[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ExamAttemptScreen(examId: exam.id),
                                  ),
                                );
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(exam.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: _statusColor(exam.status).withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            _statusLabel(exam.status),
                                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _statusColor(exam.status)),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        const Icon(Icons.help_outline, size: 16, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text('عدد الأسئلة: ${exam.questionCount ?? 0}', style: AppTheme.body),
                                        const SizedBox(width: 24),
                                        const Icon(Icons.timer_outlined, size: 16, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text('المدة: $exam.durationMin دقيقة', style: AppTheme.body),
                                      ],
                                    ),
                                    if (exam.subjectName != null) ...[
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.book, size: 16, color: AppColors.textSecondary),
                                          const SizedBox(width: 4),
                                          Text(exam.subjectName!, style: AppTheme.body),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
