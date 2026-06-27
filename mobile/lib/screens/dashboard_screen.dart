import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'verify_certificate_screen.dart';
import 'profile_screen.dart';
import 'student_sessions_screen.dart';
import 'student_exams_screen.dart';
import 'student_homework_screen.dart';

import 'wallet_screen.dart';
import 'ai_tutor_screen.dart';
import 'notifications_screen.dart';
import 'teacher_sessions_screen.dart';
import 'teacher_create_session_screen.dart';
import 'teacher_courses_screen.dart';
import 'teacher_earnings_screen.dart';
import 'admin_users_screen.dart';
import 'admin_teachers_screen.dart';

import 'admin_subjects_screen.dart';
import 'admin_reports_screen.dart';
import 'admin_settings_screen.dart';
import 'admin_whatsapp_screen.dart';
import 'parent_link_screen.dart';
import 'parent_payments_screen.dart';
import 'supervisor_students_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  Map<String, dynamic>? _dashboardData;
    bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final auth = context.read<AuthProvider>();
      if (auth.user?.isParent == true) {
        final res = await ApiService.parentDashboard();
        if (res['success'] == true) _dashboardData = res['data'];
      } else if (auth.user?.isStudent == true) {
        final sessions = await ApiService.getSessions();
        final wallet = await ApiService.getWallet();
        _dashboardData = {'sessions': sessions['data'], 'wallet': wallet['data']};
      } else {
        final sessions = await ApiService.getSessions();
        _dashboardData = {'sessions': sessions['data']};
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final role = auth.user?.role ?? '';
    final isParent = auth.user?.isParent == true;

    return Scaffold(
      appBar: _buildAppBar(auth, role),
      drawer: _buildDrawer(auth),
      body: _buildBody(),
      bottomNavigationBar: _buildBottomNav(role, isParent),
    );
  }

  PreferredSizeWidget _buildAppBar(AuthProvider auth, String role) {
    return AppBar(
      title: Text('مرحباً، ${(auth.user?.name ?? '').split(' ').first}'),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen())),
        ),
      ],
    );
  }

  Widget _buildDrawer(AuthProvider auth) {
    return NavigationDrawer(
      children: [
        DrawerHeader(
          decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.white24,
                child: Text((auth.user?.name ?? '?')[0], style: const TextStyle(fontSize: 24, color: Colors.white)),
              ),
              const SizedBox(height: 8),
              Text(auth.user?.name ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              Text(auth.user?.email ?? '', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ),
        NavigationDrawerDestination(icon: const Icon(Icons.person), label: const Text('حسابي')),
        if (auth.user?.isStudent == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.live_tv), label: const Text('الحصص')),
          NavigationDrawerDestination(icon: const Icon(Icons.quiz), label: const Text('الاختبارات')),
          NavigationDrawerDestination(icon: const Icon(Icons.home_work), label: const Text('الواجبات')),
          NavigationDrawerDestination(icon: const Icon(Icons.account_balance_wallet), label: const Text('المحفظة')),
          NavigationDrawerDestination(icon: const Icon(Icons.smart_toy), label: const Text('المساعد الذكي')),
        ],
        if (auth.user?.isTeacher == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.live_tv), label: const Text('حصصي')),
          NavigationDrawerDestination(icon: const Icon(Icons.add), label: const Text('إنشاء حصة')),
          NavigationDrawerDestination(icon: const Icon(Icons.school), label: const Text('كورساتي')),
          NavigationDrawerDestination(icon: const Icon(Icons.emoji_events), label: const Text('أرباحي')),
          NavigationDrawerDestination(icon: const Icon(Icons.smart_toy), label: const Text('المساعد الذكي')),
        ],
        if (auth.user?.isAdmin == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.people), label: const Text('المستخدمون')),
          NavigationDrawerDestination(icon: const Icon(Icons.school), label: const Text('المدرسون')),
          NavigationDrawerDestination(icon: const Icon(Icons.book), label: const Text('المواد')),
          NavigationDrawerDestination(icon: const Icon(Icons.assessment), label: const Text('التقارير')),
          NavigationDrawerDestination(icon: const Icon(Icons.settings), label: const Text('الإعدادات')),
          NavigationDrawerDestination(icon: const Icon(Icons.chat), label: const Text('واتساب')),
        ],
        if (auth.user?.isParent == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.link), label: const Text('ربط طالب')),
          NavigationDrawerDestination(icon: const Icon(Icons.payment), label: const Text('المدفوعات')),
        ],
        if (auth.user?.isSupervisor == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.visibility), label: const Text('متابعة الطلاب')),
        ],
        const Divider(),
        NavigationDrawerDestination(icon: const Icon(Icons.verified), label: const Text('توثيق الشهادات')),
        NavigationDrawerDestination(icon: const Icon(Icons.logout), label: const Text('تسجيل الخروج')),
      ],
      onDestinationSelected: (i) {
        Navigator.pop(context);
        _handleDrawerTap(i, auth);
      },
    );
  }

  void _handleDrawerTap(int index, AuthProvider auth) {
    final screens = <int, Widget>{};
    int offset = 0;

    screens[offset++] = const ProfileScreen();
    if (auth.user?.isStudent == true) {
      screens[offset++] = const StudentSessionsScreen();
      screens[offset++] = const StudentExamsScreen();
      screens[offset++] = const StudentHomeworkScreen();
      screens[offset++] = const WalletScreen();
      screens[offset++] = const AiTutorScreen();
    }
    if (auth.user?.isTeacher == true) {
      screens[offset++] = const TeacherSessionsScreen();
      screens[offset++] = const TeacherCreateSessionScreen();
      screens[offset++] = const TeacherCoursesScreen();
      screens[offset++] = const TeacherEarningsScreen();
      screens[offset++] = const AiTutorScreen();
    }
    if (auth.user?.isAdmin == true) {
      screens[offset++] = const AdminUsersScreen();
      screens[offset++] = const AdminTeachersScreen();
      screens[offset++] = const AdminSubjectsScreen();
      screens[offset++] = const AdminReportsScreen();
      screens[offset++] = const AdminSettingsScreen();
      screens[offset++] = const AdminWhatsAppScreen();
    }
    if (auth.user?.isParent == true) {
      screens[offset++] = const ParentLinkScreen();
      screens[offset++] = const ParentPaymentsScreen();
    }
    if (auth.user?.isSupervisor == true) {
      screens[offset++] = const SupervisorStudentsScreen();
    }

    // certificates
    screens[offset++] = const VerifyCertificateScreen();
    // logout
    screens[offset] = const SizedBox(); // logout handled separately

    final screen = screens[index];
    if (screen == null) return;
    if (screen is SizedBox) {
      _doLogout(auth, context);
    } else {
      Navigator.push(context, MaterialPageRoute(builder: (_) => screen));
    }
  }

  Future<void> _doLogout(AuthProvider auth, BuildContext ctx) async {
    await auth.logout();
    if (ctx.mounted) {
      Navigator.pushAndRemoveUntil(
        ctx,
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
        (_) => false,
      );
    }
  }

  Widget _buildBody() {
    final auth = context.watch<AuthProvider>();
    if (auth.user?.isParent == true) return _buildParentDashboard();
    if (auth.user?.isStudent == true) return _buildStudentDashboard();
    if (auth.user?.isTeacher == true) return _buildTeacherDashboard();
    if (auth.user?.isAdmin == true) return _buildAdminDashboard();
    if (auth.user?.isSupervisor == true) return _buildSupervisorDashboard();
    return _buildStudentDashboard();
  }

  Widget _buildBottomNav(String role, bool isParent) {
    List<NavigationDestination> items;
    void Function(int) tabNav;

    if (role == 'student') {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.live_tv), label: 'الحصص'),
        NavigationDestination(icon: Icon(Icons.quiz), label: 'الاختبارات'),
        NavigationDestination(icon: Icon(Icons.school), label: 'المساعد'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentSessionsScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentExamsScreen()));
        if (i == 3) Navigator.push(context, MaterialPageRoute(builder: (_) => const AiTutorScreen()));
      };
    } else if (role == 'teacher') {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.live_tv), label: 'حصصي'),
        NavigationDestination(icon: Icon(Icons.add), label: 'إنشاء'),
        NavigationDestination(icon: Icon(Icons.school), label: 'المساعد'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const TeacherSessionsScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const TeacherCreateSessionScreen()));
        if (i == 3) Navigator.push(context, MaterialPageRoute(builder: (_) => const AiTutorScreen()));
      };
    } else if (role == 'super_admin' || role == 'platform_admin') {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.people), label: 'المستخدمون'),
        NavigationDestination(icon: Icon(Icons.school), label: 'المدرسون'),
        NavigationDestination(icon: Icon(Icons.assessment), label: 'التقارير'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminUsersScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminTeachersScreen()));
        if (i == 3) Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminReportsScreen()));
      };
    } else if (role == 'parent') {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.link), label: 'ربط طالب'),
        NavigationDestination(icon: Icon(Icons.payment), label: 'المدفوعات'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const ParentLinkScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const ParentPaymentsScreen()));
      };
    } else {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard), label: 'الرئيسية'),
      ];
      tabNav = (_) {};
    }

    if (isParent) {
      return NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) {
          if (i == 0) return; // dashboard
          tabNav(i);
        },
        destinations: items,
      );
    }

    return NavigationBar(
      selectedIndex: _currentIndex,
      onDestinationSelected: (i) {
        if (i == 0) {
          setState(() => _currentIndex = 0);
        } else {
          tabNav(i);
        }
      },
      destinations: items,
    );
  }

  Widget _buildOverviewCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: color)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildParentDashboard() {
    final students = _dashboardData?['students'] as List? ?? [];
    if (students.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: Column(
            children: [
              Icon(Icons.link, size: 64, color: AppColors.textSecondary),
              SizedBox(height: 12),
              Text('لم تقم بربط أي طالب بعد'),
            ],
          ),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('أبنائي الطلاب', style: AppTheme.heading),
          const SizedBox(height: 12),
          ...students.map((s) => _buildStudentCard(s)),
        ],
      ),
    );
  }

  Widget _buildStudentCard(Map<String, dynamic> student) {
    final user = student['user'] ?? {};
    final wallet = student['wallet'];
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(backgroundColor: AppColors.primary, child: Text(user['name']?[0] ?? '?', style: const TextStyle(color: Colors.white))),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('الصف: ${student['student']?['grade'] ?? '-'}', style: AppTheme.body),
                    ],
                  ),
                ),
                if (wallet != null) Chip(label: Text('${wallet['balance']} ج.م'), backgroundColor: AppColors.success.withValues(alpha: 0.1)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentDashboard() {
    final sessions = _dashboardData?['sessions'] ?? [];
    final wallet = _dashboardData?['wallet'];
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (wallet != null) _buildOverviewCard('رصيد المحفظة', '${wallet['balance']} ج.م', Icons.account_balance_wallet, AppColors.success),
          const SizedBox(height: 16),
          Text('الحصص القادمة', style: AppTheme.heading),
          const SizedBox(height: 12),
          if (sessions is List && sessions.isEmpty)
            const Card(child: ListTile(title: Text('لا توجد حصص')))
          else if (sessions is List)
            ...sessions.take(5).map((s) => Card(
              child: ListTile(
                leading: const Icon(Icons.live_tv, color: AppColors.primary),
                title: Text(s['title'] ?? ''),
                subtitle: Text(s['subject']?['name'] ?? ''),
                trailing: Text(s['price'] != null ? '${s['price']} ج.م' : 'مجاني'),
              ),
            )),
        ],
      ),
    );
  }

  Widget _buildTeacherDashboard() {
    final sessions = _dashboardData?['sessions'] ?? [];
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('حصصي', style: AppTheme.heading),
          const SizedBox(height: 12),
          if (sessions is List && sessions.isEmpty)
            const Card(child: ListTile(title: Text('لا توجد حصص')))
          else if (sessions is List)
            ...sessions.take(5).map((s) => Card(
              child: ListTile(
                leading: const Icon(Icons.live_tv, color: AppColors.primary),
                title: Text(s['title'] ?? ''),
                subtitle: Text('${s['enrollment_count'] ?? 0} طالب'),
              ),
            )),
        ],
      ),
    );
  }

  Widget _buildAdminDashboard() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('لوحة الإدارة', style: AppTheme.heading),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildOverviewCard('المستخدمون', '---', Icons.people, AppColors.primary)),
              const SizedBox(width: 12),
              Expanded(child: _buildOverviewCard('المدرسون', '---', Icons.school, AppColors.secondary)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _buildOverviewCard('الحصص', '---', Icons.live_tv, AppColors.success)),
              const SizedBox(width: 12),
              Expanded(child: _buildOverviewCard('التقارير', '---', Icons.assessment, AppColors.warning)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSupervisorDashboard() {
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('لوحة المشرف', style: AppTheme.heading),
          const SizedBox(height: 16),
          Card(
            child: ListTile(
              leading: const Icon(Icons.visibility, color: AppColors.primary),
              title: const Text('متابعة الطلاب'),
              trailing: const Icon(Icons.chevron_left),
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupervisorStudentsScreen())),
            ),
          ),
        ],
      ),
    );
  }
}
