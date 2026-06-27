import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/homework_provider.dart';
import '../models/homework.dart';
import '../theme/app_theme.dart';

class StudentHomeworkScreen extends StatefulWidget {
  const StudentHomeworkScreen({super.key});

  @override
  State<StudentHomeworkScreen> createState() => _StudentHomeworkScreenState();
}

class _StudentHomeworkScreenState extends State<StudentHomeworkScreen> {
  @override
  void initState() {
    super.initState();
    context.read<HomeworkProvider>().loadHomework();
  }

  Future<void> _refresh() async {
    await context.read<HomeworkProvider>().loadHomework();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<HomeworkProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('الواجبات')),
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
                : provider.homeworks.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          SizedBox(height: 120),
                          Center(
                            child: Column(
                              children: [
                                Icon(Icons.assignment, size: 64, color: AppColors.textSecondary),
                                SizedBox(height: 12),
                                Text('لا توجد واجبات', style: TextStyle(color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      )
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        itemCount: provider.homeworks.length,
                        itemBuilder: (context, index) {
                          final hw = provider.homeworks[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(hw.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                      ),
                                      _buildStatusBadge(hw),
                                    ],
                                  ),
                                  if (hw.teacherName != null) ...[
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        const Icon(Icons.person, size: 16, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text(hw.teacherName!, style: AppTheme.body),
                                      ],
                                    ),
                                  ],
                                  if (hw.sessionTitle != null) ...[
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.live_tv, size: 16, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text(hw.sessionTitle!, style: AppTheme.body),
                                      ],
                                    ),
                                  ],
                                  if (hw.dueDate != null) ...[
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.date_range, size: 16, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text('تاريخ التسليم: ${hw.dueDate}', style: AppTheme.body),
                                      ],
                                    ),
                                  ],
                                  if (hw.description != null && hw.description!.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Text(hw.description!, style: AppTheme.body),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }

  Widget _buildStatusBadge(Homework hw) {
    if (hw.isGraded) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.success.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          '${hw.score}%',
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.success),
        ),
      );
    }
    if (hw.submitted) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Text(
          'تم التسليم',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
        ),
      );
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Text(
        'لم يسلم',
        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.warning),
      ),
    );
  }
}
