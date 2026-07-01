import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'landing_screen.dart';
import 'onboarding_screen.dart';
import 'dashboard_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<double> _scaleAnim;
  String _status = '';

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _animController, curve: Curves.easeIn));
    _scaleAnim = Tween<double>(begin: 0.5, end: 1).animate(CurvedAnimation(parent: _animController, curve: Curves.elasticOut));
    _animController.forward();
    _initApp();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _initApp() async {
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;

    await _loadTheme();
    if (!mounted) return;

    await _checkConnection();
    if (!mounted) return;

    await _tryAutoLogin();
  }

  Future<void> _loadTheme() async {
    setState(() => _status = 'جاري تحميل الإعدادات...');
    await Future.delayed(const Duration(milliseconds: 300));
  }

  Future<void> _checkConnection() async {
    setState(() => _status = 'جاري فحص الاتصال...');
    try {
      await ApiService.init();
      await Future.delayed(const Duration(milliseconds: 500));
    } catch (_) {}
  }

  Future<void> _tryAutoLogin() async {
    setState(() => _status = 'جاري تسجيل الدخول...');
    if (!mounted) return;

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('access_token');
    final onboarded = prefs.getBool('onboarding_done') ?? false;

    if (!mounted) return;

    if (token != null) {
      final auth = context.read<AuthProvider>();
      await auth.init();
      if (!mounted) return;

      if (auth.isAuthenticated) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (!mounted) return;
        _navigateTo(const DashboardScreen());
        return;
      }
    }

    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;

    if (!onboarded) {
      _navigateTo(const OnboardingScreen());
    } else {
      _navigateTo(const LandingScreen());
    }
  }

  void _navigateTo(Widget screen) {
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              FadeTransition(
                opacity: _fadeAnim,
                child: ScaleTransition(
                  scale: _scaleAnim,
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.15),
                          blurRadius: 40,
                          spreadRadius: 8,
                        ),
                      ],
                    ),
                    child: const Icon(Icons.school, size: 80, color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              FadeTransition(
                opacity: _fadeAnim,
                child: const Text(
                  'منصة تعليم',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: 1.2),
                ),
              ),
              const SizedBox(height: 48),
              AnimatedOpacity(
                opacity: _status.isNotEmpty ? 1 : 0,
                duration: const Duration(milliseconds: 300),
                child: Column(
                  children: [
                    const SizedBox(
                      width: 28,
                      height: 28,
                      child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white70),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _status,
                      style: TextStyle(fontSize: 14, color: Colors.white.withValues(alpha: 0.8)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
