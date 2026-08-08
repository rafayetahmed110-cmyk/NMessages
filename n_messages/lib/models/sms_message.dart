class SmsMessage {
  final int id;
  final int threadId;
  final String address;
  final String body;
  final DateTime timestamp;
  final bool isSentByMe;
  final bool isRead;
  final String deliveryStatus;

  SmsMessage({
    required this.id,
    required this.threadId,
    required this.address,
    required this.body,
    required this.timestamp,
    required this.isSentByMe,
    required this.isRead,
    this.deliveryStatus = 'DELIVERED',
  });

  factory SmsMessage.fromMap(Map<dynamic, dynamic> map) {
    return SmsMessage(
      id: (map['id'] as num?)?.toInt() ?? 0,
      threadId: (map['threadId'] as num?)?.toInt() ?? 0,
      address: (map['address'] as String?) ?? '',
      body: (map['body'] as String?) ?? '',
      timestamp: DateTime.fromMillisecondsSinceEpoch(
        (map['timestamp'] as num?)?.toInt() ?? DateTime.now().millisecondsSinceEpoch,
      ),
      isSentByMe: (map['isSentByMe'] as bool?) ?? false,
      isRead: (map['isRead'] as bool?) ?? true,
      deliveryStatus: (map['deliveryStatus'] as String?) ?? 'DELIVERED',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'threadId': threadId,
      'address': address,
      'body': body,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'isSentByMe': isSentByMe,
      'isRead': isRead,
      'deliveryStatus': deliveryStatus,
    };
  }
}
