import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _guardianNameController = TextEditingController();
  final _guardianPhoneController = TextEditingController();
  final _gradeController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _guardianNameController.dispose();
    _guardianPhoneController.dispose();
    _gradeController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await ApiService.registerStudent({
        'name': _nameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'password': _passwordController.text,
        'guardian_name': _guardianNameController.text.trim(),
        'guardian_phone': _guardianPhoneController.text.trim(),
        'grade': _gradeController.text.trim(),
      });

      if (res['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم التسجيل بنجاح! يمكنك تسجيل الدخول'), backgroundColor: AppColors.success),
        );
        Navigator.pop(context);
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'خطأ: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تسجيل طالب جديد')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'الاسم الكامل (ثلاثي على الأقل)', prefixIcon: Icon(Icons.person)),
                  validator: (v) {
                    if (v == null || v.trim().split(' ').length < 3) return 'يجب أن يكون الاسم ثلاثياً على الأقل';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'البريد الإلكتروني', prefixIcon: Icon(Icons.email)),
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v!.contains('@') ? null : 'بريد غير صحيح',
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  decoration: const InputDecoration(labelText: 'رقم الهاتف (01XXXXXXXXX)', prefixIcon: Icon(Icons.phone)),
                  keyboardType: TextInputType.phone,
                  validator: (v) => RegExp(r'^01[0-9]{9}$').hasMatch(v!) ? null : 'رقم غير صحيح',
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'كلمة المرور (8 أحرف+)', prefixIcon: Icon(Icons.lock)),
                  obscureText: true,
                  validator: (v) => v!.length >= 8 ? null : '8 أحرف على الأقل',
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _guardianNameController,
                  decoration: const InputDecoration(labelText: 'اسم ولي الأمر', prefixIcon: Icon(Icons.person_outline)),
                  validator: (v) => v!.isEmpty ? 'مطلوب' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _guardianPhoneController,
                  decoration: const InputDecoration(labelText: 'هاتف ولي الأمر', prefixIcon: Icon(Icons.phone_android)),
                  keyboardType: TextInputType.phone,
                  validator: (v) => RegExp(r'^01[0-9]{9}$').hasMatch(v!) ? null : 'رقم غير صحيح',
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _gradeController,
                  decoration: const InputDecoration(labelText: 'الصف الدراسي (اختياري)', prefixIcon: Icon(Icons.school)),
                ),
                const SizedBox(height: 24),
                if (_error != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(_error!, style: const TextStyle(color: AppColors.danger)),
                  ),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    child: _isLoading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('تسجيل'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
