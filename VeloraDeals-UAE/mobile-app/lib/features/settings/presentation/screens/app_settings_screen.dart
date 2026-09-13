import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/settings_provider.dart';

class AppSettingsScreen extends ConsumerWidget {
  const AppSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocale = ref.watch(appLocaleProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('اللغة / Language', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            child: Column(
              children: [
                RadioListTile<String>(
                  title: const Text('العربية (الافتراضية)'),
                  value: 'ar',
                  groupValue: currentLocale,
                  onChanged: (v) => _changeLocale(ref, v!),
                ),
                RadioListTile<String>(
                  title: const Text('English'),
                  value: 'en',
                  groupValue: currentLocale,
                  onChanged: (v) => _changeLocale(ref, v!),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text('العملة', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Card(
            child: ListTile(
              leading: Icon(Icons.attach_money, color: AppColors.primary),
              title: Text('درهم إماراتي (AED)'),
              subtitle: Text('العملة الأساسية لجميع الأسعار في التطبيق'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _changeLocale(WidgetRef ref, String locale) async {
    ref.read(appLocaleProvider.notifier).state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(StorageKeys.preferredLanguage, locale);
    // ملاحظة: تطبيق فعلي لتغيير اتجاه/لغة الواجهة بالكامل (Restart MaterialApp locale) يتم
    // عبر ربط appLocaleProvider بـ MaterialApp.router(locale: ...) في main.dart (مُنفَّذ هناك).
  }
}
