import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/teacher_provider.dart';
import '../models/teacher.dart';
import '../theme/app_theme.dart';

class TeacherEarningsScreen extends StatefulWidget {
  const TeacherEarningsScreen({super.key});

  @override
  State<TeacherEarningsScreen> createState() => _TeacherEarningsScreenState();
}

class _TeacherEarningsScreenState extends State<TeacherEarningsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TeacherProvider>().loadEarnings();
    });
  }

  Future<void> _refresh() async {
    await context.read<TeacherProvider>().loadEarnings();
  }

  @override
  Widget build(BuildContext context) {
    final teacher = context.watch<TeacherProvider>();
    final earnings = teacher.earnings;

    return Scaffold(
      appBar: AppBar(title: const Text('الأرباح')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: earnings == null
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        children: [
                          const Text('إجمالي الأرباح', style: TextStyle(color: AppColors.textSecondary)),
                          const SizedBox(height: 8),
                          Text('${earnings.total.toStringAsFixed(2)} ج.م',
                              style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.success)),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  children: [
                                    Text('${earnings.pending.toStringAsFixed(2)} ج.م',
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.warning)),
                                    const SizedBox(height: 4),
                                    const Text('معلق', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                  ],
                                ),
                              ),
                              Container(width: 1, height: 40, color: AppColors.border),
                              Expanded(
                                child: Column(
                                  children: [
                                    Text('${earnings.withdrawn.toStringAsFixed(2)} ج.م',
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                    const SizedBox(height: 4),
                                    const Text('مسحوب', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('آخر المعاملات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 12),
                  if (earnings.recent == null || earnings.recent!.isEmpty)
                    const Card(child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(child: Text('لا توجد معاملات بعد', style: TextStyle(color: AppColors.textSecondary))),
                    ))
                  else
                    ...earnings.recent!.map((item) => _buildEarningItem(item)),
                ],
              ),
      ),
    );
  }

  Widget _buildEarningItem(EarningItem item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: item.amount >= 0 ? AppColors.success.withValues(alpha: 0.1) : AppColors.danger.withValues(alpha: 0.1),
          child: Icon(
            item.amount >= 0 ? Icons.arrow_upward : Icons.arrow_downward,
            color: item.amount >= 0 ? AppColors.success : AppColors.danger,
          ),
        ),
        title: Text(item.description, style: const TextStyle(fontWeight: FontWeight.w500)),
        subtitle: Text(item.date, style: AppTheme.body),
        trailing: Text(
          '${item.amount >= 0 ? '+' : ''}${item.amount.toStringAsFixed(2)} ج.م',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: item.amount >= 0 ? AppColors.success : AppColors.danger,
          ),
        ),
      ),
    );
  }
}
