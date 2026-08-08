class Conversation {
  final int threadId;
  final String address;
  final String contactName;
  final String snippet;
  final DateTime timestamp;
  final bool isRead;
  final int unreadCount;
  final bool isPinned;
  final bool isArchived;

  Conversation({
    required this.threadId,
    required this.address,
    required this.contactName,
    required this.snippet,
    required this.timestamp,
    required this.isRead,
    required this.unreadCount,
    this.isPinned = false,
    this.isArchived = false,
  });

  factory Conversation.fromMap(Map<dynamic, dynamic> map) {
    return Conversation(
      threadId: (map['threadId'] as num?)?.toInt() ?? 0,
      address: (map['address'] as String?) ?? '',
      contactName: (map['contactName'] as String?) ?? (map['address'] as String? ?? ''),
      snippet: (map['snippet'] as String?) ?? '',
      timestamp: DateTime.fromMillisecondsSinceEpoch(
        (map['timestamp'] as num?)?.toInt() ?? DateTime.now().millisecondsSinceEpoch,
      ),
      isRead: (map['isRead'] as bool?) ?? true,
      unreadCount: (map['unreadCount'] as num?)?.toInt() ?? 0,
      isPinned: (map['isPinned'] as bool?) ?? false,
      isArchived: (map['isArchived'] as bool?) ?? false,
    );
  }

  Conversation copyWith({
    int? threadId,
    String? address,
    String? contactName,
    String? snippet,
    DateTime? timestamp,
    bool? isRead,
    int? unreadCount,
    bool? isPinned,
    bool? isArchived,
  }) {
    return Conversation(
      threadId: threadId ?? this.threadId,
      address: address ?? this.address,
      contactName: contactName ?? this.contactName,
      snippet: snippet ?? this.snippet,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      unreadCount: unreadCount ?? this.unreadCount,
      isPinned: isPinned ?? this.isPinned,
      isArchived: isArchived ?? this.isArchived,
    );
  }
}
