import 'package:shared_preferences/shared_preferences.dart';

class BlockedNumbersService {
  static const String _key = 'nmessages_blocked_numbers';

  static Future<List<String>> getBlockedNumbers() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_key) ?? [];
  }

  static Future<bool> isBlocked(String phoneNumber) async {
    final blocked = await getBlockedNumbers();
    final cleanTarget = phoneNumber.replaceAll(RegExp(r'\s+|-|\(|\)'), '');
    return blocked.any((b) => b.replaceAll(RegExp(r'\s+|-|\(|\)'), '') == cleanTarget);
  }

  static Future<void> addBlockedNumber(String phoneNumber) async {
    final prefs = await SharedPreferences.getInstance();
    final blocked = await getBlockedNumbers();
    if (!blocked.contains(phoneNumber)) {
      blocked.add(phoneNumber);
      await prefs.setStringList(_key, blocked);
    }
  }

  static Future<void> removeBlockedNumber(String phoneNumber) async {
    final prefs = await SharedPreferences.getInstance();
    final blocked = await getBlockedNumbers();
    blocked.removeWhere((item) => item == phoneNumber);
    await prefs.setStringList(_key, blocked);
  }
}
