import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ParentLinkScreen extends StatefulWidget {
  const ParentLinkScreen({super.key});

  @override
  State<ParentLinkScreen> createState() => _ParentLinkScreenState();
}

class _ParentLinkScreenState extends State<ParentLinkScreen> {
  final _formKey = GlobalKey<FormState>();
  final _codeController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      final res = await ApiService.parentLinkStudent(_codeController.text.trim());
      if (res['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم ربط الطالب بنجاح'), backgroundColor: AppColors.success),
        );
        Navigator.pop(context, true);
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppColors.danger),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ربط طالب')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 20),
                const Icon(Icons.link, size: 64, color: AppColors.primary),
                const SizedBox(height: 16),
                Text('ربط طالب بحساب ولي الأمر', style: AppTheme.heading),
                const SizedBox(height: 8),
                Text('أدخل رمز الطالب المكون من 8 أحرف', style: AppTheme.body),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _codeController,
                  decoration: const InputDecoration(
                    labelText: 'رمز الطالب',
                    prefixIcon: Icon(Icons.qr_code),
                    hintText: 'مثال: ABCD1234',
                  ),
                  textCapitalization: TextCapitalization.characters,
                  maxLength: 8,
                  validator: (v) {
                    if (v == null || v.trim().length != 8) return 'يجب أن يكون الرمز 8 أحرف';
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    child: _isLoading
                        ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('ربط'),
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
