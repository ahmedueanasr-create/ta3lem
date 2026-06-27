import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'api_service.dart';

class AppVersionInfo {
  final int versionCode;
  final String versionName;
  final int? fileSize;
  final String? releaseNotes;
  final bool isForceUpdate;
  final String? filePath;

  AppVersionInfo({
    required this.versionCode,
    required this.versionName,
    this.fileSize,
    this.releaseNotes,
    this.isForceUpdate = false,
    this.filePath,
  });

  factory AppVersionInfo.fromJson(Map<String, dynamic> json) {
    return AppVersionInfo(
      versionCode: json['versionCode'] ?? 0,
      versionName: json['versionName'] ?? '',
      fileSize: json['fileSize'],
      releaseNotes: json['releaseNotes'],
      isForceUpdate: json['isForceUpdate'] ?? false,
      filePath: json['filePath'],
    );
  }

  bool isNewerThan(int currentCode) => versionCode > currentCode;
}

class UpdateService {
  static AppVersionInfo? _latest;

  static Future<AppVersionInfo?> checkForUpdate() async {
    try {
      final uri = Uri.parse('${ApiService.baseUrl}/app/version');
      final res = await http.get(uri).timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) return null;
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      if (data == null) return null;
      _latest = AppVersionInfo.fromJson(data);
      return _latest;
    } catch (_) {
      return null;
    }
  }

  static Future<int> getCurrentVersionCode() async {
    try {
      final info = await PackageInfo.fromPlatform();
      return int.tryParse(info.buildNumber) ?? 1;
    } catch (_) {
      return 1;
    }
  }

  static Future<String?> getCurrentVersionName() async {
    try {
      final info = await PackageInfo.fromPlatform();
      return info.version;
    } catch (_) {
      return null;
    }
  }

  static String? getDownloadUrl() {
    if (_latest?.filePath == null) return null;
    final base = ApiService.baseUrl.replaceAll('/api/v1', '');
    return '$base/${_latest!.filePath!}';
  }

  static Future<File?> downloadApk({
    required void Function(double progress) onProgress,
  }) async {
    final url = getDownloadUrl();
    if (url == null) return null;

    try {
      final dir = await getTemporaryDirectory();
      final file = File('${dir.path}/ta3lem_update.apk');
      if (file.existsSync()) await file.delete();

      final response = await http.Client().send(http.Request('GET', Uri.parse(url)));
      if (response.statusCode != 200) return null;

      final total = response.contentLength ?? 0;
      var downloaded = 0;
      final sink = file.openWrite();

      await for (final chunk in response.stream) {
        downloaded += chunk.length;
        sink.add(chunk);
        if (total > 0) onProgress(downloaded / total);
      }
      await sink.close();

      if (total > 0 && downloaded < total) return null;
      return file;
    } catch (_) {
      return null;
    }
  }

  static Future<bool> installApk(File file) async {
    try {
      final result = await Process.run('cmd', ['/c', 'start', '', file.path]);
      return result.exitCode == 0;
    } catch (_) {
      return false;
    }
  }
}
