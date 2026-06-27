import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StudentRecordingsScreen extends StatelessWidget {
  const StudentRecordingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('التسجيلات')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.video_library, size: 72, color: AppColors.textSecondary),
            SizedBox(height: 16),
            Text(
              'التسجيلات متاحة قريباً',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            SizedBox(height: 8),
            Text(
              'سيتم إضافة التسجيلات قريباً',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
