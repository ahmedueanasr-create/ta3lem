import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/session_provider.dart';
import '../models/session.dart';
import '../theme/app_theme.dart';
import 'student_live_room_screen.dart';

class StudentSessionsScreen extends StatefulWidget {
  const StudentSessionsScreen({super.key});

  @override
  State<StudentSessionsScreen> createState() => _StudentSessionsScreenState();
}

class _StudentSessionsScreenState extends State<StudentSessionsScreen> {
  @override
  void initState() {
    super.initState();
    context.read<SessionProvider>().loadSessions();
  }

  Future<void> _refresh() async {
    await context.read<SessionProvider>().loadSessions();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'live':
        return AppColors.success;
      case 'scheduled':
        return AppColors.primary;
      case 'ended':
      case 'cancelled':
        return AppColors.textSecondary;
      default:
        return AppColors.textSecondary;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'live':
        return Icons.live_tv;
      case 'scheduled':
        return Icons.schedule;
      case 'ended':
        return Icons.check_circle;
      case 'cancelled':
        return Icons.cancel;
      default:
        return Icons.help;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<SessionProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('الحصص')),
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
                : provider.sessions.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          SizedBox(height: 120),
                          Center(
                            child: Column(
                              children: [
                                Icon(Icons.live_tv, size: 64, color: AppColors.textSecondary),
                                SizedBox(height: 12),
                                Text('لا توجد حصص متاحة', style: TextStyle(color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      )
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        itemCount: provider.sessions.length,
                        itemBuilder: (context, index) {
                          final session = provider.sessions[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () {
                                if (session.isLive) {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => StudentLiveRoomScreen(sessionId: session.id),
                                    ),
                                  );
                                }
                              },
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
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(_statusIcon(session.status), size: 14, color: _statusColor(session.status)),
                                              const SizedBox(width: 4),
                                              Text(
                                                session.statusLabel,
                                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _statusColor(session.status)),
                                              ),
                                            ],
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
                                            const SizedBox(width: 6),
                                            Text(session.subjectName!, style: AppTheme.body),
                                          ],
                                        ),
                                      ),
                                    if (session.teacherName != null)
                                      Padding(
                                        padding: const EdgeInsets.only(bottom: 4),
                                        child: Row(
                                          children: [
                                            const Icon(Icons.person, size: 16, color: AppColors.textSecondary),
                                            const SizedBox(width: 6),
                                            Text(session.teacherName!, style: AppTheme.body),
                                          ],
                                        ),
                                      ),
                                    const Divider(),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          session.price > 0 ? '${session.price.toStringAsFixed(0)} ج.م' : 'مجاني',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: session.price > 0 ? AppColors.primary : AppColors.success,
                                          ),
                                        ),
                                        if (session.isLive)
                                          const Row(
                                            children: [
                                              Icon(Icons.arrow_back, size: 16, color: AppColors.primary),
                                              SizedBox(width: 4),
                                              Text('دخول', style: TextStyle(color: AppColors.primary)),
                                            ],
                                          ),
                                      ],
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
        onPressed: () {},
        child: const Icon(Icons.list),
      ),
    );
  }
}
