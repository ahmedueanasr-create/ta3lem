class WalletData {
  final int id;
  final double balance;
  final double? pendingBalance;
  final List<Transaction>? recentTransactions;

  WalletData({required this.id, required this.balance, this.pendingBalance, this.recentTransactions});

  factory WalletData.fromJson(Map<String, dynamic> json) => WalletData(
    id: json['id'] ?? 0,
    balance: (json['balance'] ?? 0).toDouble(),
    pendingBalance: (json['pending_balance'] as num?)?.toDouble(),
    recentTransactions: (json['recent_transactions'] as List?)?.map((t) => Transaction.fromJson(t)).toList(),
  );
}

class Transaction {
  final int id;
  final String type;
  final double amount;
  final double? balanceBefore;
  final double? balanceAfter;
  final String? description;
  final String? referenceType;
  final int? referenceId;
  final String status;
  final String createdAt;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    this.balanceBefore,
    this.balanceAfter,
    this.description,
    this.referenceType,
    this.referenceId,
    this.status = 'completed',
    required this.createdAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) => Transaction(
    id: json['id'] ?? 0,
    type: json['type'] ?? '',
    amount: (json['amount'] ?? 0).toDouble(),
    balanceBefore: (json['balance_before'] as num?)?.toDouble(),
    balanceAfter: (json['balance_after'] as num?)?.toDouble(),
    description: json['description'],
    referenceType: json['reference_type'],
    referenceId: json['reference_id'],
    status: json['status'] ?? 'completed',
    createdAt: json['created_at'] ?? '',
  );

  bool get isCredit => type == 'credit' || type == 'refund' || type == 'deposit';
  bool get isDebit => type == 'debit' || type == 'withdrawal' || type == 'payment';
}
