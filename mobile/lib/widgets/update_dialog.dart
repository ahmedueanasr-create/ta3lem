import 'dart:io';
import 'package:flutter/material.dart';
import '../services/update_service.dart';

class UpdateCheckService {
  static Future<void> check(BuildContext context) async {
    final currentCode = await UpdateService.getCurrentVersionCode();
    final latest = await UpdateService.checkForUpdate();

    if (latest == null || !latest.isNewerThan(currentCode)) return;
    if (!context.mounted) return;

    await showModalBottomSheet(
      context: context,
      isDismissible: !latest.isForceUpdate,
      enableDrag: !latest.isForceUpdate,
      builder: (_) => _UpdateSheet(
        force: latest.isForceUpdate,
        versionName: latest.versionName,
      ),
    );
  }
}

class _UpdateSheet extends StatefulWidget {
  final bool force;
  final String versionName;
  const _UpdateSheet({required this.force, required this.versionName});

  @override
  State<_UpdateSheet> createState() => _UpdateSheetState();
}

class _UpdateSheetState extends State<_UpdateSheet> {
  bool _downloading = false;
  double _progress = 0;
  String _message = '';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.system_update, size: 48, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 16),
            Text('تحديث جديد v${widget.versionName}', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(_message.isNotEmpty ? _message : 'يوجد إصدار أحدث من التطبيق، يرجى التحديث'),
            const SizedBox(height: 24),
            if (_downloading)
              Column(
                children: [
                  LinearProgressIndicator(value: _progress > 0 ? _progress : null),
                  const SizedBox(height: 8),
                  Text('${(_progress * 100).toStringAsFixed(0)}%'),
                ],
              )
            else
              Row(
                children: [
                  if (!widget.force)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('لاحقاً'),
                      ),
                    ),
                  if (!widget.force) const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton.icon(
                      icon: const Icon(Icons.download),
                      label: const Text('تحديث الآن'),
                      onPressed: _startDownload,
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _startDownload() async {
    setState(() {
      _downloading = true;
      _message = 'جاري التحميل...';
    });

    final file = await UpdateService.downloadApk(onProgress: (p) {
      if (mounted) setState(() => _progress = p);
    });

    if (!mounted) return;

    if (file == null) {
      setState(() {
        _downloading = false;
        _message = 'فشل التحميل، حاول مرة أخرى';
      });
      return;
    }

    setState(() => _message = 'جاري التثبيت...');
    await Future.delayed(const Duration(milliseconds: 500));

    if (Platform.isAndroid) {
      await UpdateService.installApk(file);
    }

    if (mounted) Navigator.of(context).pop();
  }
}
