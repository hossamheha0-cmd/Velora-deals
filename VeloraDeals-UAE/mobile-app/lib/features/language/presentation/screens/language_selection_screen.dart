import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../settings/presentation/providers/settings_provider.dart';

/// أول شاشة يراها المستخدم إطلاقًا (قبل Onboarding وقبل تسجيل الدخول/التسجيل تمامًا).
/// English هي اللغة المحددة مسبقًا (Pre-selected) كافتراضي، والعربي هو الخيار البديل.
/// الاختيار يُحفَظ محليًا فيُعرض مرة واحدة فقط عند أول تشغيل للتطبيق.
class LanguageSelectionScreen extends ConsumerStatefulWidget {
  const LanguageSelectionScreen({super.key});

  @override
  ConsumerState<LanguageSelectionScreen> createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends ConsumerState<LanguageSelectionScreen> {
  String _selected = AppConstants.defaultLanguageCode; // 'en' افتراضيًا

  Future<void> _continue() async {
    ref.read(appLocaleProvider.notifier).state = _selected;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(StorageKeys.preferredLanguage, _selected);
    await prefs.setBool(StorageKeys.hasSelectedLanguage, true);
    if (mounted) context.go('/onboarding');
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = _selected == 'ar';

    return Directionality(
      // الشاشة نفسها تدعم الاتجاهين فورًا حسب الاختيار الحالي، حتى قبل تطبيق اللغة على باقي التطبيق
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset('assets/images/velora_logo.png', height: 120),
                const SizedBox(height: 40),
                Text(
                  isArabic ? 'اختر لغتك' : 'Choose your language',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textOnLight),
                ),
                const SizedBox(height: 24),
                _LanguageOption(
                  label: 'English',
                  subtitle: 'Default',
                  selected: _selected == 'en',
                  onTap: () => setState(() => _selected = 'en'),
                ),
                const SizedBox(height: 12),
                _LanguageOption(
                  label: 'العربية',
                  subtitle: 'Arabic',
                  selected: _selected == 'ar',
                  onTap: () => setState(() => _selected = 'ar'),
                ),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: _continue,
                  child: Text(isArabic ? 'متابعة' : 'Continue'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LanguageOption extends StatelessWidget {
  final String label;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  const _LanguageOption({required this.label, required this.subtitle, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withOpacity(0.06) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? AppColors.primary : Colors.grey.shade300, width: selected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                ],
              ),
            ),
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: selected ? AppColors.primary : Colors.grey.shade400,
            ),
          ],
        ),
      ),
    );
  }
}
