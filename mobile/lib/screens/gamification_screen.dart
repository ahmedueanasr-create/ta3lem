import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class GamificationScreen extends StatelessWidget {
  const GamificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الإنجازات والمكافآت')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildLevelCard(),
          const SizedBox(height: 16),
          _buildStatsRow(),
          const SizedBox(height: 16),
          _buildBadgesSection(context),
          const SizedBox(height: 16),
          _buildStreakCard(),
        ],
      ),
    );
  }

  Widget _buildLevelCard() {
    return Card(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.8)], begin: Alignment.topLeft, end: Alignment.bottomRight),
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          Container(padding: const EdgeInsets.all(16), decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white24), child: const Icon(Icons.auto_awesome, size: 48, color: Colors.white)),
          const SizedBox(height: 12),
          const Text('المستوى 5', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 4),
          Text('طالب نشط', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 14)),
          const SizedBox(height: 16),
          ClipRRect(borderRadius: BorderRadius.circular(8), child: LinearProgressIndicator(value: 0.65, minHeight: 10, backgroundColor: Colors.white24, valueColor: const AlwaysStoppedAnimation(Colors.white))),
          const SizedBox(height: 6),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('650 XP', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
            Text('1000 XP', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12)),
          ]),
        ]),
      ),
    );
  }

  Widget _buildStatsRow() {
    final stats = [
      {'icon': Icons.star, 'value': '1,250', 'label': 'إجمالي XP', 'color': AppColors.warning},
      {'icon': Icons.menu_book, 'value': '18', 'label': 'دروس مكتملة', 'color': AppColors.primary},
      {'icon': Icons.quiz, 'value': '42', 'label': 'اختبارات', 'color': AppColors.success},
      {'icon': Icons.local_fire_department, 'value': '7', 'label': 'أيام متتالية', 'color': AppColors.danger},
    ];
    return Row(children: stats.map((s) => Expanded(
      child: Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(children: [
        Icon(s['icon'] as IconData, color: s['color'] as Color, size: 28),
        const SizedBox(height: 6),
        Text(s['value'] as String, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: s['color'] as Color)),
        Text(s['label'] as String, style: const TextStyle(fontSize: 10, color: AppColors.textTertiary)),
      ]))),
    )).toList());
  }

  Widget _buildBadgesSection(BuildContext context) {
    final badges = [
      {'icon': Icons.emoji_events, 'label': 'الانطلاق', 'desc': 'أول درس', 'unlocked': true, 'color': AppColors.warning},
      {'icon': Icons.school, 'label': 'المثابر', 'desc': '10 دروس', 'unlocked': true, 'color': AppColors.primary},
      {'icon': Icons.star, 'label': 'النجم', 'desc': 'امتحان كامل', 'unlocked': true, 'color': AppColors.success},
      {'icon': Icons.whatshot, 'label': 'النار', 'desc': '7 أيام متتالية', 'unlocked': false, 'color': AppColors.danger},
      {'icon': Icons.psychology, 'label': 'العبقري', 'desc': 'درجة كاملة', 'unlocked': false, 'color': AppColors.secondary},
      {'icon': Icons.group, 'label': 'المعلم', 'desc': 'ساعد زميلاً', 'unlocked': false, 'color': AppColors.info},
    ];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.emoji_events, color: AppColors.warning)),
            const SizedBox(width: 12),
            Text('الشارات', style: AppTheme.subheading),
            const Spacer(),
            Text('3/6', style: const TextStyle(color: AppColors.textTertiary, fontWeight: FontWeight.w600)),
          ]),
          const SizedBox(height: 16),
          Wrap(spacing: 12, runSpacing: 12, children: badges.map((b) => SizedBox(
            width: (MediaQuery.of(context).size.width - 80) / 3,
            child: Column(children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: b['unlocked'] as bool ? (b['color'] as Color).withValues(alpha: 0.12) : AppColors.surfaceVariant,
                ),
                child: Icon(b['icon'] as IconData, size: 28, color: b['unlocked'] as bool ? b['color'] as Color : AppColors.textTertiary),
              ),
              const SizedBox(height: 4),
              Text(b['label'] as String, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: b['unlocked'] as bool ? null : AppColors.textTertiary)),
              Text(b['desc'] as String, style: TextStyle(fontSize: 9, color: b['unlocked'] as bool ? AppColors.textTertiary : AppColors.textTertiary.withValues(alpha: 0.5))),
            ]),
          )).toList()),
        ]),
      ),
    );
  }

  Widget _buildStreakCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.local_fire_department, color: AppColors.danger)),
            const SizedBox(width: 12),
            Text('التحديات', style: AppTheme.subheading),
          ]),
          const SizedBox(height: 16),
          _buildChallenge('ادرس 5 أيام متتالية', 0.8, '4/5'),
          const SizedBox(height: 12),
          _buildChallenge('أكمل 3 اختبارات', 0.33, '1/3'),
          const SizedBox(height: 12),
          _buildChallenge('شاهد فيديوهين', 0.5, '1/2'),
        ]),
      ),
    );
  }

  Widget _buildChallenge(String title, double progress, String label) {
    return Row(children: [
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
          const SizedBox(height: 4),
          ClipRRect(borderRadius: BorderRadius.circular(6), child: LinearProgressIndicator(value: progress, minHeight: 6, backgroundColor: AppColors.surfaceVariant, valueColor: const AlwaysStoppedAnimation(AppColors.success))),
        ]),
      ),
      const SizedBox(width: 12),
      Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)), child: Text(label, style: const TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.bold))),
    ]);
  }
}
