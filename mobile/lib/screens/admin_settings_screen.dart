import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/admin_provider.dart';
import '../services/api_service.dart';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  Map<String, dynamic> _settings = {};
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getSettings();
      if (res['success'] == true && res['data'] != null) {
        _settings = Map<String, dynamic>.from(res['data'] as Map);
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    try {
      await ApiService.updateSettings(_settings);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم حفظ الإعدادات')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('خطأ في الحفظ: $e')),
        );
      }
    }
    setState(() => _isSaving = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _settings.isEmpty
              ? Center(child: Text('لا توجد إعدادات', style: AppTheme.body))
              : RefreshIndicator(
                  onRefresh: _loadSettings,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      ..._settings.entries.map((e) => _buildSettingTile(e.key, e.value)),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSaving ? null : _save,
                          child: _isSaving
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('حفظ الإعدادات'),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSettingTile(String key, dynamic value) {
    final label = _settingLabel(key);
    if (value is bool) {
      return Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: SwitchListTile(
          title: Text(label),
          subtitle: Text(_settingHint(key), style: AppTheme.body),
          value: value,
          onChanged: (v) => setState(() => _settings[key] = v),
          activeThumbColor: AppColors.primary,
        ),
      );
    }
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: TextField(
          decoration: InputDecoration(
            labelText: label,
            hintText: _settingHint(key),
          ),
          controller: TextEditingController(text: value?.toString() ?? ''),
          onChanged: (v) => _settings[key] = v,
        ),
      ),
    );
  }

  String _settingLabel(String key) {
    const labels = {
      'site_name': 'اسم الموقع',
      'site_description': 'وصف الموقع',
      'maintenance_mode': 'وضع الصيانة',
      'registration_open': 'التسجيل مفتوح',
      'default_locale': 'اللغة الافتراضية',
      'max_students_per_session': 'الحد الأقصى للطلاب لكل حصة',
      'session_duration': 'مدة الحصة (دقائق)',
      'teacher_commission': 'عمولة المعلم (%)',
      'min_withdrawal': 'الحد الأدنى للسحب',
      'whatsapp_notifications': 'إشعارات واتساب',
      'email_notifications': 'إشعارات البريد الإلكتروني',
      'smtp_host': 'خادم SMTP',
      'smtp_port': 'منفذ SMTP',
      'smtp_user': 'مستخدم SMTP',
      'smtp_password': 'كلمة مرور SMTP',
    };
    return labels[key] ?? key;
  }

  String _settingHint(String key) {
    const hints = {
      'site_name': 'اسم المنصة التعليمية',
      'maintenance_mode': 'تفعيل وضع الصيانة للموقع',
      'registration_open': 'السماح بتسجيل حسابات جديدة',
    };
    return hints[key] ?? '';
  }
}
