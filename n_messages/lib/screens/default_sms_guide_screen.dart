import 'package:flutter/material.dart';
import '../services/sms_native_service.dart';
import '../l10n/app_localizations.dart';

class DefaultSmsGuideScreen extends StatefulWidget {
  final String lang;
  const DefaultSmsGuideScreen({super.key, required this.lang});

  @override
  State<DefaultSmsGuideScreen> createState() => _DefaultSmsGuideScreenState();
}

class _DefaultSmsGuideScreenState extends State<DefaultSmsGuideScreen> {
  final SmsNativeService _smsService = SmsNativeService();
  bool _isDefaultSms = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    setState(() => _isLoading = true);
    final status = await _smsService.isDefaultSmsApp();
    if (mounted) {
      setState(() {
        _isDefaultSms = status;
        _isLoading = false;
      });
    }
  }

  Future<void> _requestRole() async {
    await _smsService.requestDefaultSmsRole();
    await Future.delayed(const Duration(seconds: 1));
    _checkStatus();
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Text(
          loc.translate('default_sms_guide_title'),
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.indigoAccent),
            onPressed: _checkStatus,
            tooltip: 'Refresh Status',
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Header Hero Icon
          Center(
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: _isDefaultSms ? const Color(0xFF064E3B) : const Color(0xFF312E81),
                shape: BoxShape.circle,
                border: Border.all(
                  color: _isDefaultSms ? const Color(0xFF10B981) : const Color(0xFF6366F1),
                  width: 2,
                ),
              ),
              child: Icon(
                _isDefaultSms ? Icons.verified_user : Icons.security,
                size: 56,
                color: _isDefaultSms ? const Color(0xFF34D399) : const Color(0xFFA5B4FC),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Title & Status text
          Text(
            loc.translate('default_sms_guide_title'),
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            loc.translate('default_sms_guide_subtitle'),
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.slate400, fontSize: 13),
          ),
          const SizedBox(height: 24),

          // Real-time Status Card
          Card(
            color: _isDefaultSms ? const Color(0xFF065F46) : const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: _isDefaultSms ? const Color(0xFF10B981) : const Color(0xFF334155),
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  _isLoading
                      ? const SizedBox(
                          width: 28,
                          height: 28,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.indigoAccent),
                        )
                      : Icon(
                          _isDefaultSms ? Icons.check_circle : Icons.warning_rounded,
                          color: _isDefaultSms ? const Color(0xFF34D399) : Colors.amberAccent,
                          size: 32,
                        ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isDefaultSms ? 'Default Role Active' : 'Default Role Required',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _isDefaultSms
                              ? loc.translate('already_default_status')
                              : loc.translate('default_sms_desc'),
                          style: TextStyle(
                            color: _isDefaultSms ? Colors.white70 : Colors.slate300,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Action Button
          if (!_isDefaultSms)
            ElevatedButton.icon(
              onPressed: _requestRole,
              icon: const Icon(Icons.touch_app, color: Colors.white),
              label: Text(
                loc.translate('grant_role_btn'),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 4,
              ),
            ),
          if (!_isDefaultSms) const SizedBox(height: 24),

          // Section 1: Why set as Default?
          _buildSectionHeader(loc.translate('why_default_title')),
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildBenefitRow(Icons.message, loc.translate('why_default_1')),
                  const Divider(color: Color(0xFF334155), height: 24),
                  _buildBenefitRow(Icons.notifications_active, loc.translate('why_default_2')),
                  const Divider(color: Color(0xFF334155), height: 24),
                  _buildBenefitRow(Icons.shield, loc.translate('why_default_3')),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Section 2: How to enable in Android
          _buildSectionHeader(loc.translate('step_by_step_title')),
          Card(
            color: const Color(0xFF1E293B),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStepRow(loc.translate('step_1')),
                  const SizedBox(height: 12),
                  _buildStepRow(loc.translate('step_2')),
                  const SizedBox(height: 12),
                  _buildStepRow(loc.translate('step_3')),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Section 3: AndroidManifest.xml Verification
          _buildSectionHeader('AndroidManifest.xml Intent Filters'),
          Card(
            color: const Color(0xFF0284C7).withOpacity(0.15),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
              side: BorderSide(color: const Color(0xFF0284C7).withOpacity(0.4)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.code, color: Colors.lightBlueAccent, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        loc.translate('manifest_notice'),
                        style: const TextStyle(color: Colors.lightBlueAccent, fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _buildFilterBadge('android.intent.action.SENDTO (sms / smsto / mms / mmsto)'),
                  _buildFilterBadge('android.provider.Telephony.SMS_RECEIVED & SMS_DELIVERED'),
                  _buildFilterBadge('android.provider.Telephony.WAP_PUSH_DELIVERED (MMS)'),
                  _buildFilterBadge('android.intent.action.RESPOND_VIA_MESSAGE (Headless)'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(color: Colors.slate400, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1),
      ),
    );
  }

  Widget _buildBenefitRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, color: Colors.indigoAccent, size: 22),
        const SizedBox(width: 14),
        Expanded(
          child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4)),
        ),
      ],
    );
  }

  Widget _buildStepRow(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.arrow_right_rounded, color: Colors.emeraldAccent, size: 20),
        const SizedBox(width: 8),
        Expanded(
          child: Text(text, style: const TextStyle(color: Colors.slate200, fontSize: 13, height: 1.4)),
        ),
      ],
    );
  }

  Widget _buildFilterBadge(String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Row(
        children: [
          const Icon(Icons.check, color: Colors.emeraldAccent, size: 14),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: const TextStyle(color: Colors.slate300, fontSize: 11, fontFamily: 'monospace')),
          ),
        ],
      ),
    );
  }
}
