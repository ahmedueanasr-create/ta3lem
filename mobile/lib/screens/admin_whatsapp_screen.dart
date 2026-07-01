import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import 'package:qr_flutter/qr_flutter.dart';

class AdminWhatsAppScreen extends StatefulWidget {
  const AdminWhatsAppScreen({super.key});

  @override
  State<AdminWhatsAppScreen> createState() => _AdminWhatsAppScreenState();
}

class _AdminWhatsAppScreenState extends State<AdminWhatsAppScreen> {
  Map<String, dynamic>? _status;
  bool _isLoading = true;
  final _phoneController = TextEditingController();
  final _messageController = TextEditingController();
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _loadStatus();
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadStatus() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getWhatsAppStatus();
      if (res['success'] == true) {
        _status = res['data'] as Map<String, dynamic>?;
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  Future<void> _sendMessage() async {
    final phone = _phoneController.text.trim();
    final message = _messageController.text.trim();
    if (phone.isEmpty || message.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال رقم الهاتف والرسالة')),
      );
      return;
    }
    setState(() => _isSending = true);
    try {
      await ApiService.sendWhatsAppMessage({'phone': phone, 'message': message});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم إرسال الرسالة بنجاح')),
        );
        _phoneController.clear();
        _messageController.clear();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('فشل الإرسال: $e')),
        );
      }
    }
    setState(() => _isSending = false);
  }

  @override
  Widget build(BuildContext context) {
    final isConnected = _status?['connected'] == true;
    final qrCode = _status?['qr_code'] ?? _status?['qr'];

    return Scaffold(
      appBar: AppBar(title: const Text('واتساب')),
      body: RefreshIndicator(
        onRefresh: _loadStatus,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildStatusCard(isConnected),
                    const SizedBox(height: 24),
                    if (!isConnected && qrCode != null) ...[
                      Text('امسح رمز QR لتوصيل واتساب', style: AppTheme.heading),
                      const SizedBox(height: 16),
                      Center(
                        child: QrImageView(
                          data: qrCode.toString(),
                          version: QrVersions.auto,
                          size: 220,
                          backgroundColor: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                    if (isConnected) ...[
                      Text('إرسال رسالة اختبارية', style: AppTheme.heading),
                      const SizedBox(height: 16),
                      TextField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'رقم الهاتف',
                          hintText: 'مثال: 201234567890',
                          prefixIcon: Icon(Icons.phone),
                        ),
                        keyboardType: TextInputType.phone,
                        textDirection: TextDirection.ltr,
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _messageController,
                        decoration: const InputDecoration(
                          labelText: 'الرسالة',
                          prefixIcon: Icon(Icons.message),
                        ),
                        maxLines: 4,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSending ? null : _sendMessage,
                          child: _isSending
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('إرسال'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildStatusCard(bool connected) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Icon(
              connected ? Icons.check_circle : Icons.error_outline,
              size: 48,
              color: connected ? AppColors.success : AppColors.danger,
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  connected ? 'متصل' : 'غير متصل',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  connected ? 'واتساب متصل وجاهز للإرسال' : 'واتساب غير متصل، يرجى مسح رمز QR',
                  style: AppTheme.body,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
