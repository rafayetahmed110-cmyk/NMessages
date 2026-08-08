import 'dart:async';
import 'package:flutter/services.dart';
import '../models/conversation.dart';
import '../models/sms_message.dart';
import '../models/contact_model.dart';

class SmsNativeService {
  static const MethodChannel _channel = MethodChannel('com.nmessages.app/sms_native');
  static const EventChannel _eventChannel = EventChannel('com.nmessages.app/sms_incoming');

  Stream<Map<String, dynamic>>? _incomingSmsStream;

  Stream<Map<String, dynamic>> get incomingSmsStream {
    _incomingSmsStream ??= _eventChannel
        .receiveBroadcastStream()
        .map((dynamic event) => Map<String, dynamic>.from(event as Map));
    return _incomingSmsStream!;
  }

  Future<bool> isDefaultSmsApp() async {
    try {
      final bool result = await _channel.invokeMethod('isDefaultSmsApp');
      return result;
    } catch (e) {
      return false;
    }
  }

  Future<void> requestDefaultSmsRole() async {
    try {
      await _channel.invokeMethod('requestDefaultSmsRole');
    } catch (e) {
      print('Error requesting default SMS role: $e');
    }
  }

  Future<List<Conversation>> getConversations() async {
    try {
      final List<dynamic> result = await _channel.invokeMethod('getConversations');
      return result.map((e) => Conversation.fromMap(Map<dynamic, dynamic>.from(e as Map))).toList();
    } catch (e) {
      print('Error fetching conversations: $e');
      return [];
    }
  }

  Future<List<SmsMessage>> getMessagesForThread(int threadId, String address) async {
    try {
      final List<dynamic> result = await _channel.invokeMethod('getMessagesForThread', {
        'threadId': threadId,
        'address': address,
      });
      return result.map((e) => SmsMessage.fromMap(Map<dynamic, dynamic>.from(e as Map))).toList();
    } catch (e) {
      print('Error fetching messages for thread: $e');
      return [];
    }
  }

  Future<bool> sendSms(String recipient, String message, {int subscriptionId = -1}) async {
    try {
      final bool success = await _channel.invokeMethod('sendSms', {
        'recipient': recipient,
        'message': message,
        'subscriptionId': subscriptionId,
      });
      return success;
    } catch (e) {
      print('Error sending SMS: $e');
      return false;
    }
  }

  Future<void> markThreadAsRead(int threadId) async {
    try {
      await _channel.invokeMethod('markThreadAsRead', {'threadId': threadId});
    } catch (e) {
      print('Error marking thread as read: $e');
    }
  }

  Future<bool> deleteThread(int threadId) async {
    try {
      final bool result = await _channel.invokeMethod('deleteThread', {'threadId': threadId});
      return result;
    } catch (e) {
      print('Error deleting thread: $e');
      return false;
    }
  }

  Future<bool> deleteMessage(int messageId) async {
    try {
      final bool result = await _channel.invokeMethod('deleteMessage', {'messageId': messageId});
      return result;
    } catch (e) {
      print('Error deleting message: $e');
      return false;
    }
  }

  Future<List<ContactModel>> getDeviceContacts() async {
    try {
      final List<dynamic> result = await _channel.invokeMethod('getDeviceContacts');
      return result.map((e) => ContactModel.fromMap(Map<dynamic, dynamic>.from(e as Map))).toList();
    } catch (e) {
      print('Error fetching device contacts: $e');
      return [];
    }
  }
}
