import 'package:flutter/material.dart';
import '../models/contact_model.dart';
import '../services/sms_native_service.dart';
import '../l10n/app_localizations.dart';
import 'conversation_screen.dart';

class NewMessageScreen extends StatefulWidget {
  final String lang;
  const NewMessageScreen({super.key, required this.lang});

  @override
  State<NewMessageScreen> createState() => _NewMessageScreenState();
}

class _NewMessageScreenState extends State<NewMessageScreen> {
  final SmsNativeService _smsService = SmsNativeService();
  final TextEditingController _recipientController = TextEditingController();
  final TextEditingController _messageController = TextEditingController();

  List<ContactModel> _contacts = [];
  List<ContactModel> _filteredContacts = [];
  bool _isLoadingContacts = true;

  @override
  void initState() {
    super.initState();
    _loadContacts();
  }

  Future<void> _loadContacts() async {
    final list = await _smsService.getDeviceContacts();
    setState(() {
      _contacts = list;
      _filteredContacts = list;
      _isLoadingContacts = false;
    });
  }

  void _onRecipientChanged(String query) {
    setState(() {
      _filteredContacts = _contacts.where((c) {
        return c.name.toLowerCase().contains(query.toLowerCase()) ||
            c.phoneNumber.contains(query);
      }).toList();
    });
  }

  void _startChatWith(String name, String phone) {
    if (phone.trim().isEmpty) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => ConversationScreen(
          threadId: 0,
          contactName: name.isNotEmpty ? name : phone,
          address: phone,
          lang: widget.lang,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Text(loc.translate('new_message'), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Recipient Input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(loc.translate('recipient'), style: const TextStyle(color: Colors.slate400, fontWeight: FontWeight.bold)),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _recipientController,
                    onChanged: _onRecipientChanged,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      hintText: 'Type a name or phone number...',
                      hintStyle: TextStyle(color: Colors.slate500),
                      border: InputBorder.none,
                    ),
                  ),
                ),
                if (_recipientController.text.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.arrow_forward_rounded, color: Colors.indigoAccent),
                    onPressed: () => _startChatWith('', _recipientController.text.trim()),
                  ),
              ],
            ),
          ),
          const Divider(color: Color(0xFF334155), height: 1),

          // Contacts List
          Expanded(
            child: _isLoadingContacts
                ? const Center(child: CircularProgressIndicator(color: Colors.indigoAccent))
                : ListView.builder(
                    itemCount: _filteredContacts.length,
                    itemBuilder: (context, index) {
                      final c = _filteredContacts[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFF334155),
                          child: Text(c.initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                        title: Text(c.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: Text(c.phoneNumber, style: const TextStyle(color: Colors.slate400)),
                        onTap: () => _startChatWith(c.name, c.phoneNumber),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
