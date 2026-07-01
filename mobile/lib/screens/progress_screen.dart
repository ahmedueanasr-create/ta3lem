import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../theme/app_theme.dart';

class ProgressScreen extends StatelessWidget {
  const ProgressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('التقدم الدراسي')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildStudyHoursCard(),
          const SizedBox(height: 16),
          _buildCompletionCard(),
          const SizedBox(height: 16),
          _buildSubjectBreakdown(),
          const SizedBox(height: 16),
          _buildWeeklyStreak(),
        ],
      ),
    );
  }

  Widget _buildStudyHoursCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.timer, color: AppColors.primary)),
            const SizedBox(width: 12),
            Text('ساعات الدراسة', style: AppTheme.subheading),
          ]),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: 8,
                barTouchData: BarTouchData(enabled: true),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, getTitlesWidget: (v, _) => Text(['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'][v.toInt()], style: const TextStyle(fontSize: 10)))),
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28, getTitlesWidget: (v, _) => Text('${v.toInt()}', style: const TextStyle(fontSize: 10)))),
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(show: true, drawVerticalLine: false, horizontalInterval: 2),
                borderData: FlBorderData(show: false),
                barGroups: [
                  _bar(0, 2.5, AppColors.primary),
                  _bar(1, 4.0, AppColors.secondary),
                  _bar(2, 3.0, AppColors.success),
                  _bar(3, 6.5, AppColors.warning),
                  _bar(4, 5.0, AppColors.danger),
                  _bar(5, 7.0, AppColors.primary),
                  _bar(6, 4.5, AppColors.secondary),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          const Center(child: Text('المعدل اليومي: 4.6 ساعات', style: TextStyle(color: AppColors.textTertiary, fontSize: 12))),
        ]),
      ),
    );
  }

  BarChartGroupData _bar(int x, double y, Color color) {
    return BarChartGroupData(x: x, barRods: [BarChartRodData(toY: y, color: color, width: 18, borderRadius: const BorderRadius.only(topLeft: Radius.circular(4), topRight: Radius.circular(4)))]);
  }

  Widget _buildCompletionCard() {
    final items = [
      {'label': 'رياضيات', 'progress': 0.75, 'color': AppColors.primary},
      {'label': 'علوم', 'progress': 0.60, 'color': AppColors.success},
      {'label': 'لغة عربية', 'progress': 0.90, 'color': AppColors.warning},
      {'label': 'إنجليزي', 'progress': 0.45, 'color': AppColors.secondary},
    ];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.pie_chart, color: AppColors.success)),
            const SizedBox(width: 12),
            Text('نسبة الإنجاز', style: AppTheme.subheading),
          ]),
          const SizedBox(height: 16),
          ...items.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text(e['label'] as String, style: const TextStyle(fontWeight: FontWeight.w500)),
                Text('${((e['progress'] as double) * 100).toInt()}%', style: const TextStyle(color: AppColors.textTertiary, fontSize: 13)),
              ]),
              const SizedBox(height: 4),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(value: e['progress'] as double, minHeight: 8, backgroundColor: AppColors.surfaceVariant, valueColor: AlwaysStoppedAnimation(e['color'] as Color)),
              ),
            ]),
          )),
        ]),
      ),
    );
  }

  Widget _buildSubjectBreakdown() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.auto_graph, color: AppColors.warning)),
            const SizedBox(width: 12),
            Text('توزيع المواد', style: AppTheme.subheading),
          ]),
          const SizedBox(height: 16),
          SizedBox(
            height: 160,
            child: PieChart(
              PieChartData(
                sections: [
                  PieChartSectionData(value: 35, title: 'رياضيات', color: AppColors.primary, radius: 50, titleStyle: const TextStyle(fontSize: 10, color: Colors.white)),
                  PieChartSectionData(value: 25, title: 'علوم', color: AppColors.success, radius: 50, titleStyle: const TextStyle(fontSize: 10, color: Colors.white)),
                  PieChartSectionData(value: 20, title: 'عربية', color: AppColors.warning, radius: 50, titleStyle: const TextStyle(fontSize: 10, color: Colors.white)),
                  PieChartSectionData(value: 20, title: 'إنجليزي', color: AppColors.secondary, radius: 50, titleStyle: const TextStyle(fontSize: 10, color: Colors.white)),
                ],
                sectionsSpace: 2,
                centerSpaceRadius: 30,
              ),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _buildWeeklyStreak() {
    final days = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];
    final active = [true, true, true, false, true, true, false];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)), child: const Icon(Icons.local_fire_department, color: AppColors.danger)),
            const SizedBox(width: 12),
            Text('المواظبة الأسبوعية', style: AppTheme.subheading),
            const Spacer(),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(12)), child: const Text('5 أيام', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
          ]),
          const SizedBox(height: 16),
          Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: days.asMap().entries.map((e) => Column(children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: active[e.key] ? AppColors.success : AppColors.surfaceVariant,
              ),
              child: Center(child: Icon(Icons.check, size: 18, color: active[e.key] ? Colors.white : AppColors.textTertiary)),
            ),
            const SizedBox(height: 4),
            Text(days[e.key], style: TextStyle(fontSize: 11, color: active[e.key] ? AppColors.success : AppColors.textTertiary)),
          ])).toList()),
        ]),
      ),
    );
  }
}
