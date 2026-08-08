import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/sms_message.dart';
import '../services/sms_native_service.dart';
import '../services/blocked_numbers_service.dart';
import '../l10n/app_localizations.dart';

class ConversationScreen extends StatefulWidget {
  final int threadId;
  final String contactName;
  final String address;
  final String lang;

  const ConversationScreen({
    super.key,
    required this.threadId,
    required this.contactName,
    required this.address,
    required this.lang,
  });

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  final SmsNativeService _smsService = SmsNativeService();
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<SmsMessage> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  bool _isBlocked = false;

  @override
  void initState() {
    super.initState();
    _checkBlockedStatus();
    _loadMessages();
    _smsService.markThreadAsRead(widget.threadId);
    _smsService.incomingSmsStream.listen((event) {
      if (event['sender'] == widget.address && !_isBlocked) {
        _loadMessages();
      }
    });
  }

  Future<void> _checkBlockedStatus() async {
    final blocked = await BlockedNumbersService.isBlocked(widget.address);
    if (mounted) {
      setState(() => _isBlocked = blocked);
    }
  }

  Future<void> _toggleBlockStatus() async {
    if (_isBlocked) {
      await BlockedNumbersService.removeBlockedNumber(widget.address);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${widget.address} has been unblocked')),
        );
      }
    } else {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          title: const Text('Block Number?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          content: Text(
            'Are you sure you want to block ${widget.contactName} (${widget.address})? Incoming messages from this sender will be suppressed.',
            style: const TextStyle(color: Color(0xFFCBD5E1), fontSize: 13),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel', style: TextStyle(color: Color(0xFF94A3B8))),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, true),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
              child: const Text('Block', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );

      if (confirm == true) {
        await BlockedNumbersService.addBlockedNumber(widget.address);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${widget.contactName} blocked successfully')),
          );
        }
      }
    }
    _checkBlockedStatus();
  }

  Future<void> _loadMessages() async {
    final list = await _smsService.getMessagesForThread(widget.threadId, widget.address);
    setState(() {
      _messages = list;
      _isLoading = false;
    });
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSend() async {
    final text = _textController.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() => _isSending = true);
    _textController.clear();

    final success = await _smsService.sendSms(widget.address, text);
    if (success) {
      // Append temporary message while reloading
      setState(() {
        _messages.add(SmsMessage(
          id: DateTime.now().millisecondsSinceEpoch,
          threadId: widget.threadId,
          address: widget.address,
          body: text,
          timestamp: DateTime.now(),
          isSentByMe: true,
          isRead: true,
          deliveryStatus: 'DELIVERED',
        ));
      });
      _scrollToBottom();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to send SMS. Tap to retry.')),
        );
      }
    }
    setState(() => _isSending = false);
    _loadMessages();
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: const Color(0xFF334155),
              child: Text(
                widget.contactName.isNotEmpty ? widget.contactName[0].toUpperCase() : '?',
                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.contactName,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    widget.address,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.call, color: Colors.indigoAccent),
            onPressed: () {
              // Call trigger
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: Colors.white),
            color: const Color(0xFF1E293B),
            onSelected: (val) {
              if (val == 'delete') {
                _smsService.deleteThread(widget.threadId);
                Navigator.pop(context);
              } else if (val == 'block') {
                _toggleBlockStatus();
              }
            },
            itemBuilder: (_) => [
              PopupMenuItem(
                value: 'block',
                child: Row(
                  children: [
                    Icon(_isBlocked ? Icons.check_circle : Icons.block, color: _isBlocked ? const Color(0xFF34D399) : Colors.redAccent, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      _isBlocked ? loc.translate('unblock') : loc.translate('block_number'),
                      style: TextStyle(color: _isBlocked ? const Color(0xFF34D399) : Colors.redAccent),
                    ),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'delete',
                child: Text(loc.translate('delete_conversation'), style: const TextStyle(color: Colors.redAccent)),
              ),
            ],
          ),
        ],
      ),

      body: Column(
        children: [
          // Blocked Contact Banner
          if (_isBlocked)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: Colors.redAccent.withOpacity(0.2),
              child: Row(
                children: [
                  const Icon(Icons.block, color: Colors.redAccent, size: 20),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'This contact is blocked. Incoming messages will be suppressed.',
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                  TextButton(
                    onPressed: _toggleBlockStatus,
                    child: Text(
                      loc.translate('unblock'),
                      style: const TextStyle(color: Colors.indigoAccent, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

          // Message List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Colors.indigoAccent))
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      return _buildMessageBubble(msg);
                    },
                  ),
          ),

          // Message Input Field
          SafeArea(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                border: Border(top: BorderSide(color: Color(0xFF334155), width: 0.5)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline, color: Color(0xFF94A3B8)),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      maxLines: 4,
                      minLines: 1,
                      decoration: InputDecoration(
                        hintText: loc.translate('type_message'),
                        hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _handleSend,
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: const Color(0xFF6366F1),
                      child: _isSending
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(SmsMessage msg) {
    final isMe = msg.isSentByMe;
    final timeStr = DateFormat('jm').format(msg.timestamp);

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFF6366F1) : const Color(0xFF334155),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 16),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg.body,
              style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.3),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  timeStr,
                  style: TextStyle(
                    color: isMe ? Colors.indigo.shade100 : const Color(0xFF94A3B8),
                    fontSize: 10,
                  ),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  const Icon(Icons.done_all, size: 12, color: Colors.white70),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
