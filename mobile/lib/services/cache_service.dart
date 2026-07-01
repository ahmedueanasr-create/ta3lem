import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';

class CacheService {
  static const _boxName = 'app_cache';
  static late Box _box;

  static Future<void> init() async {
    await Hive.initFlutter();
    _box = await Hive.openBox(_boxName);
  }

  static String? getString(String key) => _box.get(key) as String?;
  static Future<void> setString(String key, String value) => _box.put(key, value);

  static Map<String, dynamic>? getJson(String key) {
    final raw = _box.get(key) as String?;
    return raw != null ? jsonDecode(raw) as Map<String, dynamic>? : null;
  }

  static Future<void> setJson(String key, Map<String, dynamic> value) => _box.put(key, jsonEncode(value));

  static List<dynamic>? getList(String key) {
    final raw = _box.get(key) as String?;
    return raw != null ? jsonDecode(raw) as List<dynamic>? : null;
  }

  static Future<void> setList(String key, List<dynamic> value) => _box.put(key, jsonEncode(value));

  static Future<void> remove(String key) => _box.delete(key);

  static Future<void> clear() => _box.clear();

  static int get totalSize => _box.length;
}
