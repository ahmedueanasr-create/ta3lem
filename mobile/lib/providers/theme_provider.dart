import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  ThemeMode get themeMode => _themeMode;
  bool get isDark => _themeMode == ThemeMode.dark;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('theme_mode');
    if (saved == 'dark') {
      _themeMode = ThemeMode.dark;
    } else if (saved == 'light') {
      _themeMode = ThemeMode.light;
    } else {
      _themeMode = ThemeMode.system;
    }
    notifyListeners();
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    String saved;
    if (mode == ThemeMode.dark) {
      saved = 'dark';
    } else if (mode == ThemeMode.light) {
      saved = 'light';
    } else {
      saved = 'system';
    }
    await prefs.setString('theme_mode', saved);
  }

  Future<void> toggleTheme() async {
    if (_themeMode == ThemeMode.dark) {
      await setThemeMode(ThemeMode.light);
    } else {
      await setThemeMode(ThemeMode.dark);
    }
  }

  ThemeData get currentTheme {
    final brightness = _themeMode == ThemeMode.system
        ? WidgetsBinding.instance.platformDispatcher.platformBrightness
        : _themeMode == ThemeMode.dark
            ? Brightness.dark
            : Brightness.light;
    return brightness == Brightness.dark ? AppTheme.dark : AppTheme.light;
  }
}
