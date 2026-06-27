import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/teacher_provider.dart';
import '../services/api_service.dart';
import '../models/subject.dart';
import '../theme/app_theme.dart';

class TeacherCoursesScreen extends StatefulWidget {
  const TeacherCoursesScreen({super.key});

  @override
  State<TeacherCoursesScreen> createState() => _TeacherCoursesScreenState();
}

class _TeacherCoursesScreenState extends State<TeacherCoursesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TeacherProvider>().loadCourses();
    });
  }

  Future<void> _refresh() async {
    await context.read<TeacherProvider>().loadCourses();
  }

  void _showCreateDialog() {
    final titleCtrl = TextEditingController();
    final descriptionCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    List<Subject> subjects = [];
    Subject? selectedSubject;
    bool loading = true;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setDialogState) {
            if (loading) {
              ApiService.getSubjects().then((res) {
                final data = res['data'];
                if (data is List) {
                  subjects = data.map((s) => Subject.fromJson(s)).toList();
                }
                setDialogState(() => loading = false);
              });
            }

            return AlertDialog(
              title: const Text('إنشاء كورس جديد'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: titleCtrl,
                      decoration: const InputDecoration(labelText: 'عنوان الكورس'),
                    ),
                    const SizedBox(height: 12),
                    if (loading)
                      const Center(child: CircularProgressIndicator())
                    else
                      DropdownButtonFormField<Subject>(
                        value: selectedSubject,
                        decoration: const InputDecoration(labelText: 'المادة'),
                        items: subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                        onChanged: (v) => setDialogState(() => selectedSubject = v),
                      ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: descriptionCtrl,
                      decoration: const InputDecoration(labelText: 'الوصف'),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: priceCtrl,
                      decoration: const InputDecoration(labelText: 'السعر'),
                      keyboardType: TextInputType.number,
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
                ElevatedButton(
                  onPressed: () async {
                    if (titleCtrl.text.trim().isEmpty) return;
                    try {
                      await ApiService.createCourse({
                        'title': titleCtrl.text.trim(),
                        'subject_id': selectedSubject?.id,
                        'description': descriptionCtrl.text.trim(),
                        'price': double.tryParse(priceCtrl.text) ?? 0,
                      });
                      if (ctx.mounted) {
                        Navigator.pop(ctx);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('تم إنشاء الكورس'), backgroundColor: AppColors.success),
                          );
                          _refresh();
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
                  child: const Text('إنشاء'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final teacher = context.watch<TeacherProvider>();
    final courses = teacher.myCourses;

    return Scaffold(
      appBar: AppBar(title: const Text('الكورسات')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: courses.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 120),
                  Center(
                    child: Column(
                      children: [
                        Icon(Icons.book, size: 64, color: AppColors.textSecondary),
                        SizedBox(height: 12),
                        Text('لا توجد كورسات بعد', style: TextStyle(color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ],
              )
            : ListView.builder(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                itemCount: courses.length,
                itemBuilder: (context, index) {
                  final course = courses[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: AppColors.primary,
                        child: Icon(Icons.book, color: Colors.white),
                      ),
                      title: Text(course.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (course.subjectName != null) Text(course.subjectName!),
                          Row(
                            children: [
                              const Icon(Icons.people, size: 14, color: AppColors.textSecondary),
                              const SizedBox(width: 4),
                              Text('${course.studentCount ?? 0} طالب'),
                              const SizedBox(width: 12),
                              Text('${course.price} ج.م', style: const TextStyle(color: AppColors.success)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
