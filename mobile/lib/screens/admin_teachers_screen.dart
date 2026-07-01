import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/admin_provider.dart';
import '../models/teacher.dart' show TeacherProfile;

class AdminTeachersScreen extends StatefulWidget {
  const AdminTeachersScreen({super.key});

  @override
  State<AdminTeachersScreen> createState() => _AdminTeachersScreenState();
}

class _AdminTeachersScreenState extends State<AdminTeachersScreen> {
  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('إدارة المعلمين')),
      body: RefreshIndicator(
        onRefresh: () => admin.loadTeachers(),
        child: admin.isLoading && admin.teachers.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : admin.teachers.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      const SizedBox(height: 120),
                      Center(child: Text('لا يوجد معلمون', style: AppTheme.body)),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: admin.teachers.length,
                    itemBuilder: (ctx, i) {
                      final t = admin.teachers[i];
                      return _TeacherCard(
                        teacher: t,
                        onApprove: () async {
                          final ok = await admin.approveTeacher(t.id);
                          if (ok && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('تم اعتماد المعلم بنجاح')),
                            );
                          }
                        },
                        onSuspend: () async {
                          final ok = await admin.suspendTeacherUser(t.id);
                          if (ok && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('تم تعليق المعلم')),
                            );
                          }
                        },
                      );
                    },
                  ),
      ),
    );
  }
}

class _TeacherCard extends StatelessWidget {
  final TeacherProfile teacher;
  final VoidCallback onApprove;
  final VoidCallback onSuspend;

  const _TeacherCard({
    required this.teacher,
    required this.onApprove,
    required this.onSuspend,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: Text(
                    (teacher.name.isNotEmpty ? teacher.name[0] : '?'),
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(teacher.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      if (teacher.email != null) Text(teacher.email!, style: AppTheme.body),
                    ],
                  ),
                ),
                _statusChip(teacher.status),
              ],
            ),
            if (teacher.subjectName != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.book, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Text(teacher.subjectName!, style: AppTheme.body),
                ],
              ),
            ],
            if (teacher.rating != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.star, size: 16, color: AppColors.warning),
                  const SizedBox(width: 6),
                  Text('${teacher.rating!.toStringAsFixed(1)} / 5', style: AppTheme.body),
                ],
              ),
            ],
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (teacher.status != 'approved')
                  TextButton.icon(
                    onPressed: onApprove,
                    icon: const Icon(Icons.check_circle, color: AppColors.success),
                    label: const Text('اعتماد', style: TextStyle(color: AppColors.success)),
                  ),
                if (teacher.status != 'suspended')
                  TextButton.icon(
                    onPressed: onSuspend,
                    icon: const Icon(Icons.block, color: AppColors.danger),
                    label: const Text('تعليق', style: TextStyle(color: AppColors.danger)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusChip(String status) {
    Color color;
    String label;
    switch (status) {
      case 'approved':
        color = AppColors.success;
        label = 'معتمد';
      case 'pending':
        color = AppColors.warning;
        label = 'قيد الانتظار';
      case 'suspended':
        color = AppColors.danger;
        label = 'موقوف';
      default:
        color = AppColors.textSecondary;
        label = status;
    }
    return Chip(
      label: Text(label, style: TextStyle(color: color, fontSize: 12)),
      backgroundColor: color.withValues(alpha: 0.1),
      visualDensity: VisualDensity.compact,
      padding: EdgeInsets.zero,
    );
  }
}
