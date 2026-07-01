import 'package:flutter/material.dart';
import 'package:chewie/chewie.dart';
import 'package:video_player/video_player.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';

class LessonScreen extends StatefulWidget {
  final String title;
  final String? videoUrl;
  const LessonScreen({super.key, required this.title, this.videoUrl});

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> with SingleTickerProviderStateMixin {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  late TabController _tabCtrl;
  final _noteCtrl = TextEditingController();
  final List<String> _notes = [];
  bool _isPiP = false;

  final _attachments = [
    {'name': 'ملخص الدرس', 'url': 'https://example.com/lesson1.pdf', 'icon': Icons.picture_as_pdf, 'size': '2.4 MB'},
    {'name': 'تمارين الدرس', 'url': 'https://example.com/exercises.pdf', 'icon': Icons.assignment, 'size': '1.1 MB'},
  ];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
    _initVideo();
  }

  void _initVideo() {
    if (widget.videoUrl == null) return;
    _videoController = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl!));
    _videoController!.initialize().then((_) {
      if (!mounted) return;
      _chewieController = ChewieController(
        videoPlayerController: _videoController!,
        autoPlay: true,
        looping: false,
        aspectRatio: 16 / 9,
        allowFullScreen: true,
        allowPlaybackSpeedChanging: true,
        playbackSpeeds: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
        placeholder: Container(color: Colors.black, child: const Center(child: CircularProgressIndicator(color: Colors.white))),
      );
      setState(() {});
    });
  }

  @override
  void dispose() {
    _videoController?.dispose();
    _chewieController?.dispose();
    _tabCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  void _togglePiP() {
    setState(() => _isPiP = !_isPiP);
  }

  void _addNote() {
    final text = _noteCtrl.text.trim();
    if (text.isEmpty) return;
    setState(() => _notes.add(text));
    _noteCtrl.clear();
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.tryParse(url);
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
            icon: Icon(_isPiP ? Icons.picture_in_picture_alt : Icons.picture_in_picture),
            onPressed: _togglePiP,
            tooltip: 'صورة داخل صورة',
          ),
        ],
      ),
      body: Column(
        children: [
          if (widget.videoUrl != null && _chewieController != null)
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Chewie(controller: _chewieController!),
            )
          else if (widget.videoUrl != null && _videoController != null && !_videoController!.value.isInitialized)
            const AspectRatio(aspectRatio: 16 / 9, child: Center(child: CircularProgressIndicator()))
          else
            Container(
              height: 200,
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
              ),
              child: Center(
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Icon(Icons.play_circle_fill, size: 64, color: Colors.white),
                  const SizedBox(height: 8),
                  Text('لا يوجد فيديو متاح', style: TextStyle(color: Colors.white.withValues(alpha: 0.8))),
                ]),
              ),
            ),
          TabBar(
            controller: _tabCtrl,
            tabs: const [
              Tab(text: 'الملاحظات', icon: Icon(Icons.note, size: 18)),
              Tab(text: 'المرفقات', icon: Icon(Icons.attach_file, size: 18)),
              Tab(text: 'التحميل', icon: Icon(Icons.download, size: 18)),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabCtrl,
              children: [
                _buildNotesTab(),
                _buildAttachmentsTab(),
                _buildDownloadTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotesTab() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(children: [
            Expanded(
              child: TextField(
                controller: _noteCtrl,
                decoration: InputDecoration(
                  hintText: 'اكتب ملاحظة...',
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onSubmitted: (_) => _addNote(),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primary),
              child: IconButton(
                icon: const Icon(Icons.add, color: Colors.white, size: 20),
                onPressed: _addNote,
              ),
            ),
          ]),
        ),
        Expanded(
          child: _notes.isEmpty
              ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.note_add, size: 48, color: AppColors.textTertiary),
                  const SizedBox(height: 12),
                  Text('لا توجد ملاحظات بعد', style: AppTheme.body),
                ]))
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _notes.length,
                  itemBuilder: (_, i) => Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        radius: 14,
                        backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                        child: Text('${i + 1}', style: const TextStyle(fontSize: 12, color: AppColors.primary)),
                      ),
                      title: Text(_notes[i], style: const TextStyle(fontSize: 14)),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: AppColors.danger),
                        onPressed: () => setState(() => _notes.removeAt(i)),
                      ),
                    ),
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildAttachmentsTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _attachments.length,
      itemBuilder: (_, i) {
        final a = _attachments[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Container(
              width: 44, height: 44,
              decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(a['icon'] as IconData, color: AppColors.primary),
            ),
            title: Text(a['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text(a['size'] as String, style: AppTheme.caption),
            trailing: IconButton(
              icon: const Icon(Icons.open_in_new, color: AppColors.primary),
              onPressed: () => _openUrl(a['url'] as String),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDownloadTab() {
    return Center(
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.download_for_offline, size: 72, color: AppColors.primary.withValues(alpha: 0.5)),
        const SizedBox(height: 16),
        Text('حمّل الدرس لمشاهدته بدون إنترنت', style: AppTheme.subheading),
        const SizedBox(height: 8),
        Text('متاح قريباً', style: AppTheme.body),
        const SizedBox(height: 24),
        ElevatedButton.icon(
          onPressed: () {},
          icon: const Icon(Icons.download),
          label: const Text('تحميل الدرس'),
        ),
      ]),
    );
  }
}
