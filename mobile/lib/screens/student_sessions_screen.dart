import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/session_provider.dart';
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
        return AppColors.textTertiary;
      default:
        return AppColors.textTertiary;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'live': return 'مباشر';
      case 'scheduled': return 'مجدول';
      case 'ended': return 'منتهي';
      case 'cancelled': return 'ملغي';
      default: return status;
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
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.danger.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.error_outline, size: 40, color: AppColors.danger),
                          ),
                          const SizedBox(height: 16),
                          Text(provider.error!, style: AppTheme.body, textAlign: TextAlign.center),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            onPressed: _refresh,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 32),
                            ),
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  )
                : provider.sessions.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [
                          SizedBox(height: 100),
                          Center(
                            child: Column(
                              children: [
                                Icon(Icons.live_tv, size: 64, color: AppColors.textTertiary),
                                SizedBox(height: 16),
                                Text('لا توجد حصص متاحة', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      )
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                        itemCount: provider.sessions.length,
                        itemBuilder: (context, index) {
                          final session = provider.sessions[index];
                          final statusColor = _statusColor(session.status);
                          return Card(
                            elevation: 2,
                            shadowColor: Colors.black.withValues(alpha: 0.06),
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
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: statusColor.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Icon(
                                            session.isLive ? Icons.live_tv : Icons.schedule,
                                            color: statusColor,
                                            size: 24,
                                          ),
                                        ),
                                        const SizedBox(width: 14),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                session.title,
                                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                              ),
                                              const SizedBox(height: 4),
                                              if (session.subjectName != null)
                                                Text(session.subjectName!, style: AppTheme.caption),
                                            ],
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                          decoration: BoxDecoration(
                                            color: statusColor.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Container(
                                                width: 8,
                                                height: 8,
                                                decoration: BoxDecoration(
                                                  color: statusColor,
                                                  shape: BoxShape.circle,
                                                ),
                                              ),
                                              const SizedBox(width: 5),
                                              Text(
                                                _statusLabel(session.status),
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w600,
                                                  color: statusColor,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    if (session.teacherName != null)
                                      Padding(
                                        padding: const EdgeInsets.only(bottom: 4),
                                        child: Row(
                                          children: [
                                            Icon(Icons.person_outline, size: 15, color: AppColors.textTertiary),
                                            const SizedBox(width: 6),
                                            Text(session.teacherName!, style: AppTheme.caption),
                                          ],
                                        ),
                                      ),
                                    const Divider(height: 16),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                          decoration: BoxDecoration(
                                            color: (session.price > 0
                                                ? AppColors.primary
                                                : AppColors.success).withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            session.price > 0
                                                ? '${session.price.toStringAsFixed(0)} ج.م'
                                                : 'مجاني',
                                            style: TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 13,
                                              color: session.price > 0 ? AppColors.primary : AppColors.success,
                                            ),
                                          ),
                                        ),
                                        if (session.isLive)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: AppColors.success.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text(
                                                  'دخول',
                                                  style: TextStyle(
                                                    color: AppColors.success,
                                                    fontWeight: FontWeight.w600,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                                SizedBox(width: 4),
                                                Icon(Icons.arrow_back, size: 16, color: AppColors.success),
                                              ],
                                            ),
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
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.list, color: Colors.white),
      ),
    );
  }
}
