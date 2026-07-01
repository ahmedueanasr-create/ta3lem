import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  List<Map<String, dynamic>> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getUsers();
      final data = res['data'];
      if (data is List) {
        _users = data.cast<Map<String, dynamic>>();
      } else if (data is Map && data['rows'] != null) {
        _users = (data['rows'] as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    setState(() => _isLoading = false);
  }

  Future<void> _toggleStatus(Map<String, dynamic> user) async {
    final id = user['id'];
    final currentStatus = user['status'];
    final newStatus = currentStatus == 'active' ? 'suspended' : 'active';
    try {
      await ApiService.updateUser(id, {'status': newStatus});
      await _loadUsers();
    } catch (_) {}
  }

  void _showUserOptions(Map<String, dynamic> user) {
    final status = user['status'] ?? 'active';
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primary,
                child: Text(
                  (user['name']?[0] ?? '?').toString(),
                  style: const TextStyle(color: Colors.white),
                ),
              ),
              const SizedBox(height: 8),
              Text(user['name'] ?? '', style: AppTheme.heading),
              const SizedBox(height: 4),
              Text(user['email'] ?? '', style: AppTheme.body),
              const SizedBox(height: 24),
              if (status == 'active')
                ListTile(
                  leading: const Icon(Icons.block, color: AppColors.danger),
                  title: const Text('تعليق الحساب'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _toggleStatus(user);
                  },
                )
              else
                ListTile(
                  leading: const Icon(Icons.check_circle, color: AppColors.success),
                  title: const Text('تفعيل الحساب'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _toggleStatus(user);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('إدارة المستخدمين')),
      body: RefreshIndicator(
        onRefresh: _loadUsers,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _users.isEmpty
                ? ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    children: [
                      const SizedBox(height: 120),
                      Center(child: Text('لا يوجد مستخدمون', style: AppTheme.body)),
                    ],
                  )
                : ListView.builder(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    itemCount: _users.length,
                    itemBuilder: (ctx, i) {
                      final u = _users[i];
                      final status = u['status'] ?? 'active';
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: AppColors.primary,
                            child: Text(
                              (u['name']?[0] ?? '?').toString(),
                              style: const TextStyle(color: Colors.white),
                            ),
                          ),
                          title: Text(u['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(u['email'] ?? ''),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Chip(
                                label: Text(_roleLabel(u['role'] ?? '')),
                                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                                visualDensity: VisualDensity.compact,
                              ),
                              const SizedBox(width: 4),
                              Icon(
                                status == 'active' ? Icons.check_circle : Icons.cancel,
                                color: status == 'active' ? AppColors.success : AppColors.danger,
                                size: 20,
                              ),
                            ],
                          ),
                          onTap: () => _showUserOptions(u),
                        ),
                      );
                    },
                  ),
      ),
    );
  }

  String _roleLabel(String role) {
    const labels = {
      'student': 'طالب',
      'teacher': 'معلم',
      'parent': 'ولي أمر',
      'super_admin': 'مدير',
      'platform_admin': 'مدير المنصة',
      'teachers_supervisor': 'مشرف معلمين',
      'student_supervisor': 'مشرف طلاب',
    };
    return labels[role] ?? role;
  }
}
