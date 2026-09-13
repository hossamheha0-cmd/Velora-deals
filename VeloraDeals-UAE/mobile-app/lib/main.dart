import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app.dart';
import 'core/constants/app_constants.dart';
import 'features/settings/presentation/providers/settings_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // تحميل متغيرات البيئة (API_BASE_URL...) - انظر ملف .env في جذر المشروع
  await dotenv.load(fileName: '.env');

  // TODO: عند إعداد Firebase الفعلي للمشروع (بعد ربط google-services.json / GoogleService-Info.plist
  // الحقيقيين من Firebase Console)، فعّل التالي لدعم Push Notifications:
  // await Firebase.initializeApp();

  // قراءة اللغة المحفوظة مسبقًا (إن وُجدت) - العربية هي الافتراضي عند أول تشغيل للتطبيق
  final prefs = await SharedPreferences.getInstance();
  final savedLocale = prefs.getString(StorageKeys.preferredLanguage) ?? AppConstants.defaultLanguageCode;

  runApp(
    ProviderScope(
      overrides: [
        appLocaleProvider.overrideWith((ref) => savedLocale),
      ],
      child: const VeloraApp(),
    ),
  );
}
