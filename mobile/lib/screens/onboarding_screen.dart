import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import 'landing_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  final _pages = const [
    _OnboardingPageData(
      icon: Icons.auto_stories,
      title: 'لماذا المنصة؟',
      subtitle: 'منصة تعليمية متكاملة تجمع بين أحدث التقنيات\nلتجربة تعلم فريدة وممتعة',
      color: AppColors.primary,
    ),
    _OnboardingPageData(
      icon: Icons.school,
      title: 'كيف تتعلم؟',
      subtitle: 'دروس مباشرة، فيديوهات تفاعلية، تمارين\nواختبارات مع متابعة شخصية',
      color: AppColors.secondary,
    ),
    _OnboardingPageData(
      icon: Icons.auto_awesome,
      title: 'مزايا التطبيق',
      subtitle: 'دروس بدون إنترنت، ذكاء اصطناعي،\nوتقارير تقدم متطورة',
      color: AppColors.success,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_done', true);
    if (!mounted) return;
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LandingScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (i) => setState(() => _currentPage = i),
                  itemCount: _pages.length,
                  itemBuilder: (context, index) => _buildPage(_pages[index]),
                ),
              ),
              _buildBottomBar(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPage(_OnboardingPageData page) {
    return AnimatedBuilder(
      animation: _pageController,
      builder: (context, child) {
        double value = 1;
        if (_pageController.position.haveDimensions) {
          value = (_pageController.page! - _pages.indexOf(page)).clamp(-1, 1).toDouble();
        }
        return Transform.translate(
          offset: Offset(value * 50.0, 0),
          child: Opacity(
            opacity: 1 - value.abs() * 0.3,
            child: child,
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.12),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 30, spreadRadius: 5),
                ],
              ),
              child: Icon(page.icon, size: 72, color: Colors.white),
            ),
            const SizedBox(height: 40),
            Text(
              page.title,
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 16),
            Text(
              page.subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.white.withValues(alpha: 0.85), height: 1.6),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          TextButton(
            onPressed: _finish,
            child: Text('تخطي', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 16)),
          ),
          Row(
            children: List.generate(_pages.length, (i) {
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: _currentPage == i ? 28 : 10,
                height: 10,
                decoration: BoxDecoration(
                  color: _currentPage == i ? Colors.white : Colors.white.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(5),
                ),
              );
            }),
          ),
          _currentPage == _pages.length - 1
              ? ElevatedButton(
                  onPressed: _finish,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('ابدأ الآن', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                )
              : IconButton(
                  onPressed: () => _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut),
                  icon: const Icon(Icons.arrow_forward_ios, color: Colors.white),
                ),
        ],
      ),
    );
  }
}

class _OnboardingPageData {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  const _OnboardingPageData({required this.icon, required this.title, required this.subtitle, required this.color});
}
