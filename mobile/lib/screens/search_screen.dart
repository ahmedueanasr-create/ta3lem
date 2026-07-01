import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchCtrl = TextEditingController();
  List<dynamic> _results = [];
  bool _isLoading = false;
  String? _selectedSubject;
  double? _maxPrice;
  bool _onlyFree = false;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _search(String query) async {
    if (query.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getSessions();
      if (res['success'] == true && res['data'] != null) {
        final list = res['data'] as List? ?? [];
        setState(() {
          _results = list.where((s) {
            final title = (s['title'] ?? '').toString().toLowerCase();
            final subject = (s['subject_name'] ?? '').toString().toLowerCase();
            final teacher = (s['teacher_name'] ?? '').toString().toLowerCase();
            final q = query.toLowerCase();
            final matchesQuery = title.contains(q) || subject.contains(q) || teacher.contains(q);
            final matchesSubject = _selectedSubject == null || subject.contains(_selectedSubject!.toLowerCase());
            final matchesPrice = _maxPrice == null || (s['price'] ?? 0) <= _maxPrice!;
            final matchesFree = !_onlyFree || (s['price'] ?? 0) == 0;
            return matchesQuery && matchesSubject && matchesPrice && matchesFree;
          }).toList();
        });
      }
    } catch (_) {}
    if (!mounted) return;
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('بحث')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'ابحث عن درس، مادة، مدرس...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); setState(() => _results = []); })
                    : null,
              ),
              onSubmitted: _search,
              onChanged: (v) {
                setState(() {});
                if (v.length > 2) _search(v);
              },
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(children: [
              _buildFilterChip('الكل', null, () => setState(() => _selectedSubject = null)),
              _buildFilterChip('رياضيات', 'رياضيات', () => setState(() => _selectedSubject = 'رياضيات')),
              _buildFilterChip('علوم', 'علوم', () => setState(() => _selectedSubject = 'علوم')),
              _buildFilterChip('لغات', 'لغات', () => setState(() => _selectedSubject = 'لغات')),
              _buildFilterChip('مجاني', null, () => setState(() => _onlyFree = !_onlyFree), active: _onlyFree),
            ]),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _results.isEmpty
                    ? Center(
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Icon(Icons.search_off, size: 64, color: AppColors.textTertiary),
                          const SizedBox(height: 16),
                          Text('ابحث عن ما تريد', style: AppTheme.body),
                        ]),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _results.length,
                        itemBuilder: (_, i) => _buildResultCard(_results[i]),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String? value, VoidCallback onTap, {bool active = false}) {
    final isActive = active || (_selectedSubject == value && value != null);
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: FilterChip(
        label: Text(label),
        selected: isActive,
        onSelected: (_) => onTap(),
        selectedColor: AppColors.primary.withValues(alpha: 0.15),
        checkmarkColor: AppColors.primary,
      ),
    );
  }

  Widget _buildResultCard(dynamic s) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Container(
          width: 48, height: 48,
          decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(Icons.play_circle_fill, color: AppColors.primary),
        ),
        title: Text(s['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text('${s['teacher_name'] ?? ''} • ${s['subject_name'] ?? ''}', style: AppTheme.caption),
        trailing: Text('${s['price'] ?? 0} ج.م', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
        onTap: () {},
      ),
    );
  }
}
