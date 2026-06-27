import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/teacher_provider.dart';
import '../services/api_service.dart';
import '../models/teacher.dart';
import '../theme/app_theme.dart';

class TeacherProfileScreen extends StatefulWidget {
  const TeacherProfileScreen({super.key});

  @override
  State<TeacherProfileScreen> createState() => _TeacherProfileScreenState();
}

class _TeacherProfileScreenState extends State<TeacherProfileScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TeacherProvider>().loadProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final teacher = context.watch<TeacherProvider>();
    final profile = teacher.profile;

    return Scaffold(
      appBar: AppBar(title: const Text('الملف الشخصي'), actions: [
        IconButton(
          icon: const Icon(Icons.edit),
          onPressed: () => _showEditDialog(profile),
        ),
      ]),
      body: profile == null
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const SizedBox(height: 20),
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      (profile.name.isNotEmpty ? profile.name[0] : '?'),
                      style: const TextStyle(fontSize: 36, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(profile.name, style: AppTheme.heading),
                  const SizedBox(height: 4),
                  if (profile.subjectName != null)
                    Chip(
                      label: Text(profile.subjectName!),
                      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                    ),
                  const SizedBox(height: 24),
                  if (profile.email != null)
                    ListTile(
                      leading: const Icon(Icons.email, color: AppColors.primary),
                      title: const Text('البريد الإلكتروني'),
                      subtitle: Text(profile.email!),
                    ),
                  if (profile.phone != null)
                    ListTile(
                      leading: const Icon(Icons.phone, color: AppColors.primary),
                      title: const Text('رقم الهاتف'),
                      subtitle: Text(profile.phone!),
                    ),
                  if (profile.bio != null)
                    ListTile(
                      leading: const Icon(Icons.info, color: AppColors.primary),
                      title: const Text('نبذة'),
                      subtitle: Text(profile.bio!),
                    ),
                  if (profile.rating != null)
                    ListTile(
                      leading: const Icon(Icons.star, color: AppColors.warning),
                      title: const Text('التقييم'),
                      subtitle: Text('${profile.rating!.toStringAsFixed(1)} / 5.0'),
                    ),
                  if (profile.pricing != null && profile.pricing!.isNotEmpty) ...[
                    const Divider(),
                    const Text('أسعار الجلسات', style: TextStyle(fontWeight: FontWeight.bold)),
                    ...profile.pricing!.map((p) => ListTile(
                          leading: const Icon(Icons.attach_money, color: AppColors.success),
                          title: Text(p.type),
                          subtitle: Text('${p.price} ج.م'),
                        )),
                  ],
                ],
              ),
            ),
    );
  }

  void _showEditDialog(TeacherProfile? profile) {
    final nameCtrl = TextEditingController(text: profile?.name ?? '');
    final emailCtrl = TextEditingController(text: profile?.email ?? '');
    final phoneCtrl = TextEditingController(text: profile?.phone ?? '');
    final bioCtrl = TextEditingController(text: profile?.bio ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تعديل الملف الشخصي'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'الاسم')),
              const SizedBox(height: 12),
              TextField(controller: emailCtrl, decoration: const InputDecoration(labelText: 'البريد الإلكتروني')),
              const SizedBox(height: 12),
              TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: 'رقم الهاتف')),
              const SizedBox(height: 12),
              TextField(controller: bioCtrl, decoration: const InputDecoration(labelText: 'نبذة'), maxLines: 3),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              try {
                await ApiService.updateTeacherProfile({
                  'name': nameCtrl.text.trim(),
                  'email': emailCtrl.text.trim(),
                  'phone': phoneCtrl.text.trim(),
                  'bio': bioCtrl.text.trim(),
                });
                if (ctx.mounted) {
                  Navigator.pop(ctx);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('تم تحديث الملف'), backgroundColor: AppColors.success),
                    );
                    context.read<TeacherProvider>().loadProfile();
                  }
                }
              } catch (e) {
                if (ctx.mounted) {
                  ScaffoldMessenger.of(ctx).showSnackBar(
                    SnackBar(content: Text('فشل: $e'), backgroundColor: AppColors.danger),
                  );
                }
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );
  }
}
