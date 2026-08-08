# NMessages - Modern Default Android SMS Application

**NMessages** is a complete, production-ready, default Android SMS and messaging application crafted with Flutter, Material Design 3, and Kotlin Platform Channels.

---

## Features
- **Default SMS App Handler**: Fully compliant with Android `RoleManager` and `Telephony.Sms` intents.
- **Modern Dark UI**: Pixel-perfect dark theme with smooth animations, custom avatars, and Material 3 design.
- **SMS Inbox & Threads**: Read device SMS conversations (`content://sms`), unread badges, and pinned threads.
- **SMS Send & Receive**: Instant background SMS receiving via `BroadcastReceiver` and sending via `SmsManager`.
- **Search & Filter**: Search by contact name, phone number, or text. Filter by All, Unread, Read, or Pinned.
- **Contacts Integration**: Direct access to Android contacts (`ContactsContract`) with contact search and quick chat creation.
- **Multi-language Support**: Full English and Bengali (বাংলা) localization.
- **Blocked Numbers**: Built-in phone number blocker to suppress unwanted incoming SMS.
- **Notifications**: Local notifications with quick reply and mark-as-read integration.
- **Offline & Local**: Zero external server, zero Firebase requirement — operates purely with local device SMS storage.

---

## Project Structure
```text
n_messages/
├── .github/
│   └── workflows/
│       └── android.yml          # GitHub Actions workflow for building release APK
├── android/
│   └── app/
│       ├── src/main/
│       │   ├── AndroidManifest.xml
│       │   └── kotlin/com/nmessages/app/
│       │       ├── MainActivity.kt               # Platform Channel & SMS Content Resolver
│       │       ├── SmsReceiver.kt                # SMS BroadcastReceiver
│       │       ├── MmsReceiver.kt                # MMS Receiver
│       │       └── HeadlessSmsSendService.kt     # Default SMS Service
│       └── build.gradle
├── lib/
│   ├── l10n/
│   │   └── app_localizations.dart
│   ├── models/
│   │   ├── contact_model.dart
│   │   ├── conversation.dart
│   │   └── sms_message.dart
│   ├── screens/
│   │   ├── blocked_numbers_screen.dart
│   │   ├── contacts_screen.dart
│   │   ├── conversation_screen.dart
│   │   ├── home_screen.dart
│   │   ├── new_message_screen.dart
│   │   └── settings_screen.dart
│   ├── services/
│   │   ├── blocked_numbers_service.dart
│   │   └── sms_native_service.dart
│   └── main.dart
├── pubspec.yaml
└── README.md
```

---

## Quick Start / Build Locally

### Prerequisites
- [Flutter SDK](https://flutter.dev) (v3.19.0 or later)
- Android Studio with Android SDK (API 34)
- Java 17

### Building APK locally
```bash
# 1. Clone repository
git clone https://github.com/your-username/NMessages.git
cd NMessages/n_messages

# 2. Get dependencies
flutter pub get

# 3. Analyze project
flutter analyze

# 4. Build Release APK
flutter build apk --release
```
The compiled APK will be at:
`n_messages/build/app/outputs/flutter-apk/app-release.apk`

---

## Automated GitHub Actions APK Build

This repository includes a pre-configured `.github/workflows/android.yml` GitHub Actions workflow.

### To compile an APK directly on GitHub:
1. Push this repository to GitHub.
2. Go to the **Actions** tab on your GitHub repository.
3. Select **NMessages Android APK Build** and click **Run workflow**.
4. Once completed, download the release APK from the **Artifacts** section!

---

## Setting NMessages as Default SMS App on Android
1. Install `app-release.apk` on your Android phone.
2. Open NMessages.
3. Tap **"Set as Default SMS App"** on the home screen banner or in **Settings**.
4. Grant the system Default SMS App role prompt.
5. Enjoy fast, secure, and modern SMS messaging!
