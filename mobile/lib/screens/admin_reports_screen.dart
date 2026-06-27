import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_theme.dart';
import '../providers/admin_provider.dart';
import '../services/api_service.dart';

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  List<Map<String, dynamic>> _reports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getAdminReports();
      final data = res['data'];
      if (data is List) {
        _reports = data.cast<Map<String, dynamic>>();
      } else if (data is Map && data['rows'] != null) {
        _reports = (data['rows'] as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('التقارير')),
      body: RefreshIndicator(
        onRefresh: _loadReports,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _reports.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      const SizedBox(height: 120),
                      Center(child: Text('لا توجد تقارير', style: AppTheme.body)),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: _reports.length,
                    itemBuilder: (ctx, i) {
                      final r = _reports[i];
                      return _ReportCard(report: r);
                    },
                  ),
      ),
    );
  }
}

class _ReportCard extends StatefulWidget {
  final Map<String, dynamic> report;
  const _ReportCard({required this.report});

  @override
  State<_ReportCard> createState() => _ReportCardState();
}

class _ReportCardState extends State<_ReportCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final r = widget.report;
    final type = r['type'] ?? r['report_type'] ?? '';
    final severity = r['severity'] ?? 'low';
    final description = r['description'] ?? '';
    final reporter = r['reporter']?['name'] ?? r['reported_by'] ?? '';
    final date = r['created_at'] ?? r['date'] ?? '';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          ListTile(
            leading: _typeIcon(type),
            title: Row(
              children: [
                _typeBadge(type),
                const SizedBox(width: 8),
                _severityChip(severity),
              ],
            ),
            subtitle: Text(description, maxLines: _expanded ? null : 2, overflow: _expanded ? null : TextOverflow.ellipsis),
            trailing: Icon(_expanded ? Icons.expand_less : Icons.expand_more),
            onTap: () => setState(() => _expanded = !_expanded),
          ),
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Divider(),
                  _detailRow('المبلغ', reporter),
                  const SizedBox(height: 4),
                  _detailRow('التاريخ', date),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _typeIcon(String type) {
    IconData icon;
    Color color;
    switch (type) {
      case 'abuse':
        icon = Icons.flag;
        color = AppColors.danger;
      case 'technical':
        icon = Icons.bug_report;
        color = AppColors.warning;
      case 'payment':
        icon = Icons.payment;
        color = AppColors.primary;
      default:
        icon = Icons.report;
        color = AppColors.textSecondary;
    }
    return CircleAvatar(backgroundColor: color.withValues(alpha: 0.1), child: Icon(icon, color: color));
  }

  Widget _typeBadge(String type) {
    const labels = {
      'abuse': 'إساءة',
      'technical': 'مشكلة تقنية',
      'payment': 'دفع',
      'other': 'أخرى',
    };
    return Chip(
      label: Text(labels[type] ?? type, style: const TextStyle(fontSize: 12)),
      visualDensity: VisualDensity.compact,
      padding: EdgeInsets.zero,
      backgroundColor: AppColors.primary.withValues(alpha: 0.1),
    );
  }

  Widget _severityChip(String severity) {
    Color color;
    String label;
    switch (severity) {
      case 'high':
        color = AppColors.danger;
        label = 'عالية';
      case 'medium':
        color = AppColors.warning;
        label = 'متوسطة';
      default:
        color = AppColors.success;
        label = 'منخفضة';
    }
    return Chip(
      label: Text(label, style: TextStyle(color: color, fontSize: 12)),
      backgroundColor: color.withValues(alpha: 0.1),
      visualDensity: VisualDensity.compact,
      padding: EdgeInsets.zero,
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      children: [
        Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w600)),
        Expanded(child: Text(value, style: AppTheme.body)),
      ],
    );
  }
}
