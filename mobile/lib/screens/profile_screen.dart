import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../theme/app_theme.dart';
import 'login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي')),
      body: ListView(
        padding: const EdgeInsets.all(0),
        children: [
          Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                height: 140,
                decoration: const BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(32),
                    bottomRight: Radius.circular(32),
                  ),
                ),
              ),
              Positioned(
                left: 0,
                right: 0,
                top: 80,
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 52,
                      backgroundColor: Colors.white,
                      child: CircleAvatar(
                        radius: 48,
                        backgroundColor: AppColors.primary,
                        child: Text(
                          _getInitial(user),
                          style: const TextStyle(fontSize: 36, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(user?.name ?? '', style: AppTheme.heading),
                    const SizedBox(height: 4),
                    Text(user?.email ?? '', style: AppTheme.body),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _roleLabel(user?.role ?? ''),
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 100),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Card(
              elevation: 2,
              shadowColor: Colors.black.withValues(alpha: 0.06),
              child: Column(
                children: [
                  if (user?.phone != null)
                    ListTile(
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.phone_outlined, color: AppColors.primary, size: 20),
                      ),
                      title: const Text('رقم الهاتف', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                      subtitle: Text(user!.phone!, style: const TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  if (user?.phone != null) const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.secondary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.settings_outlined, color: AppColors.secondary, size: 20),
                    ),
                    title: const Text('الإعدادات', style: TextStyle(fontSize: 14)),
                    trailing: const Icon(Icons.chevron_left, color: AppColors.textTertiary),
                    onTap: () {},
                  ),
                  const Divider(height: 1, indent: 16, endIndent: 16),
                  ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.help_outline, color: AppColors.warning, size: 20),
                    ),
                    title: const Text('المساعدة', style: TextStyle(fontSize: 14)),
                    trailing: const Icon(Icons.chevron_left, color: AppColors.textTertiary),
                    onTap: () {},
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (_) => false,
                    );
                  }
                },
                icon: const Icon(Icons.logout, size: 20),
                label: const Text('تسجيل الخروج'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.danger,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  String _getInitial(User? user) {
    if (user?.name == null || user!.name.isEmpty) return '?';
    return user.name[0];
  }

  String _roleLabel(String role) {
    const labels = {
      'student': 'طالب',
      'teacher': 'معلم',
      'parent': 'ولي أمر',
      'super_admin': 'مدير عام',
      'platform_admin': 'مدير المنصة',
      'teachers_supervisor': 'مشرف المعلمين',
      'student_supervisor': 'مشرف الطلاب',
    };
    return labels[role] ?? role;
  }
}
