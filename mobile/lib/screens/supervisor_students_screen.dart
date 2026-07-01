import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class SupervisorStudentsScreen extends StatefulWidget {
  const SupervisorStudentsScreen({super.key});

  @override
  State<SupervisorStudentsScreen> createState() => _SupervisorStudentsScreenState();
}

class _SupervisorStudentsScreenState extends State<SupervisorStudentsScreen> {
  List<dynamic> _students = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStudents();
  }

  Future<void> _loadStudents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await ApiService.getUsers();
      if (res['success'] == true && res['data'] != null) {
        final data = res['data'];
        final rows = data['rows'] as List? ?? data as List? ?? [];
        setState(() {
          _students = rows.where((u) => (u['role'] == 'student' || u['role']?['name'] == 'student')).toList();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('متابعة الطلاب')),
      body: RefreshIndicator(
        onRefresh: _loadStudents,
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
                        ElevatedButton(onPressed: _loadStudents, child: const Text('إعادة المحاولة')),
                      ],
                    ),
                  )
                : _students.isEmpty
                    ? ListView(
                        children: [
                          const SizedBox(height: 80),
                          const Center(child: Icon(Icons.people, size: 64, color: AppColors.textSecondary)),
                          const SizedBox(height: 12),
                          Center(child: Text('لا يوجد طلاب', style: AppTheme.body)),
                        ],
                      )
                    : ListView.builder(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        itemCount: _students.length,
                        itemBuilder: (context, index) => _buildStudentCard(_students[index]),
                      ),
      ),
    );
  }

  Widget _buildStudentCard(dynamic s) {
    final user = s['user'] ?? s;
    final name = user['name'] ?? s['name'] ?? '';
    final grade = s['student']?['grade'] ?? s['grade'] ?? '-';
    final lastActivity = s['last_activity'] ?? s['lastActiveAt'] ?? '';
    final status = s['status'] ?? user['status'] ?? 'active';

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: AppColors.primary,
              child: Text(
                (name is String && name.isNotEmpty) ? name[0] : '?',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.school, size: 14, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text('الصف: $grade', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                    ],
                  ),
                  if (lastActivity.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 14, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Text('آخر نشاط: $lastActivity', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: status == 'active' ? AppColors.success.withValues(alpha: 0.1) : AppColors.textSecondary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                status == 'active' ? 'نشط' : 'غير نشط',
                style: TextStyle(fontSize: 12, color: status == 'active' ? AppColors.success : AppColors.textSecondary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
