import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/core_providers.dart';
import '../../data/models/public_store_settings.dart';
import '../../data/repositories/settings_repository.dart';

final settingsRepositoryProvider = Provider<SettingsRepository>((ref) {
  return SettingsRepository(ref.watch(apiClientProvider));
});

/// يُجلب مرة واحدة ويُخزَّن مؤقتًا طوال الجلسة - يُستخدم في Contact Us / About Us / Footer وغيرها
final publicStoreSettingsProvider = FutureProvider<PublicStoreSettings>((ref) {
  return ref.watch(settingsRepositoryProvider).getPublicSettings();
});

/// اللغة الحالية المختارة في التطبيق (منفصلة عن Backend - تفضيل جهاز/جلسة المستخدم)
/// القيمة الافتراضية هنا للتوافق فقط - القيمة الفعلية عند بدء التشغيل تُضبط في main.dart
/// عبر override (تقرأ من AppConstants.defaultLanguageCode أو اختيار المستخدم المحفوظ)
final appLocaleProvider = StateProvider<String>((ref) => AppConstants.defaultLanguageCode);
