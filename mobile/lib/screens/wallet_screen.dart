import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/wallet_provider.dart';
import '../models/wallet_transaction.dart';
import '../theme/app_theme.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  @override
  void initState() {
    super.initState();
    final provider = context.read<WalletProvider>();
    provider.loadWallet();
    provider.loadTransactions();
  }

  Future<void> _refresh() async {
    final provider = context.read<WalletProvider>();
    await Future.wait([
      provider.loadWallet(),
      provider.loadTransactions(),
    ]);
  }

  String _transactionTypeLabel(Transaction t) {
    if (t.isCredit) return 'إيداع';
    if (t.isDebit) return 'سحب';
    return t.type;
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<WalletProvider>();
    final wallet = provider.wallet;
    return Scaffold(
      appBar: AppBar(title: const Text('المحفظة')),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: provider.isLoading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.all(Radius.circular(16)),
                      ),
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('الرصيد الحالي', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          const SizedBox(height: 8),
                          Text(
                            '${wallet?.balance.toStringAsFixed(0) ?? '0'} ج.م',
                            style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                          ),
                          if (wallet?.pendingBalance != null && wallet!.pendingBalance! > 0) ...[
                            const SizedBox(height: 8),
                            Text(
                              'رصيد معلق: ${wallet.pendingBalance!.toStringAsFixed(0)} ج.م',
                              style: const TextStyle(color: Colors.white60, fontSize: 14),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('آخر المعاملات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 12),
                  if (provider.transactions.isEmpty)
                    const Card(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Center(
                          child: Text('لا توجد معاملات', style: TextStyle(color: AppColors.textSecondary)),
                        ),
                      ),
                    )
                  else
                    ...provider.transactions.map((t) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: t.isCredit ? AppColors.success.withValues(alpha: 0.1) : AppColors.danger.withValues(alpha: 0.1),
                              child: Icon(
                                t.isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                                color: t.isCredit ? AppColors.success : AppColors.danger,
                              ),
                            ),
                            title: Text(t.description ?? _transactionTypeLabel(t)),
                            subtitle: Text(t.createdAt, style: const TextStyle(fontSize: 12)),
                            trailing: Text(
                              '${t.isCredit ? '+' : '-'}${t.amount.toStringAsFixed(0)} ج.م',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: t.isCredit ? AppColors.success : AppColors.danger,
                              ),
                            ),
                          ),
                        )),
                ],
              ),
      ),
    );
  }
}
