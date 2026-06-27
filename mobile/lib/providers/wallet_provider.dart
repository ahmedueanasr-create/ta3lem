import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../models/wallet_transaction.dart';

class WalletProvider extends ChangeNotifier {
  WalletData? _wallet;
  List<Transaction> _transactions = [];
  bool _isLoading = false;

  WalletData? get wallet => _wallet;
  List<Transaction> get transactions => _transactions;
  bool get isLoading => _isLoading;

  Future<void> loadWallet() async {
    _isLoading = true;
    notifyListeners();
    try {
      final res = await ApiService.getWallet();
      if (res['success'] == true && res['data'] != null) {
        _wallet = WalletData.fromJson(res['data']);
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<void> loadTransactions() async {
    try {
      final res = await ApiService.getWalletTransactions();
      if (res['success'] == true && res['data'] != null) {
        final data = res['data'];
        if (data is List) {
          _transactions = data.map((t) => Transaction.fromJson(t)).toList();
        }
      }
    } catch (_) {}
    notifyListeners();
  }
}
