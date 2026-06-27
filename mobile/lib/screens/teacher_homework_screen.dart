import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class TeacherHomeworkScreen extends StatelessWidget {
  const TeacherHomeworkScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الواجبات')),
      body: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.assignment, size: 64, color: AppColors.textSecondary),
            SizedBox(height: 12),
            Text('الواجبات - قريباً', style: TextStyle(color: AppColors.textSecondary, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
