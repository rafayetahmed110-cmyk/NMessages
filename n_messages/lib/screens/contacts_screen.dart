import 'package:flutter/material.dart';
import '../models/contact_model.dart';
import '../services/sms_native_service.dart';
import '../l10n/app_localizations.dart';
import 'conversation_screen.dart';

class ContactsScreen extends StatefulWidget {
  final String lang;
  const ContactsScreen({super.key, required this.lang});

  @override
  State<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends State<ContactsScreen> {
  final SmsNativeService _smsService = SmsNativeService();
  final TextEditingController _searchController = TextEditingController();

  List<ContactModel> _contacts = [];
  List<ContactModel> _filteredContacts = [];
  bool _isLoading = true;

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
      _isLoading = false;
    });
  }

  void _filterContacts(String query) {
    setState(() {
      _filteredContacts = _contacts.where((c) {
        return c.name.toLowerCase().contains(query.toLowerCase()) ||
            c.phoneNumber.contains(query);
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  loc.translate('contacts'),
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _searchController,
                  onChanged: _filterContacts,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: loc.translate('search_placeholder'),
                    hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(Icons.search, color: Colors.indigoAccent),
                    filled: true,
                    fillColor: const Color(0xFF1E293B),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Colors.indigoAccent))
                : _filteredContacts.isEmpty
                    ? Center(
                        child: Text(
                          loc.translate('no_contacts'),
                          style: const TextStyle(color: Color(0xFF94A3B8)),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: _filteredContacts.length,
                        itemBuilder: (context, index) {
                          final c = _filteredContacts[index];
                          return Card(
                            color: const Color(0xFF1E293B),
                            margin: const EdgeInsets.only(bottom: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: const Color(0xFF334155),
                                child: Text(c.initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ),
                              title: Text(c.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              subtitle: Text(c.phoneNumber, style: const TextStyle(color: Color(0xFF94A3B8))),
                              trailing: IconButton(
                                icon: const Icon(Icons.message_rounded, color: Colors.indigoAccent),
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ConversationScreen(
                                        threadId: 0,
                                        contactName: c.name,
                                        address: c.phoneNumber,
                                        lang: widget.lang,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
