import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/teacher_provider.dart';
import '../services/api_service.dart';
import '../models/subject.dart';
import '../theme/app_theme.dart';

class TeacherCreateSessionScreen extends StatefulWidget {
  const TeacherCreateSessionScreen({super.key});

  @override
  State<TeacherCreateSessionScreen> createState() => _TeacherCreateSessionScreenState();
}

class _TeacherCreateSessionScreenState extends State<TeacherCreateSessionScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _durationController = TextEditingController();
  final _priceController = TextEditingController();
  final _scheduledDateController = TextEditingController();

  List<Subject> _subjects = [];
  Subject? _selectedSubject;
  bool _isPrivate = false;
  bool _recordingEnabled = true;
  bool _isLoading = true;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadSubjects();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _durationController.dispose();
    _priceController.dispose();
    _scheduledDateController.dispose();
    super.dispose();
  }

  Future<void> _loadSubjects() async {
    try {
      final res = await ApiService.getSubjects();
      final data = res['data'];
      if (data is List) {
        _subjects = data.map((s) => Subject.fromJson(s)).toList();
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      helpText: 'اختر التاريخ',
      cancelText: 'إلغاء',
      confirmText: 'تأكيد',
    );
    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
        helpText: 'اختر الوقت',
        cancelText: 'إلغاء',
        confirmText: 'تأكيد',
      );
      if (time != null) {
        final dt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
        _scheduledDateController.text = dt.toIso8601String();
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى اختيار المادة'), backgroundColor: AppColors.danger),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final data = {
      'title': _titleController.text.trim(),
      'subject_id': _selectedSubject!.id,
      'description': _descriptionController.text.trim(),
      'duration_min': int.tryParse(_durationController.text) ?? 60,
      'price': double.tryParse(_priceController.text) ?? 0,
      'is_private': _isPrivate,
      'recording_enabled': _recordingEnabled,
      if (_scheduledDateController.text.isNotEmpty) 'scheduled_at': _scheduledDateController.text,
    };

    final teacher = context.read<TeacherProvider>();
    final success = await teacher.createSession(data);
    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم إنشاء الحصة بنجاح'), backgroundColor: AppColors.success),
        );
        Navigator.pop(context);
      } else if (teacher.error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(teacher.error!), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إنشاء حصة جديدة')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(labelText: 'عنوان الحصة', prefixIcon: Icon(Icons.title)),
                      validator: (v) => v!.isEmpty ? 'العنوان مطلوب' : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<Subject>(
                      value: _selectedSubject,
                      decoration: const InputDecoration(labelText: 'المادة', prefixIcon: Icon(Icons.book)),
                      items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                      onChanged: (v) => setState(() => _selectedSubject = v),
                      validator: (v) => v == null ? 'المادة مطلوبة' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(labelText: 'الوصف', prefixIcon: Icon(Icons.description), alignLabelWithHint: true),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _scheduledDateController,
                      decoration: const InputDecoration(
                        labelText: 'التاريخ والوقت',
                        prefixIcon: Icon(Icons.calendar_today),
                        hintText: 'اضغط لاختيار التاريخ',
                      ),
                      readOnly: true,
                      onTap: _pickDate,
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _durationController,
                            decoration: const InputDecoration(labelText: 'المدة (دقائق)', prefixIcon: Icon(Icons.timer)),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: TextFormField(
                            controller: _priceController,
                            decoration: const InputDecoration(labelText: 'السعر', prefixIcon: Icon(Icons.attach_money)),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      title: const Text('حصة خاصة'),
                      subtitle: const Text('لن تظهر في قائمة الحصص العامة'),
                      value: _isPrivate,
                      onChanged: (v) => setState(() => _isPrivate = v),
                      secondary: const Icon(Icons.lock),
                    ),
                    SwitchListTile(
                      title: const Text('تفعيل التسجيل'),
                      subtitle: const Text('سيتم تسجيل الحصة تلقائياً'),
                      value: _recordingEnabled,
                      onChanged: (v) => setState(() => _recordingEnabled = v),
                      secondary: const Icon(Icons.videocam),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submit,
                        child: _isSubmitting
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('إنشاء الحصة'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
