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
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const SizedBox(height: 20),
            CircleAvatar(
              radius: 48,
              backgroundColor: AppColors.primary,
              child: Text(
                _getInitial(user),
                style: const TextStyle(fontSize: 36, color: Colors.white),
              ),
            ),
            const SizedBox(height: 16),
            Text(user?.name ?? '', style: AppTheme.heading),
            const SizedBox(height: 4),
            Text(user?.email ?? '', style: AppTheme.body),
            const SizedBox(height: 8),
            Chip(
              label: Text(_roleLabel(user?.role ?? '')),
              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            ),
            const SizedBox(height: 32),
            if (user?.phone != null)
              ListTile(
                leading: const Icon(Icons.phone, color: AppColors.primary),
                title: const Text('رقم الهاتف'),
                subtitle: Text(user!.phone!),
              ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.settings, color: AppColors.textSecondary),
              title: const Text('الإعدادات'),
              trailing: const Icon(Icons.chevron_left),
              onTap: () {},
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.help_outline, color: AppColors.textSecondary),
              title: const Text('المساعدة'),
              trailing: const Icon(Icons.chevron_left),
              onTap: () {},
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
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
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.danger,
                  foregroundColor: Colors.white,
                ),
                child: const Text('تسجيل الخروج'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
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
