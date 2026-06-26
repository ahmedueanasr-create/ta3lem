import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import 'register_screen.dart';
import 'parent_register_screen.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  void _submitLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final success = await auth.login(_emailController.text.trim(), _passwordController.text);
    if (!success && auth.errorMessage != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage!), backgroundColor: AppColors.danger),
      );
    }
  }

  void _submitOtp() async {
    final auth = context.read<AuthProvider>();
    if (_otpController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('رمز التحقق يجب أن يكون 6 أرقام'), backgroundColor: AppColors.danger),
      );
      return;
    }
    final success = await auth.verifyOtp(_otpController.text);
    if (success && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const DashboardScreen()),
      );
    } else if (auth.errorMessage != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.errorMessage!), backgroundColor: AppColors.danger),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Card(
                elevation: 8,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.all(28),
                  child: !auth.requiresOtp ? _buildLoginForm() : _buildOtpForm(),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    final auth = context.watch<AuthProvider>();
    return Form(
      key: _formKey,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.school, size: 64, color: AppColors.primary),
          const SizedBox(height: 12),
          Text('منصة تعليم', style: AppTheme.heading),
          const SizedBox(height: 8),
          Text('تسجيل الدخول', style: AppTheme.body),
          const SizedBox(height: 24),
          TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'البريد الإلكتروني',
              prefixIcon: Icon(Icons.email),
            ),
            keyboardType: TextInputType.emailAddress,
            validator: (v) => v!.isEmpty ? 'البريد مطلوب' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passwordController,
            decoration: InputDecoration(
              labelText: 'كلمة المرور',
              prefixIcon: const Icon(Icons.lock),
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility : Icons.visibility_off),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            obscureText: _obscurePassword,
            validator: (v) => v!.isEmpty ? 'كلمة المرور مطلوبة' : null,
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: auth.isLoading ? null : _submitLogin,
              child: auth.isLoading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Text('تسجيل الدخول'),
            ),
          ),
          if (auth.devOtp != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
              child: Text('رمز التحقق (وضع التطوير): ${auth.devOtp}', style: const TextStyle(color: AppColors.warning, fontWeight: FontWeight.bold)),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
                child: const Text('تسجيل كطالب جديد'),
              ),
              TextButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ParentRegisterScreen())),
                child: const Text('تسجيل كولي أمر'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOtpForm() {
    final auth = context.watch<AuthProvider>();
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.sms, size: 48, color: AppColors.primary),
        const SizedBox(height: 12),
        Text('رمز التحقق', style: AppTheme.heading),
        const SizedBox(height: 8),
        const Text('أدخل الرمز المرسل إلى هاتفك', style: TextStyle(color: AppColors.textSecondary)),
        const SizedBox(height: 24),
        TextField(
          controller: _otpController,
          decoration: const InputDecoration(
            labelText: 'رمز التحقق (6 أرقام)',
            prefixIcon: Icon(Icons.password),
          ),
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 24, letterSpacing: 8),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: auth.isLoading ? null : _submitOtp,
            child: auth.isLoading
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                : const Text('تأكيد'),
          ),
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: () {
            context.read<AuthProvider>().logout();
            _otpController.clear();
          },
          child: const Text('رجوع'),
        ),
      ],
    );
  }
}
