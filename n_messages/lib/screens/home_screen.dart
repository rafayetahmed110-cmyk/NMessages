import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/conversation.dart';
import '../services/sms_native_service.dart';
import '../l10n/app_localizations.dart';
import 'conversation_screen.dart';
import 'new_message_screen.dart';
import 'contacts_screen.dart';
import 'settings_screen.dart';
import 'default_sms_guide_screen.dart';

class HomeScreen extends StatefulWidget {
  final String lang;
  const HomeScreen({super.key, required this.lang});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final SmsNativeService _smsService = SmsNativeService();
  int _currentBottomNav = 0; // 0 = Conversations, 1 = Contacts
  String _selectedCategory = 'All'; // All, Unread, Read, Pinned
  String _searchQuery = '';
  bool _isSearching = false;
  bool _isDefaultSms = false;
  bool _isLoading = true;

  List<Conversation> _conversations = [];

  @override
  void initState() {
    super.initState() ;
    _checkDefaultSmsAndLoad();
    _listenToIncomingSms();
  }

  Future<void> _checkDefaultSmsAndLoad() async {
    final defaultApp = await _smsService.isDefaultSmsApp();
    setState(() {
      _isDefaultSms = defaultApp;
    });
    await _loadConversations();
  }

  Future<void> _loadConversations() async {
    setState(() => _isLoading = true);
    final list = await _smsService.getConversations();
    setState(() {
      _conversations = list;
      _isLoading = false;
    });
  }

  void _listenToIncomingSms() {
    _smsService.incomingSmsStream.listen((event) {
      _loadConversations();
    });
  }

  List<Conversation> get _filteredConversations {
    return _conversations.where((conv) {
      // Search query match
      final matchesSearch = _searchQuery.isEmpty ||
          conv.contactName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          conv.address.contains(_searchQuery) ||
          conv.snippet.toLowerCase().contains(_searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category tab match
      if (_selectedCategory == 'Unread') return !conv.isRead;
      if (_selectedCategory == 'Read') return conv.isRead;
      if (_selectedCategory == 'Pinned') return conv.isPinned;

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);

    return Scaffold(
      body: SafeArea(
        child: _currentBottomNav == 1
            ? ContactsScreen(lang: widget.lang)
            : Column(
                children: [
                  // Header Bar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              loc.translate('app_title'),
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: Icon(_isSearching ? Icons.close : Icons.search, color: const Color(0xFFCBD5E1)),
                                  onPressed: () {
                                    setState(() {
                                      _isSearching = !_isSearching;
                                      if (!_isSearching) _searchQuery = '';
                                    });
                                  },
                                ),
                                PopupMenuButton<String>(
                                  icon: const Icon(Icons.more_vert, color: Colors.white70),
                                  color: const Color(0xFF1E293B),
                                  onSelected: (value) {
                                    if (value == 'settings') {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => SettingsScreen(lang: widget.lang),
                                        ),
                                      ).then((_) => _checkDefaultSmsAndLoad());
                                    } else if (value == 'mark_read') {
                                      for (var c in _conversations) {
                                        _smsService.markThreadAsRead(c.threadId);
                                      }
                                      _loadConversations();
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    PopupMenuItem(
                                      value: 'mark_read',
                                      child: Row(
                                        children: [
                                          const Icon(Icons.mark_email_read, size: 20, color: Colors.indigoAccent),
                                          const SizedBox(width: 12),
                                          Text(loc.translate('mark_all_read'), style: const TextStyle(color: Colors.white)),
                                        ],
                                      ),
                                    ),
                                    PopupMenuItem(
                                      value: 'settings',
                                      child: Row(
                                        children: [
                                          const Icon(Icons.settings, size: 20, color: Color(0xFF94A3B8)),
                                          const SizedBox(width: 12),
                                          Text(loc.translate('settings'), style: const TextStyle(color: Colors.white)),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),

                        if (_isSearching) ...[
                          const SizedBox(height: 12),
                          TextField(
                            autofocus: true,
                            onChanged: (val) => setState(() => _searchQuery = val),
                            style: const TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              hintText: loc.translate('search_placeholder'),
                              hintStyle: const TextStyle(color: Colors.white38),
                              prefixIcon: const Icon(Icons.search, color: Colors.indigoAccent),
                              filled: true,
                              fillColor: const Color(0xFF1E293B),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide.none,
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            ),
                          ),
                        ],

                        // Default SMS App Banner if not default
                        if (!_isDefaultSms) ...[
                          const SizedBox(height: 12),
                          GestureDetector(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => DefaultSmsGuideScreen(lang: widget.lang),
                                ),
                              ).then((_) => _checkDefaultSmsAndLoad());
                            },
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFF312E81),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFF4338CA)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.shield_outlined, color: Color(0xFFA5B4FC)),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          loc.translate('set_default_sms'),
                                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                                        ),
                                        Text(
                                          loc.translate('default_sms_desc'),
                                          style: const TextStyle(color: Color(0xFFC7D2FE), fontSize: 11),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => DefaultSmsGuideScreen(lang: widget.lang),
                                        ),
                                      ).then((_) => _checkDefaultSmsAndLoad());
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF6366F1),
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    child: const Text('Setup', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],

                        // Category Tabs (All, Unread, Read, Pinned)
                        const SizedBox(height: 16),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _buildCategoryChip('All', loc.translate('tab_all')),
                              const SizedBox(width: 8),
                              _buildCategoryChip('Unread', loc.translate('tab_unread')),
                              const SizedBox(width: 8),
                              _buildCategoryChip('Read', loc.translate('tab_read')),
                              const SizedBox(width: 8),
                              _buildCategoryChip('Pinned', loc.translate('tab_pinned')),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Conversations List
                  Expanded(
                    child: _isLoading
                        ? const Center(child: CircularProgressIndicator(color: Colors.indigoAccent))
                        : _filteredConversations.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.forum_outlined, size: 56, color: const Color(0xFF475569)),
                                    const SizedBox(height: 12),
                                    Text(
                                      loc.translate('no_messages'),
                                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 15),
                                    ),
                                  ],
                                ),
                              )
                            : RefreshIndicator(
                                onRefresh: _loadConversations,
                                child: ListView.builder(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  itemCount: _filteredConversations.length,
                                  itemBuilder: (context, index) {
                                    final item = _filteredConversations[index];
                                    return _buildConversationCard(item, loc);
                                  },
                                ),
                              ),
                  ),
                ],
              ),
      ),

      // Floating Action Button for New Chat
      floatingActionButton: _currentBottomNav == 0
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => NewMessageScreen(lang: widget.lang)),
                ).then((_) => _loadConversations());
              },
              backgroundColor: const Color(0xFF6366F1),
              icon: const Icon(Icons.edit, color: Colors.white),
              label: Text(
                loc.translate('new_message'),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            )
          : null,

      // Bottom Navigation Bar
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentBottomNav,
        onTap: (idx) => setState(() => _currentBottomNav = idx),
        backgroundColor: const Color(0xFF0F172A),
        selectedItemColor: const Color(0xFF818CF8),
        unselectedItemColor: const Color(0xFF64748B),
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.chat_bubble_rounded),
            label: loc.translate('conversations'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.contacts_rounded),
            label: loc.translate('contacts'),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String categoryKey, String label) {
    final isSelected = _selectedCategory == categoryKey;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) setState(() => _selectedCategory = categoryKey);
      },
      selectedColor: const Color(0xFF6366F1),
      backgroundColor: const Color(0xFF1E293B),
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    );
  }

  Widget _buildConversationCard(Conversation conv, AppLocalizations loc) {
    final initials = conv.contactName.isNotEmpty
        ? (conv.contactName.contains(' ')
            ? '${conv.contactName.split(' ')[0][0]}${conv.contactName.split(' ')[1][0]}'
            : conv.contactName[0])
        : '?';

    final timeFormatted = DateFormat('jm').format(conv.timestamp);

    return Dismissible(
      key: Key('conv_${conv.threadId}_${conv.address}'),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: Colors.redAccent.withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      confirmDismiss: (direction) async {
        return await showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: Text(loc.translate('delete_conversation')),
            content: Text(loc.translate('delete_confirm')),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: Text(loc.translate('cancel')),
              ),
              TextButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: Text(loc.translate('delete'), style: const TextStyle(color: Colors.redAccent)),
              ),
            ],
          ),
        );
      },
      onDismissed: (direction) {
        _smsService.deleteThread(conv.threadId);
        setState(() {
          _conversations.removeWhere((c) => c.threadId == conv.threadId);
        });
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: 10),
        color: const Color(0xFF1E293B),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: conv.unreadCount > 0 ? const Color(0xFF6366F1).withOpacity(0.5) : Colors.transparent,
            width: 1,
          ),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ConversationScreen(
                  threadId: conv.threadId,
                  contactName: conv.contactName,
                  address: conv.address,
                  lang: widget.lang,
                ),
              ),
            ).then((_) => _loadConversations());
          },
          leading: CircleAvatar(
            radius: 24,
            backgroundColor: const Color(0xFF334155),
            child: Text(
              initials.toUpperCase(),
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  conv.contactName,
                  style: TextStyle(
                    fontWeight: conv.unreadCount > 0 ? FontWeight.bold : FontWeight.w600,
                    color: Colors.white,
                    fontSize: 15,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Text(
                timeFormatted,
                style: TextStyle(
                  color: conv.unreadCount > 0 ? const Color(0xFF818CF8) : const Color(0xFF94A3B8),
                  fontSize: 11,
                ),
              ),
            ],
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    conv.snippet,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: conv.unreadCount > 0 ? Colors.white : const Color(0xFF94A3B8),
                      fontWeight: conv.unreadCount > 0 ? FontWeight.w500 : FontWeight.normal,
                      fontSize: 13,
                    ),
                  ),
                ),
                if (conv.unreadCount > 0) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF6366F1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${conv.unreadCount}',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
