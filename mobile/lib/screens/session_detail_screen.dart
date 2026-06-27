import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/session_provider.dart';
import '../models/session.dart';
import '../theme/app_theme.dart';

class SessionDetailScreen extends StatefulWidget {
  final int sessionId;

  const SessionDetailScreen({super.key, required this.sessionId});

  @override
  State<SessionDetailScreen> createState() => _SessionDetailScreenState();
}

class _SessionDetailScreenState extends State<SessionDetailScreen> {
  Session? _session;
  bool _isLoading = true;
  bool _isEnrolled = false;
  bool _hasRated = false;
  List<dynamic> _recordings = [];
  String? _error;
  int _rating = 0;
  final _ratingCommentController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  @override
  void dispose() {
    _ratingCommentController.dispose();
    super.dispose();
  }

  Future<void> _loadDetail() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await ApiService.getSession(widget.sessionId);
      if (res['success'] == true && res['data'] != null) {
        final data = res['data'];
        setState(() {
          _session = Session.fromJson(data);
          _isEnrolled = data['is_enrolled'] ?? data['joined'] ?? false;
          _hasRated = data['has_rated'] ?? false;
        });

        if (_session!.isEnded) {
          _loadRecordings();
        }
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'خطأ: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadRecordings() async {
    try {
      final res = await ApiService.getSessionRecordings(widget.sessionId);
      if (res['success'] == true && res['data'] != null) {
        final data = res['data'];
        setState(() {
          _recordings = data['recordings'] as List? ?? data as List? ?? [];
        });
      }
    } catch (_) {}
  }

  Future<void> _joinSession() async {
    final provider = context.read<SessionProvider>();
    final result = await provider.joinSession(widget.sessionId);
    if (result != null && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => const _StudentLiveRoomPlaceholder(),
        ),
      );
    } else if (provider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error!), backgroundColor: AppColors.danger),
      );
    }
  }

  Future<void> _startSession() async {
    try {
      final res = await ApiService.startSession(widget.sessionId);
      if (res['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم بدء الحصة'), backgroundColor: AppColors.success),
        );
        _loadDetail();
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  Future<void> _endSession() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إنهاء الحصة'),
        content: const Text('هل أنت متأكد من إنهاء هذه الحصة؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('إلغاء')),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('تأكيد')),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      final res = await ApiService.endSession(widget.sessionId);
      if (res['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم إنهاء الحصة'), backgroundColor: AppColors.success),
        );
        _loadDetail();
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  Future<void> _submitRating() async {
    if (_rating == 0) return;
    try {
      final res = await ApiService.rateSession(
        widget.sessionId,
        _rating,
        comment: _ratingCommentController.text.trim().isNotEmpty ? _ratingCommentController.text.trim() : null,
      );
      if (res['success'] == true && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم إرسال التقييم'), backgroundColor: AppColors.success),
        );
        setState(() => _hasRated = true);
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppColors.danger),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: Text(_session?.title ?? 'تفاصيل الحصة')),
      body: RefreshIndicator(
        onRefresh: _loadDetail,
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
                        ElevatedButton(onPressed: _loadDetail, child: const Text('إعادة المحاولة')),
                      ],
                    ),
                  )
                : _session == null
                    ? const Center(child: Text('لم يتم العثور على الحصة'))
                    : SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildInfoCard(),
                            const SizedBox(height: 16),
                            _buildStatusActions(auth),
                            if (_session!.isEnded && _recordings.isNotEmpty) ...[
                              const SizedBox(height: 16),
                              _buildRecordingsSection(),
                            ],
                            if (_session!.isEnded && _isEnrolled && !_hasRated) ...[
                              const SizedBox(height: 16),
                              _buildRatingSection(),
                            ],
                          ],
                        ),
                      ),
      ),
    );
  }

  Widget _buildInfoCard() {
    final s = _session!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(s.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: s.isLive ? AppColors.success.withValues(alpha: 0.1) : AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(s.statusLabel, style: TextStyle(color: s.isLive ? AppColors.success : AppColors.primary, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            if (s.description != null && s.description!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(s.description!, style: AppTheme.body),
            ],
            const Divider(height: 24),
            _buildInfoRow(Icons.person, 'المعلم', s.teacherName ?? '-'),
            if (s.subjectName != null) ...[
              const SizedBox(height: 8),
              _buildInfoRow(Icons.book, 'المادة', s.subjectName!),
            ],
            const SizedBox(height: 8),
            _buildInfoRow(Icons.attach_money, 'السعر', s.price > 0 ? '$s.price ج.م' : 'مجاني'),
            if (s.scheduledAt != null) ...[
              const SizedBox(height: 8),
              _buildInfoRow(Icons.schedule, 'الموعد', s.scheduledAt!),
            ],
            if (s.isLive && s.startedAt != null) ...[
              const SizedBox(height: 8),
              _buildInfoRow(Icons.play_arrow, 'بدأت في', s.startedAt!),
            ],
            if (s.isEnded && s.endedAt != null) ...[
              const SizedBox(height: 8),
              _buildInfoRow(Icons.stop, 'انتهت في', s.endedAt!),
            ],
            if (s.durationMin > 0) ...[
              const SizedBox(height: 8),
              _buildInfoRow(Icons.timer, 'المدة', '${s.durationMin} دقيقة'),
            ],
            if (s.enrollmentCount != null) ...[
              const SizedBox(height: 8),
              _buildInfoRow(Icons.people, 'المسجلون', '${s.enrollmentCount}'),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(color: AppColors.textSecondary)),
        Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
      ],
    );
  }

  Widget _buildStatusActions(auth) {
    final s = _session!;
    final isTeacher = auth.user?.isTeacher == true;
    final isStudent = auth.user?.isStudent == true;
    final isOwner = s.teacherName != null && auth.user?.name != null && s.teacherName == auth.user!.name;

    if (s.isEnded || s.isCancelled) return const SizedBox.shrink();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (isStudent && (s.isScheduled || s.isLive))
              ElevatedButton.icon(
                onPressed: _joinSession,
                icon: const Icon(Icons.login),
                label: const Text('انضمام'),
              ),
            if (isTeacher || isOwner) ...[
              if (s.isScheduled)
                ElevatedButton.icon(
                  onPressed: _startSession,
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('بدء الحصة'),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.success),
                ),
              if (s.isLive)
                ElevatedButton.icon(
                  onPressed: _endSession,
                  icon: const Icon(Icons.stop),
                  label: const Text('إنهاء الحصة'),
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRecordingsSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('التسجيلات', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ..._recordings.map((r) => ListTile(
                  dense: true,
                  leading: const Icon(Icons.videocam, color: AppColors.primary),
                  title: Text(r['name'] ?? r['title'] ?? 'تسجيل'),
                  subtitle: Text(r['duration'] ?? r['created_at'] ?? ''),
                  trailing: const Icon(Icons.play_circle, color: AppColors.primary),
                  onTap: () {},
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('تقييم الحصة', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (i) {
                final star = i + 1;
                return IconButton(
                  icon: Icon(
                    star <= _rating ? Icons.star : Icons.star_border,
                    color: star <= _rating ? AppColors.warning : AppColors.textSecondary,
                    size: 36,
                  ),
                  onPressed: () => setState(() => _rating = star),
                );
              }),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _ratingCommentController,
              decoration: const InputDecoration(
                labelText: 'تعليق (اختياري)',
                hintText: 'اكتب ملاحظاتك عن الحصة',
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _rating == 0 ? null : _submitRating,
                child: const Text('إرسال التقييم'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StudentLiveRoomPlaceholder extends StatelessWidget {
  const _StudentLiveRoomPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('غرفة البث المباشر')),
      body: const Center(child: Text('غرفة البث المباشر - قيد التطوير')),
    );
  }
}
