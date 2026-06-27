import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ParentPaymentsScreen extends StatefulWidget {
  const ParentPaymentsScreen({super.key});

  @override
  State<ParentPaymentsScreen> createState() => _ParentPaymentsScreenState();
}

class _ParentPaymentsScreenState extends State<ParentPaymentsScreen> {
  List<dynamic> _payments = [];
  double _totalSpent = 0;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPayments();
  }

  Future<void> _loadPayments() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await ApiService.parentPayments();
      if (res['success'] == true && res['data'] != null) {
        final data = res['data'];
        final transactions = data['transactions'] as List? ?? data['payments'] as List? ?? [];
        setState(() {
          _payments = transactions;
          _totalSpent = (data['total_spent'] ?? data['total'] ?? 0).toDouble();
        });
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'خطأ: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  String _statusLabel(String? status) {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'pending':
        return 'قيد الانتظار';
      case 'failed':
        return 'فشل';
      case 'refunded':
        return 'مسترجع';
      default:
        return status ?? '-';
    }
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'completed':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'failed':
        return AppColors.danger;
      case 'refunded':
        return AppColors.secondary;
      default:
        return AppColors.textSecondary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المدفوعات')),
      body: RefreshIndicator(
        onRefresh: _loadPayments,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error, size: 48, color: AppColors.danger),
                        const SizedBox(height: 12),
                        Text(_error!, style: const TextStyle(color: AppColors.danger)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _loadPayments, child: const Text('إعادة المحاولة')),
                      ],
                    ),
                  )
                : _payments.isEmpty
                    ? ListView(
                        children: [
                          const SizedBox(height: 80),
                          const Center(child: Icon(Icons.receipt_long, size: 64, color: AppColors.textSecondary)),
                          const SizedBox(height: 12),
                          Center(child: Text('لا توجد مدفوعات', style: AppTheme.body)),
                        ],
                      )
                    : ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        children: [
                          _buildTotalCard(),
                          const SizedBox(height: 16),
                          Text('سجل المدفوعات', style: AppTheme.heading),
                          const SizedBox(height: 12),
                          ..._payments.map((p) => _buildPaymentItem(p)),
                        ],
                      ),
      ),
    );
  }

  Widget _buildTotalCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), shape: BoxShape.circle),
              child: const Icon(Icons.account_balance_wallet, color: AppColors.primary, size: 28),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('إجمالي المصروفات', style: TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Text('$_totalSpent ج.م', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentItem(dynamic p) {
    final amount = (p['amount'] ?? 0).toDouble();
    final desc = p['description'] ?? p['note'] ?? '';
    final date = p['created_at'] ?? p['date'] ?? '';
    final status = p['status'] ?? 'completed';

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: amount > 0 ? AppColors.danger.withValues(alpha: 0.1) : AppColors.success.withValues(alpha: 0.1),
          child: Icon(
            amount > 0 ? Icons.arrow_upward : Icons.arrow_downward,
            color: amount > 0 ? AppColors.danger : AppColors.success,
          ),
        ),
        title: Text(desc.isNotEmpty ? desc : 'دفعة', style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(date, style: const TextStyle(fontSize: 13)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('$amount ج.م', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 2),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _statusColor(status).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _statusLabel(status),
                style: TextStyle(fontSize: 11, color: _statusColor(status), fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
