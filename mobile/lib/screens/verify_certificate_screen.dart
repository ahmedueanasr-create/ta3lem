import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class VerifyCertificateScreen extends StatefulWidget {
  const VerifyCertificateScreen({super.key});

  @override
  State<VerifyCertificateScreen> createState() => _VerifyCertificateScreenState();
}

class _VerifyCertificateScreenState extends State<VerifyCertificateScreen> {
  final _codeController = TextEditingController();
  Map<String, dynamic>? _certificate;
  bool _isLoading = false;
  String? _error;

  void _verify() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) return;

    setState(() {
      _isLoading = true;
      _error = null;
      _certificate = null;
    });

    try {
      final res = await ApiService.verifyCertificate(code);
      if (res['success'] == true && res['data'] != null) {
        setState(() => _certificate = res['data']);
      } else {
        setState(() => _error = res['message'] ?? 'شهادة غير موجودة');
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'خطأ: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Color _gradeColor(String grade) {
    switch (grade) {
      case 'ممتاز':
        return AppColors.success;
      case 'جيد جدا':
        return AppColors.primary;
      case 'جيد':
        return AppColors.warning;
      default:
        return AppColors.secondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('توثيق الشهادات')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(
              controller: _codeController,
              decoration: InputDecoration(
                labelText: 'رمز التحقق',
                prefixIcon: const Icon(Icons.verified),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.search),
                  onPressed: _verify,
                ),
              ),
              onSubmitted: (_) => _verify(),
            ),
            const SizedBox(height: 24),
            if (_isLoading) const CircularProgressIndicator(),
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.danger.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: AppColors.danger),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.danger))),
                  ],
                ),
              ),
            if (_certificate != null) _buildCertificateCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildCertificateCard() {
    final cert = _certificate!;
    final grade = cert['grade'] ?? 'مقبول';
    final gradeColor = _gradeColor(grade);
    final verifyUrl = 'https://ta3lem.app/verify-certificate/${cert['verificationCode']}';

    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: const Icon(Icons.verified, size: 48, color: AppColors.success),
            ),
            const SizedBox(height: 12),
            const Text('شهادة إتمام', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 4),
            Text(cert['student_name'] ?? '', style: AppTheme.heading, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(cert['subject'] ?? cert['title'] ?? '', style: const TextStyle(fontSize: 16, color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildStat('الدرجة', '${cert['score']}%', gradeColor),
                _buildStat('التقدير', grade, gradeColor),
                _buildStat('التاريخ', cert['issue_date'] ?? '', AppColors.textSecondary),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            Text('رقم الشهادة: ${cert['certificate_number'] ?? ''}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            const SizedBox(height: 16),
            QrImageView(
              data: verifyUrl,
              version: QrVersions.auto,
              size: 120,
              backgroundColor: Colors.white,
            ),
            const SizedBox(height: 8),
            const Text('تم التحقق من صحة الشهادة', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 16)),
      ],
    );
  }
}
