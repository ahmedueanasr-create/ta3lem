import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});

  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _selectedDate = DateTime.now();
  List<dynamic> _events = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    try {
      final res = await ApiService.getSessions();
      if (res['success'] == true && res['data'] != null) {
        setState(() {
          _events = res['data'] as List;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  List<dynamic> get _dayEvents {
    return _events.where((e) {
      final date = e['scheduled_at'] ?? e['started_at'] ?? '';
      if (date.isEmpty) return false;
      try {
        final dt = DateTime.parse(date);
        return dt.year == _selectedDate.year && dt.month == _selectedDate.month && dt.day == _selectedDate.day;
      } catch (_) {
        return false;
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('التقويم')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              Text(
                '${_selectedDate.year}/${_selectedDate.month}/${_selectedDate.day}',
                style: AppTheme.subheading,
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 80,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: 7,
                  itemBuilder: (_, i) {
                    final day = DateTime.now().add(Duration(days: i - 3));
                    final isSelected = day.day == _selectedDate.day;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedDate = day),
                      child: Container(
                        width: 52,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(_dayName(day.weekday), style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : AppColors.textSecondary)),
                            const SizedBox(height: 4),
                            Text('${day.day}', style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppColors.textPrimary)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ]),
          ),
          const Divider(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _dayEvents.isEmpty
                    ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(Icons.event_busy, size: 48, color: AppColors.textTertiary),
                        const SizedBox(height: 12),
                        Text('لا توجد أحداث في هذا اليوم', style: AppTheme.body),
                      ]))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _dayEvents.length,
                        itemBuilder: (_, i) => _buildEvent(_dayEvents[i]),
                      ),
          ),
        ],
      ),
    );
  }

  String _dayName(int wd) {
    const names = ['', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
    return names[wd];
  }

  Widget _buildEvent(dynamic e) {
    final isLive = e['status'] == 'live';
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Container(
          width: 4, height: 40,
          decoration: BoxDecoration(
            color: isLive ? AppColors.success : AppColors.primary,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        title: Text(e['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(e['teacher_name'] ?? '', style: AppTheme.caption),
        trailing: isLive ? Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
          child: const Text('مباشر', style: TextStyle(color: AppColors.success, fontSize: 12, fontWeight: FontWeight.w600)),
        ) : null,
      ),
    );
  }
}
