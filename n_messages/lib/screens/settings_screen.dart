import 'package:flutter/material.dart';
import '../services/sms_native_service.dart';
import '../l10n/app_localizations.dart';
import '../main.dart';
import 'blocked_numbers_screen.dart';
import 'default_sms_guide_screen.dart';

class SettingsScreen extends StatefulWidget {
  final String lang;
  const SettingsScreen({super.key, required this.lang});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final SmsNativeService _smsService = SmsNativeService();
  bool _isDefaultSms = false;
  bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    final status = await _smsService.isDefaultSmsApp();
    setState(() => _isDefaultSms = status);
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);
    final appState = NMessagesApp.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Text(loc.translate('settings'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Default SMS status card
          Card(
            color: _isDefaultSms ? const Color(0xFF064E3B) : const Color(0xFF312E81),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: ListTile(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => DefaultSmsGuideScreen(lang: widget.lang)),
                ).then((_) => _checkStatus());
              },
              contentPadding: const EdgeInsets.all(16),
              leading: Icon(
                _isDefaultSms ? Icons.check_circle : Icons.warning_amber_rounded,
                color: _isDefaultSms ? const Color(0xFF34D399) : const Color(0xFFA5B4FC),
                size: 32,
              ),
              title: Text(
                _isDefaultSms ? 'Default SMS App' : loc.translate('set_default_sms'),
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
              ),
              subtitle: Text(
                _isDefaultSms
                    ? 'NMessages is active as your primary default SMS application.'
                    : loc.translate('default_sms_desc'),
                style: const TextStyle(color: Colors.white70, fontSize: 12),
              ),
              trailing: const Icon(Icons.chevron_right, color: Colors.white70),
            ),
          ),
          const SizedBox(height: 16),

          // Settings Options
          _buildHeader('General Settings'),

          // Language Selector
          ListTile(
            tileColor: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            leading: const Icon(Icons.language, color: Colors.indigoAccent),
            title: Text(loc.translate('language'), style: const TextStyle(color: Colors.white)),
            trailing: DropdownButton<String>(
              value: appState?.locale ?? widget.lang,
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(color: Colors.indigoAccent, fontWeight: FontWeight.bold),
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(value: 'en', child: Text('English')),
                DropdownMenuItem(value: 'bn', child: Text('বাংলা (Bangla)')),
              ],
              onChanged: (newLang) {
                if (newLang != null && appState != null) {
                  appState.setLocale(newLang);
                }
              },
            ),
          ),
          const SizedBox(height: 8),

          // Notifications Toggle
          SwitchListTile(
            tileColor: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            secondary: const Icon(Icons.notifications_active, color: Colors.indigoAccent),
            title: Text(loc.translate('notifications'), style: const TextStyle(color: Colors.white)),
            value: _notificationsEnabled,
            activeColor: const Color(0xFF6366F1),
            onChanged: (val) => setState(() => _notificationsEnabled = val),
          ),
          const SizedBox(height: 8),

          // Blocked Numbers
          ListTile(
            tileColor: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            leading: const Icon(Icons.block, color: Colors.redAccent),
            title: Text(loc.translate('blocked_numbers'), style: const TextStyle(color: Colors.white)),
            trailing: const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => BlockedNumbersScreen(lang: widget.lang)),
              );
            },
          ),
          const SizedBox(height: 16),

          // About Section
          _buildHeader('About'),
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: const Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('NMessages v1.0.0', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 16)),
                  SizedBox(height: 4),
                  Text('Modern Default Android SMS & Messaging Client built with Flutter, Material 3, and Kotlin Platform Channels.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
      ),
    );
  }
}
