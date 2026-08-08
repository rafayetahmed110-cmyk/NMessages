import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  FileCode,
  Folder,
  Copy,
  Check,
  Download,
  Terminal,
  FileText,
  Search,
  Code2,
  Sparkles
} from 'lucide-react';

interface SourceCodeExplorerProps {
  lang: 'bn' | 'en';
}

interface ProjectFile {
  path: string;
  language: string;
  content: string;
}

const PROJECT_FILES: ProjectFile[] = [
  {
    path: '.github/workflows/android.yml',
    language: 'yaml',
    content: `name: NMessages Android APK Build

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android Release APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Set up Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.x'
          channel: 'stable'
          cache: true

      - name: Get Flutter dependencies
        run: |
          cd n_messages
          flutter pub get

      - name: Build Release APK
        run: |
          cd n_messages
          flutter build apk --release

      - name: Upload Release APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: NMessages-Release-APK
          path: n_messages/build/app/outputs/flutter-apk/app-release.apk`
  },
  {
    path: 'n_messages/android/app/src/main/AndroidManifest.xml',
    language: 'xml',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.nmessages.app">

    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.RECEIVE_MMS" />
    <uses-permission android:name="android.permission.RECEIVE_WAP_PUSH" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:label="NMessages"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:allowBackup="true"
        android:theme="@style/LaunchTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <action android:name="android.intent.action.SENDTO" />
                <data android:scheme="sms" />
                <data android:scheme="smsto" />
            </intent-filter>
        </activity>

        <receiver
            android:name=".SmsReceiver"
            android:permission="android.permission.BROADCAST_SMS"
            android:exported="true">
            <intent-filter android:priority="999">
                <action android:name="android.provider.Telephony.SMS_RECEIVED" />
            </intent-filter>
        </receiver>

        <service
            android:name=".HeadlessSmsSendService"
            android:permission="android.permission.SEND_RESPOND_VIA_MESSAGE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.RESPOND_VIA_MESSAGE" />
                <data android:scheme="sms" />
            </intent-filter>
        </service>
    </application>
</manifest>`
  },
  {
    path: 'n_messages/android/app/src/main/kotlin/com/nmessages/app/MainActivity.kt',
    language: 'kotlin',
    content: `package com.nmessages.app

import android.app.role.RoleManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Telephony
import android.telephony.SmsManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val METHOD_CHANNEL = "com.nmessages.app/sms_native"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, METHOD_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "isDefaultSmsApp" -> result.success(checkIsDefaultSmsApp())
                "requestDefaultSmsRole" -> {
                    requestDefaultSmsAppRole()
                    result.success(true)
                }
                "getConversations" -> result.success(fetchConversations())
                "sendSms" -> {
                    val recipient = call.argument<String>("recipient") ?: ""
                    val message = call.argument<String>("message") ?: ""
                    result.success(sendSmsMessage(recipient, message))
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun checkIsDefaultSmsApp(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(RoleManager::class.java)
            roleManager?.isRoleHeld(RoleManager.ROLE_SMS) == true
        } else {
            Telephony.Sms.getDefaultSmsPackage(this) == packageName
        }
    }

    private fun requestDefaultSmsAppRole() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = getSystemService(RoleManager::class.java)
            if (roleManager != null && !roleManager.isRoleHeld(RoleManager.ROLE_SMS)) {
                val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_SMS)
                startActivityForResult(intent, 1001)
            }
        } else {
            val intent = Intent(Telephony.Sms.Intents.ACTION_CHANGE_DEFAULT)
            intent.putExtra(Telephony.Sms.Intents.EXTRA_PACKAGE_NAME, packageName)
            startActivity(intent)
        }
    }

    private fun fetchConversations(): List<Map<String, Any>> {
        val list = ArrayList<Map<String, Any>>()
        val cursor = contentResolver.query(
            Uri.parse("content://mms-sms/conversations?simple=true"),
            arrayOf("_id", "date", "snippet", "read", "address"),
            null, null, "date DESC"
        )
        cursor?.use { c ->
            while (c.moveToNext()) {
                val map = HashMap<String, Any>()
                map["threadId"] = c.getLong(c.getColumnIndexOrThrow("_id"))
                map["snippet"] = c.getString(c.getColumnIndexOrThrow("snippet")) ?: ""
                map["timestamp"] = c.getLong(c.getColumnIndexOrThrow("date"))
                map["address"] = c.getString(c.getColumnIndexOrThrow("address")) ?: ""
                map["isRead"] = c.getInt(c.getColumnIndexOrThrow("read")) == 1
                list.add(map)
            }
        }
        return list
    }

    private fun sendSmsMessage(recipient: String, message: String): Boolean {
        return try {
            val smsManager = SmsManager.getDefault()
            smsManager.sendTextMessage(recipient, null, message, null, null)
            true
        } catch (e: Exception) {
            false
        }
    }
}`
  },
  {
    path: 'n_messages/pubspec.yaml',
    language: 'yaml',
    content: `name: n_messages
description: "NMessages - A modern, fast, secure default Android SMS application built with Flutter."
publish_to: 'none'

version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  google_fonts: ^6.1.0
  intl: ^0.19.0
  cupertino_icons: ^1.0.6
  shared_preferences: ^2.2.2
  permission_handler: ^11.3.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`
  },
  {
    path: 'n_messages/lib/screens/default_sms_guide_screen.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
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

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    final status = await _smsService.isDefaultSmsApp();
    if (mounted) setState(() => _isDefaultSms = status);
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations(widget.lang);
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: Text(loc.translate('default_sms_guide_title')),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          ElevatedButton(
            onPressed: () async {
              await _smsService.requestDefaultSmsRole();
              _checkStatus();
            },
            child: Text(loc.translate('grant_role_btn')),
          ),
        ],
      ),
    );
  }
}`
  },
  {
    path: 'n_messages/lib/main.dart',
    language: 'dart',
    content: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const NMessagesApp());
}

class NMessagesApp extends StatelessWidget {
  const NMessagesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NMessages',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        colorSchemeSeed: const Color(0xFF6366F1),
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      ),
      home: const HomeScreen(lang: 'en'),
    );
  }
}`
  },
  {
    path: 'README.md',
    language: 'markdown',
    content: `# NMessages - Default Android SMS App

Complete Android SMS app built with Flutter, Kotlin, and Material Design 3.

## Quick Build Command
\`\`\`bash
cd n_messages
flutter pub get
flutter build apk --release
\`\`\``
  }
];

export const SourceCodeExplorer: React.FC<SourceCodeExplorerProps> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredFiles = PROJECT_FILES.filter((f) =>
    f.path.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NMessages-Flutter-Android.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* Top Banner */}
      <div className="p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              NMessages Source Code Package
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono">
                Flutter + Kotlin Native
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn' ? 'সম্পূর্ণ সোর্স কোড ডাউনলোড বা রিভিও করুন' : 'Inspect or export complete production source code'}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Packing ZIP...' : (lang === 'bn' ? 'সম্পূর্ণ সোর্স কোড ডাউনলোড ZIP' : 'Download Complete Source ZIP')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Sidebar File Tree */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/60 p-3 space-y-2 flex flex-col">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search source files..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
            {filteredFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition ${
                  selectedFile.path === file.path
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{file.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Editor Area */}
        <div className="lg:col-span-8 bg-slate-900 flex flex-col">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>{selectedFile.path}</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-y-auto max-h-[500px]">
            <pre className="whitespace-pre-wrap leading-relaxed">{selectedFile.content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
