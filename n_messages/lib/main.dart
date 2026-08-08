import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NMessagesApp());
}

class NMessagesApp extends StatefulWidget {
  const NMessagesApp({super.key});

  static _NMessagesAppState? of(BuildContext context) =>
      context.findAncestorStateOfType<_NMessagesAppState>();

  @override
  State<NMessagesApp> createState() => _NMessagesAppState();
}

class _NMessagesAppState extends State<NMessagesApp> {
  ThemeMode _themeMode = ThemeMode.dark;
  String _locale = 'en';

  void setThemeMode(ThemeMode mode) {
    setState(() {
      _themeMode = mode;
    });
  }

  void setLocale(String langCode) {
    setState(() {
      _locale = langCode;
    });
  }

  ThemeMode get themeMode => _themeMode;
  String get locale => _locale;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NMessages',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorSchemeSeed: const Color(0xFF6366F1),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        textTheme: GoogleFonts.interTextTheme(),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A), // Dark slate/navy
        colorSchemeSeed: const Color(0xFF6366F1),
        cardColor: const Color(0xFF1E293B),
        dialogBackgroundColor: const Color(0xFF1E293B),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: HomeScreen(lang: _locale),
    );
  }
}
