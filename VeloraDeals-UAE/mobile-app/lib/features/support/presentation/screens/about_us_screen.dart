import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../settings/presentation/providers/settings_provider.dart';

class AboutUsScreen extends ConsumerWidget {
  const AboutUsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(publicStoreSettingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('عن Velora Deals UAE')),
      body: settingsAsync.when(
        data: (settings) => ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Center(child: Image.asset('assets/images/velora_logo.png', height: 120)),
            const SizedBox(height: 24),
            Text(
              '${settings.storeName} هو وجهتك المفضلة للتسوق الإلكتروني في دولة الإمارات العربية المتحدة، '
              'نقدّم تشكيلة متنوعة من المنتجات في مختلف الفئات — من الإلكترونيات والهواتف إلى الأزياء ومستحضرات '
              'التجميل ولوازم المنزل — بتجربة تسوق سهلة وسريعة وموثوقة.',
              style: const TextStyle(height: 1.8, color: AppColors.textMuted),
              textAlign: TextAlign.right,
            ),
            const SizedBox(height: 20),
            _infoRow('العملة', settings.currency),
            _infoRow('نخدم', 'دولة الإمارات العربية المتحدة'),
            if (settings.officialWebsite != null) _infoRow('الموقع الرسمي', settings.officialWebsite!),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
