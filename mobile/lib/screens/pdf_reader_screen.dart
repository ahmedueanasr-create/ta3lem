import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';

class PdfReaderScreen extends StatefulWidget {
  final String title;
  final String url;
  const PdfReaderScreen({super.key, required this.title, required this.url});

  @override
  State<PdfReaderScreen> createState() => _PdfReaderScreenState();
}

class _PdfReaderScreenState extends State<PdfReaderScreen> with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _bookmarks = <String>[];
  final _notes = <Map<String, String>>[];
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';
  bool _highlightMode = false;
  int _currentPage = 1;
  final _totalPages = 10;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _toggleBookmark() {
    final key = 'صفحة $_currentPage';
    setState(() {
      if (_bookmarks.contains(key)) {
        _bookmarks.remove(key);
      } else {
        _bookmarks.add(key);
      }
    });
  }

  Future<void> _openExternally() async {
    final uri = Uri.tryParse(widget.url);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(fontSize: 16)),
        actions: [
          IconButton(
            icon: Icon(_bookmarks.contains('صفحة $_currentPage') ? Icons.bookmark : Icons.bookmark_border, color: _bookmarks.contains('صفحة $_currentPage') ? AppColors.warning : null),
            onPressed: _toggleBookmark,
            tooltip: 'إضافة علامة مرجعية',
          ),
          IconButton(
            icon: Icon(Icons.highlight, color: _highlightMode ? AppColors.warning : null),
            onPressed: () => setState(() => _highlightMode = !_highlightMode),
            tooltip: 'وضع التحديد',
          ),
          IconButton(
            icon: const Icon(Icons.open_in_new),
            onPressed: _openExternally,
            tooltip: 'فتح خارجي',
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            height: 48,
            color: Theme.of(context).cardColor,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_right, size: 20),
                  onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                ),
                Text('صفحة $_currentPage من $_totalPages', style: const TextStyle(fontWeight: FontWeight.w600)),
                IconButton(
                  icon: const Icon(Icons.chevron_left, size: 20),
                  onPressed: _currentPage < _totalPages ? () => setState(() => _currentPage++) : null,
                ),
              ],
            ),
          ),
          Expanded(
            child: Container(
              color: Theme.of(context).brightness == Brightness.dark ? const Color(0xFF1A1A2E) : const Color(0xFFF5F0E8),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.picture_as_pdf, size: 80, color: AppColors.danger.withValues(alpha: 0.5)),
                    const SizedBox(height: 16),
                    Text('معاينة الصفحة $_currentPage', style: AppTheme.subheading),
                    const SizedBox(height: 8),
                    Text(
                      'هذا معاينة للـ PDF\nلفتح الملف الكامل استخدم زر الفتح الخارجي',
                      textAlign: TextAlign.center,
                      style: AppTheme.body,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: _openExternally,
                      icon: const Icon(Icons.open_in_new),
                      label: const Text('فتح الملف'),
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14)),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
            ),
            child: TabBar(
              controller: _tabCtrl,
              tabs: const [
                Tab(text: 'إشارات مرجعية', icon: Icon(Icons.bookmark, size: 16)),
                Tab(text: 'ملاحظات', icon: Icon(Icons.note, size: 16)),
                Tab(text: 'بحث', icon: Icon(Icons.search, size: 16)),
              ],
            ),
          ),
          SizedBox(
            height: 200,
            child: TabBarView(
              controller: _tabCtrl,
              children: [
                _buildBookmarksTab(),
                _buildNotesTab(),
                _buildSearchTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookmarksTab() {
    return _bookmarks.isEmpty
        ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.bookmark_border, size: 36, color: AppColors.textTertiary),
            const SizedBox(height: 8),
            Text('لا توجد إشارات مرجعية', style: AppTheme.body),
          ]))
        : ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: _bookmarks.length,
            itemBuilder: (_, i) => ListTile(
              dense: true,
              leading: const Icon(Icons.bookmark, size: 18, color: AppColors.warning),
              title: Text(_bookmarks[i]),
              trailing: IconButton(
                icon: const Icon(Icons.close, size: 16),
                onPressed: () => setState(() => _bookmarks.removeAt(i)),
              ),
            ),
          );
  }

  Widget _buildNotesTab() {
    return _notes.isEmpty
        ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Icon(Icons.note_add, size: 36, color: AppColors.textTertiary),
            const SizedBox(height: 8),
            Text('لا توجد ملاحظات', style: AppTheme.body),
          ]))
        : ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: _notes.length,
            itemBuilder: (_, i) => ListTile(
              dense: true,
              leading: CircleAvatar(radius: 12, backgroundColor: AppColors.primary.withValues(alpha: 0.1), child: Text('${i + 1}', style: const TextStyle(fontSize: 10, color: AppColors.primary))),
              title: Text(_notes[i]['text'] ?? '', style: const TextStyle(fontSize: 13)),
              subtitle: Text(_notes[i]['page'] ?? '', style: AppTheme.caption),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline, size: 16, color: AppColors.danger),
                onPressed: () => setState(() => _notes.removeAt(i)),
              ),
            ),
          );
  }

  Widget _buildSearchTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8),
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: 'ابحث داخل PDF...',
              isDense: true,
              prefixIcon: const Icon(Icons.search, size: 20),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 18),
                      onPressed: () { _searchCtrl.clear(); setState(() => _searchQuery = ''); },
                    )
                  : null,
              contentPadding: const EdgeInsets.symmetric(vertical: 10),
            ),
            onChanged: (v) => setState(() => _searchQuery = v.trim()),
          ),
        ),
        Expanded(
          child: _searchQuery.isEmpty
              ? Center(child: Text('اكتب للبحث داخل الملف', style: AppTheme.body))
              : Center(child: Text('نتائج البحث ستظهر هنا', style: AppTheme.body)),
        ),
      ],
    );
  }
}
