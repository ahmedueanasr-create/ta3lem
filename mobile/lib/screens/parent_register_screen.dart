import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ParentRegisterScreen extends StatefulWidget {
  const ParentRegisterScreen({super.key});

  @override
  State<ParentRegisterScreen> createState() => _ParentRegisterScreenState();
}

class _ParentRegisterScreenState extends State<ParentRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _studentCodeController = TextEditingController();
  String _relationType = 'أب';
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _studentCodeController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await ApiService.parentRegister({
        'fullName': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'password': _passwordController.text,
        'relationType': _relationType,
        if (_studentCodeController.text.isNotEmpty) 'studentCode': _studentCodeController.text.trim(),
      });

      if (res['success'] == true && mounted) {
        final email = res['data']?['user']?['email'] ?? '';
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('تم التسجيل بنجاح! بريدك: $email'),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 5),
          ),
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
      appBar: AppBar(title: const Text('تسجيل ولي أمر')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const Icon(Icons.family_restroom, size: 48, color: AppColors.primary),
                const SizedBox(height: 12),
                Text('حساب ولي الأمر', style: AppTheme.heading),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'الاسم الكامل', prefixIcon: Icon(Icons.person)),
                  validator: (v) => v!.length < 2 ? 'الاسم مطلوب' : null,
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
                DropdownButtonFormField<String>(
                  initialValue: _relationType,
                  decoration: const InputDecoration(labelText: 'صلة القرابة', prefixIcon: Icon(Icons.people)),
                  items: const [
                    DropdownMenuItem(value: 'أب', child: Text('أب')),
                    DropdownMenuItem(value: 'أم', child: Text('أم')),
                    DropdownMenuItem(value: 'وصي', child: Text('وصي')),
                    DropdownMenuItem(value: 'غيره', child: Text('غيره')),
                  ],
                  onChanged: (v) => setState(() => _relationType = v!),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _studentCodeController,
                  decoration: const InputDecoration(
                    labelText: 'رمز ربط الطالب (اختياري - 8 أحرف)',
                    prefixIcon: Icon(Icons.link),
                    hintText: 'احصل عليه من حساب الطالب',
                  ),
                  textCapitalization: TextCapitalization.characters,
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
