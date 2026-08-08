package com.nmessages.app

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.ContactsContract
import android.provider.Telephony
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import androidx.annotation.NonNull
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val METHOD_CHANNEL = "com.nmessages.app/sms_native"
    private val EVENT_CHANNEL = "com.nmessages.app/sms_incoming"
    private val ROLE_REQUEST_CODE = 1001

    private var eventSink: EventChannel.EventSink? = null

    companion object {
        var instance: MainActivity? = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        instance = this
    }

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, METHOD_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "isDefaultSmsApp" -> {
                    result.success(checkIsDefaultSmsApp())
                }
                "requestDefaultSmsRole" -> {
                    requestDefaultSmsAppRole()
                    result.success(true)
                }
                "getConversations" -> {
                    val conversations = fetchConversations()
                    result.success(conversations)
                }
                "getMessagesForThread" -> {
                    val threadId = call.argument<Long>("threadId") ?: 0L
                    val address = call.argument<String>("address") ?: ""
                    val messages = fetchMessagesForThread(threadId, address)
                    result.success(messages)
                }
                "sendSms" -> {
                    val recipient = call.argument<String>("recipient") ?: ""
                    val message = call.argument<String>("message") ?: ""
                    val subId = call.argument<Int>("subscriptionId") ?: -1
                    val success = sendSmsMessage(recipient, message, subId)
                    result.success(success)
                }
                "markThreadAsRead" -> {
                    val threadId = call.argument<Long>("threadId") ?: 0L
                    markThreadAsRead(threadId)
                    result.success(true)
                }
                "deleteThread" -> {
                    val threadId = call.argument<Long>("threadId") ?: 0L
                    val count = deleteThread(threadId)
                    result.success(count > 0)
                }
                "deleteMessage" -> {
                    val messageId = call.argument<Long>("messageId") ?: 0L
                    val count = deleteSingleMessage(messageId)
                    result.success(count > 0)
                }
                "getDeviceContacts" -> {
                    val contacts = fetchDeviceContacts()
                    result.success(contacts)
                }
                "getSimInfo" -> {
                    val simList = fetchSimInfo()
                    result.success(simList)
                }
                else -> {
                    result.notImplemented()
                }
            }
        }

        EventChannel(flutterEngine.dartExecutor.binaryMessenger, EVENT_CHANNEL).setStreamHandler(
            object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    eventSink = events
                }

                override fun onCancel(arguments: Any?) {
                    eventSink = null
                }
            }
        )
    }

    fun notifyIncomingSms(sender: String, body: String, timestamp: Long) {
        runOnUiThread {
            val map = HashMap<String, Any>()
            map["sender"] = sender
            map["body"] = body
            map["timestamp"] = timestamp
            eventSink?.success(map)
        }
    }

    private fun checkIsDefaultSmsApp(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(RoleManager::class.java)
            roleManager?.isRoleHeld(RoleManager.ROLE_SMS) == true
        } else {
            val defaultPackage = Telephony.Sms.getDefaultSmsPackage(this)
            defaultPackage == packageName
        }
    }

    private fun requestDefaultSmsAppRole() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(RoleManager::class.java)
            if (roleManager != null && !roleManager.isRoleHeld(RoleManager.ROLE_SMS)) {
                val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_SMS)
                startActivityForResult(intent, ROLE_REQUEST_CODE)
            }
        } else {
            val intent = Intent(Telephony.Sms.Intents.ACTION_CHANGE_DEFAULT)
            intent.putExtra(Telephony.Sms.Intents.EXTRA_PACKAGE_NAME, packageName)
            startActivity(intent)
        }
    }

    private fun fetchConversations(): List<Map<String, Any>> {
        val conversations = ArrayList<Map<String, Any>>()
        val uri = Uri.parse("content://mms-sms/conversations?simple=true")
        val projection = arrayOf("_id", "date", "message_count", "snippet", "read", "address")

        val cursor = contentResolver.query(uri, projection, null, null, "date DESC")
        cursor?.use { c ->
            val idIndex = c.getColumnIndex("_id")
            val dateIndex = c.getColumnIndex("date")
            val snippetIndex = c.getColumnIndex("snippet")
            val readIndex = c.getColumnIndex("read")
            val addressIndex = c.getColumnIndex("address")

            while (c.moveToNext()) {
                val threadId = if (idIndex != -1) c.getLong(idIndex) else 0L
                val date = if (dateIndex != -1) c.getLong(dateIndex) else System.currentTimeMillis()
                val snippet = if (snippetIndex != -1) c.getString(snippetIndex) ?: "" else ""
                val read = if (readIndex != -1) c.getInt(readIndex) else 1
                var address = if (addressIndex != -1) c.getString(addressIndex) ?: "" else ""

                if (address.isEmpty()) {
                    address = getAddressFromThreadId(threadId)
                }

                val contactName = getContactNameForNumber(address)

                val map = HashMap<String, Any>()
                map["threadId"] = threadId
                map["address"] = address
                map["contactName"] = if (contactName.isNotEmpty()) contactName else address
                map["snippet"] = snippet
                map["timestamp"] = date
                map["isRead"] = read == 1
                map["unreadCount"] = if (read == 0) 1 else 0

                conversations.add(map)
            }
        }
        return conversations
    }

    private fun getAddressFromThreadId(threadId: Long): String {
        val uri = Uri.parse("content://sms/")
        val cursor = contentResolver.query(uri, arrayOf("address"), "thread_id=?", arrayOf(threadId.toString()), "date DESC LIMIT 1")
        var address = ""
        cursor?.use { c ->
            if (c.moveToFirst()) {
                val idx = c.getColumnIndex("address")
                if (idx != -1) address = c.getString(idx) ?: ""
            }
        }
        return address
    }

    private fun fetchMessagesForThread(threadId: Long, address: String): List<Map<String, Any>> {
        val messages = ArrayList<Map<String, Any>>()
        val uri = Uri.parse("content://sms/")
        val selection = if (threadId > 0) "thread_id=?" else "address=?"
        val selectionArgs = if (threadId > 0) arrayOf(threadId.toString()) else arrayOf(address)

        val cursor = contentResolver.query(uri, null, selection, selectionArgs, "date ASC")
        cursor?.use { c ->
            val idIdx = c.getColumnIndex("_id")
            val threadIdx = c.getColumnIndex("thread_id")
            val addressIdx = c.getColumnIndex("address")
            val bodyIdx = c.getColumnIndex("body")
            val dateIdx = c.getColumnIndex("date")
            val typeIdx = c.getColumnIndex("type")
            val readIdx = c.getColumnIndex("read")

            while (c.moveToNext()) {
                val id = if (idIdx != -1) c.getLong(idIdx) else 0L
                val tId = if (threadIdx != -1) c.getLong(threadIdx) else threadId
                val addr = if (addressIdx != -1) c.getString(addressIdx) ?: address else address
                val body = if (bodyIdx != -1) c.getString(bodyIdx) ?: "" else ""
                val date = if (dateIdx != -1) c.getLong(dateIdx) else System.currentTimeMillis()
                val type = if (typeIdx != -1) c.getInt(typeIdx) else 1 // 1 = inbox, 2 = sent
                val read = if (readIdx != -1) c.getInt(readIdx) else 1

                val map = HashMap<String, Any>()
                map["id"] = id
                map["threadId"] = tId
                map["address"] = addr
                map["body"] = body
                map["timestamp"] = date
                map["isSentByMe"] = (type == 2)
                map["isRead"] = (read == 1)
                map["deliveryStatus"] = "DELIVERED"

                messages.add(map)
            }
        }
        return messages
    }

    private fun sendSmsMessage(recipient: String, message: String, subscriptionId: Int): Boolean {
        return try {
            val smsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && subscriptionId != -1) {
                getSystemService(SmsManager::class.java).createForSubscriptionId(subscriptionId)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }

            val parts = smsManager.divideMessage(message)
            if (parts.size > 1) {
                smsManager.sendMultipartTextMessage(recipient, null, parts, null, null)
            } else {
                smsManager.sendTextMessage(recipient, null, message, null, null)
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun markThreadAsRead(threadId: Long) {
        try {
            val uri = Uri.parse("content://sms/inbox")
            val values = android.content.ContentValues()
            values.put("read", 1)
            contentResolver.update(uri, values, "thread_id=? AND read=0", arrayOf(threadId.toString()))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun deleteThread(threadId: Long): Int {
        return try {
            val uri = Uri.parse("content://sms/conversations/$threadId")
            contentResolver.delete(uri, null, null)
        } catch (e: Exception) {
            e.printStackTrace()
            0
        }
    }

    private fun deleteSingleMessage(messageId: Long): Int {
        return try {
            val uri = Uri.parse("content://sms/$messageId")
            contentResolver.delete(uri, null, null)
        } catch (e: Exception) {
            e.printStackTrace()
            0
        }
    }

    private fun fetchDeviceContacts(): List<Map<String, String>> {
        val contactsList = ArrayList<Map<String, String>>()
        val cursor = contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            arrayOf(
                ContactsContract.CommonDataKinds.Phone.CONTACT_ID,
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.NUMBER
            ),
            null,
            null,
            "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} ASC"
        )

        cursor?.use { c ->
            val nameIdx = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
            val numIdx = c.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)

            while (c.moveToNext()) {
                val name = if (nameIdx != -1) c.getString(nameIdx) ?: "" else ""
                val num = if (numIdx != -1) c.getString(numIdx) ?: "" else ""

                if (num.isNotEmpty()) {
                    val map = HashMap<String, String>()
                    map["name"] = name
                    map["phoneNumber"] = num
                    contactsList.add(map)
                }
            }
        }
        return contactsList
    }

    private fun getContactNameForNumber(phoneNumber: String): String {
        if (phoneNumber.isEmpty()) return ""
        val uri = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(phoneNumber))
        val cursor = contentResolver.query(uri, arrayOf(ContactsContract.PhoneLookup.DISPLAY_NAME), null, null, null)
        cursor?.use { c ->
            if (c.moveToFirst()) {
                val idx = c.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME)
                if (idx != -1) return c.getString(idx) ?: ""
            }
        }
        return ""
    }

    private fun fetchSimInfo(): List<Map<String, Any>> {
        val simList = ArrayList<Map<String, Any>>()
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
            val subManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as? SubscriptionManager
            val activeList = subManager?.activeSubscriptionInfoList
            activeList?.forEach { info ->
                val map = HashMap<String, Any>()
                map["subscriptionId"] = info.subscriptionId
                map["carrierName"] = info.carrierName.toString()
                map["simSlotIndex"] = info.simSlotIndex
                simList.add(map)
            }
        }
        return simList
    }
}
