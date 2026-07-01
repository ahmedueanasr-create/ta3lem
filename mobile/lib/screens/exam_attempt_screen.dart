import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/exam_provider.dart';
import '../models/exam.dart';
import '../theme/app_theme.dart';

class ExamAttemptScreen extends StatefulWidget {
  final int examId;
  const ExamAttemptScreen({super.key, required this.examId});

  @override
  State<ExamAttemptScreen> createState() => _ExamAttemptScreenState();
}

class _ExamAttemptScreenState extends State<ExamAttemptScreen> {
  bool _started = false;
  bool _loading = true;
  bool _finishing = false;

  @override
  void initState() {
    super.initState();
    _startExam();
  }

  Future<void> _startExam() async {
    setState(() => _loading = true);
    final provider = context.read<ExamProvider>();
    await provider.startExam(widget.examId);
    if (mounted) {
      setState(() {
        _started = true;
        _loading = false;
      });
    }
  }

  Future<void> _finishExam() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إنهاء الاختبار'),
        content: const Text('هل أنت متأكد من إنهاء الاختبار؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('إنهاء')),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _finishing = true);
    final provider = context.read<ExamProvider>();
    final attempt = await provider.finishExam();
    if (mounted) {
      setState(() => _finishing = false);
      if (attempt != null) {
        _showScoreDialog(attempt);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.error ?? 'حدث خطأ'), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  void _showScoreDialog(ExamAttempt attempt) {
    final passed = attempt.score >= (context.read<ExamProvider>().currentExam?.passScore ?? 50);
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('النتيجة'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              passed ? Icons.check_circle : Icons.cancel,
              size: 64,
              color: passed ? AppColors.success : AppColors.danger,
            ),
            const SizedBox(height: 16),
            Text(
              'درجتك: ${attempt.score} / ${attempt.totalPoints}',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              passed ? 'مبروك! لقد نجحت في الاختبار' : 'لم تنجح، حاول مرة أخرى',
              style: TextStyle(color: passed ? AppColors.success : AppColors.danger),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('رجوع'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ExamProvider>();
    final question = provider.currentQuestion;

    return Scaffold(
      appBar: AppBar(
        title: Text(provider.currentExam?.title ?? 'الاختبار'),
        actions: [
          if (_started && !_loading)
            TextButton(
              onPressed: _finishing ? null : _finishExam,
              child: _finishing
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('إنهاء', style: TextStyle(color: AppColors.danger)),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : provider.error != null && !_started
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
                      const SizedBox(height: 12),
                      Text(provider.error!, style: AppTheme.body),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _startExam, child: const Text('إعادة المحاولة')),
                    ],
                  ),
                )
              : provider.questions.isEmpty
                  ? const Center(child: Text('لا توجد أسئلة', style: TextStyle(color: AppColors.textSecondary)))
                  : Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'سؤال ${provider.currentQuestionIndex + 1} من ${provider.questions.length}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                'الدرجة: ${question?.points ?? 0}',
                                style: AppTheme.body,
                              ),
                            ],
                          ),
                        ),
                        const Divider(height: 1),
                        Expanded(
                          child: SingleChildScrollView(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Card(
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Text(
                                      question?.questionText ?? '',
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                ...(question?.options ?? []).asMap().entries.map((entry) {
                                  final idx = entry.key;
                                  final option = entry.value;
                                  final selected = provider.answers[question?.id] == idx;
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    child: RadioListTile<int>(
                                      title: Text(option, style: const TextStyle(fontSize: 16)),
                                      value: idx,
                                      groupValue: selected ? idx : null,
                                      onChanged: (value) {
                                        if (value != null && question != null) {
                                          provider.submitAnswer(question.id, value);
                                        }
                                      },
                                      activeColor: AppColors.primary,
                                    ),
                                  );
                                }),
                              ],
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: const BoxDecoration(
                            color: AppColors.surface,
                            border: Border(top: BorderSide(color: AppColors.border)),
                          ),
                          child: Row(
                            children: [
                              if (provider.currentQuestionIndex > 0)
                                Expanded(
                                  child: OutlinedButton.icon(
                                    onPressed: () => provider.previousQuestion(),
                                    icon: const Icon(Icons.arrow_forward),
                                    label: const Text('السابق'),
                                  ),
                                )
                              else
                                const Spacer(),
                              const SizedBox(width: 16),
                              if (provider.currentQuestionIndex < provider.questions.length - 1)
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () => provider.nextQuestion(),
                                    icon: const Icon(Icons.arrow_back),
                                    label: const Text('التالي'),
                                  ),
                                )
                              else
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: _finishing ? null : _finishExam,
                                    icon: _finishing
                                        ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                        : const Icon(Icons.check),
                                    label: const Text('إنهاء'),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
    );
  }
}
