import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class SubjectDetailScreen extends StatefulWidget {
  final int subjectId;
  final String title;
  const SubjectDetailScreen({super.key, required this.subjectId, required this.title});

  @override
  State<SubjectDetailScreen> createState() => _SubjectDetailScreenState();
}

class _SubjectDetailScreenState extends State<SubjectDetailScreen> {
  Map<String, dynamic>? _data;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ApiService.getSubjects();
      if (res['success'] == true && res['data'] != null) {
        final list = res['data'] as List;
        final found = list.firstWhere((s) => s['id'] == widget.subjectId, orElse: () => null);
        if (found != null) setState(() => _data = found);
      }
    } catch (_) {}
    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _data == null
              ? const Center(child: Text('لا توجد بيانات'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 180,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Center(
                          child: Icon(Icons.book, size: 72, color: Colors.white.withValues(alpha: 0.8)),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(_data!['name'] ?? '', style: AppTheme.heading),
                      const SizedBox(height: 8),
                      Text(_data!['description'] ?? 'وصف المادة', style: AppTheme.body),
                      const SizedBox(height: 20),
                      Row(children: [
                        _buildStat(Icons.menu_book, '${_data!['session_count'] ?? 0} درس'),
                        const SizedBox(width: 16),
                        _buildStat(Icons.people, '${_data!['teacher_count'] ?? 0} مدرس'),
                      ]),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.subscriptions),
                          label: const Text('اشترك الآن'),
                          style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStat(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      ]),
    );
  }
}
