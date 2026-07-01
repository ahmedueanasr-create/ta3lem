import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
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
import 'search_screen.dart';
import 'calendar_screen.dart';
import 'chat_screen.dart';
import 'progress_screen.dart';
import 'gamification_screen.dart';
import 'download_center_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  Map<String, dynamic>? _dashboardData;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
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
      floatingActionButton: role == 'student'
          ? FloatingActionButton(
              mini: true,
              backgroundColor: AppColors.primary,
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen())),
              child: const Icon(Icons.search, color: Colors.white),
            )
          : null,
    );
  }

  PreferredSizeWidget _buildAppBar(AuthProvider auth, String role) {
    return AppBar(
      title: Text('مرحباً، ${(auth.user?.name ?? '').split(' ').first}'),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NotificationsScreen()),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.person_outline),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ProfileScreen()),
          ),
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
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Colors.white24,
                child: Text(
                  (auth.user?.name ?? '?')[0],
                  style: const TextStyle(fontSize: 24, color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
              Text(auth.user?.name ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              Text(auth.user?.email ?? '', style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ),
        NavigationDrawerDestination(icon: const Icon(Icons.person_outline), label: const Text('حسابي')),
        if (auth.user?.isStudent == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.search_outlined), label: const Text('بحث')),
          NavigationDrawerDestination(icon: const Icon(Icons.live_tv), label: const Text('الحصص')),
          NavigationDrawerDestination(icon: const Icon(Icons.quiz_outlined), label: const Text('الاختبارات')),
          NavigationDrawerDestination(icon: const Icon(Icons.home_work_outlined), label: const Text('الواجبات')),
          NavigationDrawerDestination(icon: const Icon(Icons.calendar_month_outlined), label: const Text('التقويم')),
          NavigationDrawerDestination(icon: const Icon(Icons.trending_up_outlined), label: const Text('التقدم')),
          NavigationDrawerDestination(icon: const Icon(Icons.chat_outlined), label: const Text('المحادثة')),
          NavigationDrawerDestination(icon: const Icon(Icons.account_balance_wallet_outlined), label: const Text('المحفظة')),
          NavigationDrawerDestination(icon: const Icon(Icons.emoji_events_outlined), label: const Text('الإنجازات')),
          NavigationDrawerDestination(icon: const Icon(Icons.download_outlined), label: const Text('التحميلات')),
          NavigationDrawerDestination(icon: const Icon(Icons.smart_toy_outlined), label: const Text('المساعد الذكي')),
        ],
        if (auth.user?.isTeacher == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.live_tv), label: const Text('حصصي')),
          NavigationDrawerDestination(icon: const Icon(Icons.add_circle_outline), label: const Text('إنشاء حصة')),
          NavigationDrawerDestination(icon: const Icon(Icons.school_outlined), label: const Text('كورساتي')),
          NavigationDrawerDestination(icon: const Icon(Icons.emoji_events_outlined), label: const Text('أرباحي')),
          NavigationDrawerDestination(icon: const Icon(Icons.smart_toy_outlined), label: const Text('المساعد الذكي')),
        ],
        if (auth.user?.isAdmin == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.people_outline), label: const Text('المستخدمون')),
          NavigationDrawerDestination(icon: const Icon(Icons.school_outlined), label: const Text('المدرسون')),
          NavigationDrawerDestination(icon: const Icon(Icons.book_outlined), label: const Text('المواد')),
          NavigationDrawerDestination(icon: const Icon(Icons.assessment_outlined), label: const Text('التقارير')),
          NavigationDrawerDestination(icon: const Icon(Icons.settings_outlined), label: const Text('الإعدادات')),
          NavigationDrawerDestination(icon: const Icon(Icons.chat_outlined), label: const Text('واتساب')),
        ],
        if (auth.user?.isParent == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.link), label: const Text('ربط طالب')),
          NavigationDrawerDestination(icon: const Icon(Icons.payment_outlined), label: const Text('المدفوعات')),
        ],
        if (auth.user?.isSupervisor == true) ...[
          NavigationDrawerDestination(icon: const Icon(Icons.visibility_outlined), label: const Text('متابعة الطلاب')),
        ],
        const Divider(),
        NavigationDrawerDestination(icon: const Icon(Icons.verified_outlined), label: const Text('توثيق الشهادات')),
        NavigationDrawerDestination(icon: const Icon(Icons.dark_mode_outlined), label: const Text('الوضع الليلي')),
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
      screens[offset++] = const SearchScreen();
      screens[offset++] = const StudentSessionsScreen();
      screens[offset++] = const StudentExamsScreen();
      screens[offset++] = const StudentHomeworkScreen();
      screens[offset++] = const CalendarScreen();
      screens[offset++] = const ProgressScreen();
      screens[offset++] = ChatScreen(type: 'teacher', targetName: 'المدرس');
      screens[offset++] = const WalletScreen();
      screens[offset++] = const GamificationScreen();
      screens[offset++] = const DownloadCenterScreen();
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

    screens[offset++] = const VerifyCertificateScreen();
    screens[offset++] = const _ThemeTogglePlaceholder();
    screens[offset] = const SizedBox();

    final screen = screens[index];
    if (screen == null) return;
    if (screen is _ThemeTogglePlaceholder) {
      context.read<ThemeProvider>().toggleTheme();
    } else if (screen is SizedBox) {
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
        NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.search_outlined), label: 'بحث'),
        NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'تقويم'),
        NavigationDestination(icon: Icon(Icons.smart_toy_outlined), label: 'المساعد'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const SearchScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const CalendarScreen()));
        if (i == 3) Navigator.push(context, MaterialPageRoute(builder: (_) => const AiTutorScreen()));
      };
    } else if (role == 'teacher') {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.live_tv), label: 'حصصي'),
        NavigationDestination(icon: Icon(Icons.add_circle_outline), label: 'إنشاء'),
        NavigationDestination(icon: Icon(Icons.smart_toy_outlined), label: 'المساعد'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const TeacherSessionsScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const TeacherCreateSessionScreen()));
        if (i == 3) Navigator.push(context, MaterialPageRoute(builder: (_) => const AiTutorScreen()));
      };
    } else if (role == 'super_admin' || role == 'platform_admin') {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.people_outlined), label: 'المستخدمون'),
        NavigationDestination(icon: Icon(Icons.school_outlined), label: 'المدرسون'),
        NavigationDestination(icon: Icon(Icons.assessment_outlined), label: 'التقارير'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminUsersScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminTeachersScreen()));
        if (i == 3) Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminReportsScreen()));
      };
    } else if (role == 'parent') {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'الرئيسية'),
        NavigationDestination(icon: Icon(Icons.link), label: 'ربط طالب'),
        NavigationDestination(icon: Icon(Icons.payment_outlined), label: 'المدفوعات'),
      ];
      tabNav = (i) {
        if (i == 1) Navigator.push(context, MaterialPageRoute(builder: (_) => const ParentLinkScreen()));
        if (i == 2) Navigator.push(context, MaterialPageRoute(builder: (_) => const ParentPaymentsScreen()));
      };
    } else {
      items = const [
        NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'الرئيسية'),
      ];
      tabNav = (_) {};
    }

    if (isParent) {
      return NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) {
          if (i == 0) return;
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
      elevation: 2,
      shadowColor: color.withValues(alpha: 0.15),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 14),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTheme.caption),
                const SizedBox(height: 4),
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
              Icon(Icons.link, size: 64, color: AppColors.textTertiary),
              SizedBox(height: 16),
              Text('لم تقم بربط أي طالب بعد', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
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
          const SizedBox(height: 16),
          ...students.map((s) => _buildStudentCard(s)),
        ],
      ),
    );
  }

  Widget _buildStudentCard(Map<String, dynamic> student) {
    final user = student['user'] ?? {};
    final wallet = student['wallet'];
    return Card(
      elevation: 2,
      shadowColor: Colors.black.withValues(alpha: 0.06),
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.primary,
              child: Text(
                (user['name']?[0] ?? '?').toString(),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(user['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text('الصف: ${student['student']?['grade'] ?? '-'}', style: AppTheme.body),
                ],
              ),
            ),
            if (wallet != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${wallet['balance']} ج.م',
                  style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w600, fontSize: 13),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentDashboard() {
    final sessions = (_dashboardData?['sessions'] ?? []) as List;
    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          _buildBannerSection(),
          const SizedBox(height: 20),
          _buildSectionHeader('أكمل التعلم', onTap: () {}),
          _buildContinueLearning(sessions),
          const SizedBox(height: 20),
          _buildSectionHeader('المواد', onTap: () {}),
          _buildSubjectsRow(),
          const SizedBox(height: 20),
          _buildSectionHeader('أفضل المدرسين', onTap: () {}),
          _buildTeachersRow(),
          const SizedBox(height: 20),
          _buildSectionHeader('آخر الدروس', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const StudentSessionsScreen()))),
          ...sessions.take(5).map((s) => _buildNetflixSessionItem(s)),
        ],
      ),
    );
  }

  Widget _buildBannerSection() {
    final banners = [
      {'title': 'تعلم مع أفضل المدرسين', 'subtitle': 'دروس مباشرة وتفاعلية', 'color': AppColors.primary},
      {'title': 'اختبر نفسك', 'subtitle': 'امتحانات وتمارين شاملة', 'color': AppColors.secondary},
      {'title': 'الذكاء الاصطناعي', 'subtitle': 'اسأل واجب عن أي سؤال', 'color': AppColors.success},
    ];
    return SizedBox(
      height: 180,
      child: PageView.builder(
        itemCount: banners.length,
        itemBuilder: (_, i) {
          final b = banners[i];
          return Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [b['color'] as Color, (b['color'] as Color).withValues(alpha: 0.7)]),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(color: (b['color'] as Color).withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8))],
            ),
            child: Padding(
              padding: const EdgeInsets.all(28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(b['title'] as String, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 6),
                  Text(b['subtitle'] as String, style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.85))),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title, {VoidCallback? onTap}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Text(title, style: AppTheme.subheading),
          const Spacer(),
          if (onTap != null)
            TextButton(onPressed: onTap, child: const Text('عرض الكل', style: TextStyle(fontSize: 13))),
        ],
      ),
    );
  }

  Widget _buildContinueLearning(List sessions) {
    return SizedBox(
      height: 140,
      child: sessions.isEmpty
          ? Center(child: Text('لا توجد دروس حالياً', style: AppTheme.body))
          : ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: sessions.length,
              itemBuilder: (_, i) {
                final s = sessions[i];
                return Container(
                  width: 200,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    gradient: AppColors.primaryGradient,
                    boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.2), blurRadius: 12, offset: const Offset(0, 4))],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(s['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
                        const SizedBox(height: 4),
                        Text('${s['teacher_name'] ?? ''}', style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.8))),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                          child: Text('${s['progress'] ?? 'تابع'}', style: const TextStyle(fontSize: 11, color: Colors.white)),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildSubjectsRow() {
    final subjects = [
      {'name': 'رياضيات', 'icon': Icons.functions, 'color': AppColors.primary},
      {'name': 'علوم', 'icon': Icons.biotech, 'color': AppColors.secondary},
      {'name': 'لغات', 'icon': Icons.language, 'color': AppColors.success},
      {'name': 'تاريخ', 'icon': Icons.history, 'color': AppColors.warning},
    ];
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: subjects.length,
        itemBuilder: (_, i) {
          final s = subjects[i];
          return GestureDetector(
            onTap: () {},
            child: Container(
              width: 90,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                color: (s['color'] as Color).withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(s['icon'] as IconData, size: 32, color: s['color'] as Color),
                  const SizedBox(height: 8),
                  Text(s['name'] as String, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: s['color'] as Color)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTeachersRow() {
    return SizedBox(
      height: 120,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: 5,
        itemBuilder: (_, i) {
          return Container(
            width: 100,
            margin: const EdgeInsets.symmetric(horizontal: 4),
            child: Column(children: [
              CircleAvatar(radius: 28, backgroundColor: AppColors.primary.withValues(alpha: 0.1), child: const Icon(Icons.person, color: AppColors.primary)),
              const SizedBox(height: 8),
              Text('مدرس ${i + 1}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              const Text('مادة', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            ]),
          );
        },
      ),
    );
  }

  Widget _buildNetflixSessionItem(dynamic session) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () {},
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    gradient: AppColors.primaryGradient,
                  ),
                  child: const Icon(Icons.play_arrow, color: Colors.white, size: 32),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(session['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      const SizedBox(height: 4),
                      Text(session['teacher_name'] ?? '', style: AppTheme.caption),
                      Row(children: [
                        Icon(Icons.star, size: 14, color: AppColors.warning),
                        const SizedBox(width: 4),
                        Text('${session['rating'] ?? '4.5'}', style: AppTheme.caption),
                        const SizedBox(width: 12),
                        Icon(Icons.people, size: 14, color: AppColors.textTertiary),
                        const SizedBox(width: 4),
                        Text('${session['enrollment_count'] ?? 0}', style: AppTheme.caption),
                      ]),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    session['price'] != null && session['price'] > 0 ? '${session['price']} ج.م' : 'مجاني',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSessionItem(Map<String, dynamic> session) {
    return Card(
      elevation: 1,
      shadowColor: Colors.black.withValues(alpha: 0.04),
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {},
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.live_tv, color: AppColors.primary, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(session['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text(session['subject']?['name'] ?? '', style: AppTheme.caption),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: (session['price'] != null && session['price'] > 0
                      ? AppColors.primary
                      : AppColors.success).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  session['price'] != null && session['price'] > 0
                      ? '${session['price']} ج.م'
                      : 'مجاني',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                    color: session['price'] != null && session['price'] > 0
                        ? AppColors.primary
                        : AppColors.success,
                  ),
                ),
              ),
            ],
          ),
        ),
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
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _buildOverviewCard('إجمالي الحصص', '${sessions is List ? sessions.length : 0}', Icons.live_tv, AppColors.primary)),
              const SizedBox(width: 12),
              Expanded(child: _buildOverviewCard('الطلاب', '---', Icons.people, AppColors.secondary)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Text('الحصص', style: AppTheme.subheading),
              const Spacer(),
              TextButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const TeacherSessionsScreen()),
                ),
                child: const Text('عرض الكل'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (sessions is List && sessions.isEmpty)
            Card(
              elevation: 1,
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Column(
                    children: [
                      Icon(Icons.live_tv, size: 40, color: AppColors.textTertiary),
                      const SizedBox(height: 8),
                      Text('لا توجد حصص بعد', style: AppTheme.body),
                    ],
                  ),
                ),
              ),
            )
          else if (sessions is List)
            ...sessions.take(5).map((s) => _buildSessionItem(s)),
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
            elevation: 2,
            shadowColor: Colors.black.withValues(alpha: 0.06),
            child: ListTile(
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.visibility, color: AppColors.primary),
              ),
              title: const Text('متابعة الطلاب', style: TextStyle(fontWeight: FontWeight.w600)),
              trailing: const Icon(Icons.chevron_left, color: AppColors.textTertiary),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SupervisorStudentsScreen()),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ThemeTogglePlaceholder extends StatelessWidget {
  const _ThemeTogglePlaceholder();
  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
