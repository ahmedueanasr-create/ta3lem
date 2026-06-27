import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/teacher_provider.dart';
import '../services/api_service.dart';
import '../models/session.dart';
import '../theme/app_theme.dart';
import 'teacher_create_session_screen.dart';

class TeacherSessionsScreen extends StatefulWidget {
  const TeacherSessionsScreen({super.key});

  @override
  State<TeacherSessionsScreen> createState() => _TeacherSessionsScreenState();
}

class _TeacherSessionsScreenState extends State<TeacherSessionsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TeacherProvider>().loadMySessions();
    });
  }

  Future<void> _refresh() async {
    await context.read<TeacherProvider>().loadMySessions();
  }

  Future<void> _cancelSession(Session session) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تأكيد الإلغاء'),
        content: Text('هل تريد إلغاء الحصة "${session.title}"؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('تراجع')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('تأكيد الإلغاء'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        await ApiService.cancelSession(session.id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('تم إلغاء الحصة'), backgroundColor: AppColors.success),
          );
          _refresh();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('فشل الإلغاء: $e'), backgroundColor: AppColors.danger),
          );
        }
      }
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'live':
        return AppColors.success;
      case 'scheduled':
        return AppColors.primary;
      case 'ended':
        return AppColors.textSecondary;
      case 'cancelled':
        return AppColors.danger;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final teacher = context.watch<TeacherProvider>();
    final sessions = teacher.mySessions;

    return Scaffold(
      appBar: AppBar(title: const Text('حصصي')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: teacher.isLoading
            ? const Center(child: CircularProgressIndicator())
            : sessions.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: const [
                      SizedBox(height: 120),
                      Center(
                        child: Column(
                          children: [
                            Icon(Icons.live_tv, size: 64, color: AppColors.textSecondary),
                            SizedBox(height: 12),
                            Text('لا توجد حصص بعد', style: TextStyle(color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: sessions.length,
                    itemBuilder: (context, index) {
                      final session = sessions[index];
                      return Dismissible(
                        key: ValueKey(session.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          decoration: BoxDecoration(
                            color: AppColors.danger,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        confirmDismiss: (_) async {
                          await _cancelSession(session);
                          return false;
                        },
                        child: Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(session.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: _statusColor(session.status).withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        session.statusLabel,
                                        style: TextStyle(color: _statusColor(session.status), fontSize: 12, fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                if (session.subjectName != null)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 4),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.book, size: 16, color: AppColors.textSecondary),
                                        const SizedBox(width: 4),
                                        Text(session.subjectName!, style: AppTheme.body),
                                      ],
                                    ),
                                  ),
                                Row(
                                  children: [
                                    const Icon(Icons.people, size: 16, color: AppColors.textSecondary),
                                    const SizedBox(width: 4),
                                    Text('${session.enrollmentCount ?? 0} طالب', style: AppTheme.body),
                                    const SizedBox(width: 16),
                                    if (session.scheduledAt != null) ...[
                                      const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                                      const SizedBox(width: 4),
                                      Text(session.scheduledAt!, style: AppTheme.body),
                                    ],
                                  ],
                                ),
                                if (session.price > 0)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text('${session.price} ج.م', style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w600)),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          await Navigator.push(context, MaterialPageRoute(builder: (_) => const TeacherCreateSessionScreen()));
          if (mounted) _refresh();
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
