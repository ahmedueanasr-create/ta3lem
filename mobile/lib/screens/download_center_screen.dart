import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class DownloadCenterScreen extends StatelessWidget {
  const DownloadCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('مركز التحميل')),
      body: Column(children: [
        _buildStorageCard(),
        Expanded(child: ListView(padding: const EdgeInsets.all(16), children: [
          _buildSectionHeader('قيد التحميل'),
          _buildDownloadItem('درس الجبر - الجزء الأول', '45%', 'فيديو', Icons.video_library, AppColors.primary, 0.45),
          const Divider(height: 24),
          _buildSectionHeader('مكتمل'),
          _buildDownloadItem('ملخص النحو', 'مكتمل', 'PDF', Icons.picture_as_pdf, AppColors.danger, 1.0),
          _buildDownloadItem('اختبار الرياضيات', 'مكتمل', 'اختبار', Icons.quiz, AppColors.success, 1.0),
          _buildDownloadItem('فيديو العلوم - التجارب', 'مكتمل', 'فيديو', Icons.video_library, AppColors.primary, 1.0),
          _buildDownloadItem('قواعد اللغة الإنجليزية', 'مكتمل', 'PDF', Icons.picture_as_pdf, AppColors.danger, 1.0),
        ])),
      ]),
    );
  }

  Widget _buildStorageCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [AppColors.secondary, AppColors.secondary.withValues(alpha: 0.8)]),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('التخزين', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          Text('1.2 GB / 8 GB', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
        ]),
        const SizedBox(height: 12),
        ClipRRect(borderRadius: BorderRadius.circular(8), child: LinearProgressIndicator(value: 0.15, minHeight: 10, backgroundColor: Colors.white24, valueColor: const AlwaysStoppedAnimation(Colors.white))),
        const SizedBox(height: 8),
        Row(children: [
          _storageChip('فيديو', '850 MB', Colors.white24),
          const SizedBox(width: 8),
          _storageChip('PDF', '320 MB', Colors.white24),
          const SizedBox(width: 8),
          _storageChip('أخرى', '50 MB', Colors.white24),
        ]),
      ]),
    );
  }

  Widget _storageChip(String label, String size, Color bg) {
    return Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)), child: Text('$label: $size', style: const TextStyle(color: Colors.white, fontSize: 11)));
  }

  Widget _buildSectionHeader(String title) {
    return Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.textSecondary)));
  }

  Widget _buildDownloadItem(String title, String status, String type, IconData icon, Color color, double progress) {
    final isComplete = status == 'مكتمل';
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 4),
      leading: Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)), child: Icon(icon, color: color, size: 22)),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
      subtitle: isComplete
          ? Row(children: [
              Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)), child: const Text('مكتمل', style: TextStyle(fontSize: 10, color: AppColors.success))),
              const SizedBox(width: 6),
              Text(type, style: const TextStyle(fontSize: 11, color: AppColors.textTertiary)),
            ])
          : Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: progress, minHeight: 4, backgroundColor: AppColors.surfaceVariant, valueColor: AlwaysStoppedAnimation(color))),
              const SizedBox(height: 4),
              Text('$status - $type', style: const TextStyle(fontSize: 11, color: AppColors.textTertiary)),
            ]),
      trailing: Icon(isComplete ? Icons.check_circle : Icons.more_horiz, color: isComplete ? AppColors.success : AppColors.textTertiary, size: 20),
    );
  }
}
