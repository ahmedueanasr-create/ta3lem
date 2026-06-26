import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'verify_certificate_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  Map<String, dynamic>? _dashboardData;
  bool _isLoading = true;

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
        _dashboardData = {
          'sessions': sessions['data'],
          'wallet': wallet['data'],
        };
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
    return Scaffold(
      body: _buildBody(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        destinations: [
          const NavigationDestination(icon: Icon(Icons.dashboard), label: 'الرئيسية'),
          const NavigationDestination(icon: Icon(Icons.verified), label: 'الشهادات'),
          NavigationDestination(icon: const Icon(Icons.person), label: (auth.user?.name ?? 'حسابي').split(' ').first),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_currentIndex) {
      case 0:
        return _buildDashboard();
      case 1:
        return const VerifyCertificateScreen();
      case 2:
        return const ProfileScreen();
      default:
        return _buildDashboard();
    }
  }

  Widget _buildDashboard() {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      appBar: AppBar(
        title: Text('مرحباً، ${(auth.user?.name ?? '').split(' ').first}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (auth.user?.isParent == true) _buildParentDashboard(),
                    if (auth.user?.isStudent == true) _buildStudentDashboard(),
                    if (auth.user?.isTeacher == true) _buildTeacherDashboard(),
                  ],
                ),
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('أبنائي الطلاب', style: AppTheme.heading),
        const SizedBox(height: 12),
        ...students.map((s) => _buildStudentCard(s)),
      ],
    );
  }

  Widget _buildStudentCard(Map<String, dynamic> student) {
    final user = student['user'] ?? {};
    final grades = student['recentGrades'] as List? ?? [];
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
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  child: Text(user['name']?[0] ?? '?', style: const TextStyle(color: Colors.white)),
                ),
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
                if (wallet != null)
                  Chip(
                    label: Text('${wallet['balance']} ج.م'),
                    backgroundColor: AppColors.success.withValues(alpha: 0.1),
                  ),
              ],
            ),
            if (grades.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text('آخر النتائج:', style: TextStyle(fontWeight: FontWeight.w600)),
              ...grades.take(3).map((g) => ListTile(
                    dense: true,
                    leading: Icon(
                      (g['score'] ?? 0) >= 50 ? Icons.check_circle : Icons.cancel,
                      color: (g['score'] ?? 0) >= 50 ? AppColors.success : AppColors.danger,
                    ),
                    title: Text('الدرجة: ${g['score']}%'),
                  )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStudentDashboard() {
    final sessions = _dashboardData?['sessions'] ?? [];
    final wallet = _dashboardData?['wallet'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (wallet != null)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.account_balance_wallet, color: AppColors.success, size: 32),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('رصيد المحفظة'),
                      Text('${wallet['balance']} ج.م', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.success)),
                    ],
                  ),
                ],
              ),
            ),
          ),
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
    );
  }

  Widget _buildTeacherDashboard() {
    final sessions = _dashboardData?['sessions'] ?? [];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
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
    );
  }
}
