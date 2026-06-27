import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/admin_provider.dart';
import '../models/subject.dart' show Subject;

class AdminSubjectsScreen extends StatefulWidget {
  const AdminSubjectsScreen({super.key});

  @override
  State<AdminSubjectsScreen> createState() => _AdminSubjectsScreenState();
}

class _AdminSubjectsScreenState extends State<AdminSubjectsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().loadSubjects();
    });
  }

  Future<void> _showAddDialog() async {
    final nameController = TextEditingController();
    final descController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => Directionality(
        textDirection: TextDirection.rtl,
        child: AlertDialog(
          title: const Text('إضافة مادة جديدة'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'اسم المادة'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'يرجى إدخال الاسم' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: descController,
                  decoration: const InputDecoration(labelText: 'الوصف'),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('إلغاء'),
            ),
            ElevatedButton(
              onPressed: () {
                if (formKey.currentState!.validate()) {
                  Navigator.pop(ctx, true);
                }
              },
              child: const Text('إضافة'),
            ),
          ],
        ),
      ),
    );

    if (result == true && mounted) {
      final admin = context.read<AdminProvider>();
      final ok = await admin.createSubject({
        'name': nameController.text.trim(),
        'description': descController.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(ok ? 'تم إضافة المادة بنجاح' : 'فشل في إضافة المادة')),
        );
      }
    }

    nameController.dispose();
    descController.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('المواد الدراسية')),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddDialog,
        child: const Icon(Icons.add),
      ),
      body: admin.isLoading && admin.subjects.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : admin.subjects.isEmpty
              ? Center(child: Text('لا توجد مواد', style: AppTheme.body))
              : RefreshIndicator(
                  onRefresh: () => admin.loadSubjects(),
                  child: ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: admin.subjects.length,
                    itemBuilder: (ctx, i) {
                      final s = admin.subjects[i];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: s.active ? AppColors.primary : AppColors.textSecondary,
                            child: Text(
                              s.name.isNotEmpty ? s.name[0] : '?',
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(s.description ?? ''),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (s.teacherCount != null)
                                Padding(
                                  padding: const EdgeInsets.only(left: 8),
                                  child: Text('${s.teacherCount} معلم', style: AppTheme.body),
                                ),
                              if (s.sessionCount != null)
                                Text('${s.sessionCount} حصة', style: AppTheme.body),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
