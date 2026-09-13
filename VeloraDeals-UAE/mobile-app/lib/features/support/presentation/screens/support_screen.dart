import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../settings/presentation/providers/settings_provider.dart';

/// شاشة "الدعم والتواصل" - كل بيانات التواصل تأتي من /settings/public (Backend)
/// وليست مكتوبة داخل الكود، بحيث يقدر Super Admin يغيّرها من لوحة التحكم بدون تحديث جديد للتطبيق.
class SupportScreen extends ConsumerWidget {
  const SupportScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(publicStoreSettingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الدعم والتواصل')),
      body: settingsAsync.when(
        data: (settings) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (settings.contactWhatsapp.isNotEmpty)
              _ContactTile(
                icon: Icons.chat_bubble_outline,
                title: 'واتساب',
                subtitle: settings.contactWhatsapp,
                onTap: () => launchUrl(Uri.parse('https://wa.me/${settings.contactWhatsapp.replaceAll('+', '').replaceAll(' ', '')}')),
              ),
            if (settings.contactPhone.isNotEmpty)
              _ContactTile(
                icon: Icons.call_outlined,
                title: 'اتصال هاتفي',
                subtitle: settings.contactPhone,
                onTap: () => launchUrl(Uri.parse('tel:${settings.contactPhone}')),
              ),
            if (settings.contactEmail.isNotEmpty)
              _ContactTile(
                icon: Icons.email_outlined,
                title: 'البريد الإلكتروني',
                subtitle: settings.contactEmail,
                onTap: () => launchUrl(Uri.parse('mailto:${settings.contactEmail}')),
              ),
            const SizedBox(height: 16),
            const Text('تابعونا على مواقع التواصل', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                if (settings.facebookUrl != null) _SocialIcon(icon: Icons.facebook, url: settings.facebookUrl!),
                if (settings.instagramUrl != null) _SocialIcon(icon: Icons.camera_alt_outlined, url: settings.instagramUrl!),
                if (settings.tiktokUrl != null) _SocialIcon(icon: Icons.music_note_outlined, url: settings.tiktokUrl!),
                if (settings.youtubeUrl != null) _SocialIcon(icon: Icons.play_circle_outline, url: settings.youtubeUrl!),
              ],
            ),
            const SizedBox(height: 24),
            const Text('الأسئلة الشائعة', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const _FaqTile(question: 'ما هي طريقة الدفع المتاحة؟', answer: 'الدفع عند الاستلام (Cash On Delivery) هو الطريقة المتاحة حاليًا.'),
            const _FaqTile(question: 'ما هي رسوم الشحن؟', answer: 'رسوم شحن ثابتة تُعرض بوضوح في صفحة الدفع قبل تأكيد الطلب.'),
            const _FaqTile(question: 'كيف أتابع حالة طلبي؟', answer: 'من قسم "طلباتي" في حسابك، يمكنك متابعة حالة الطلب ورقم التتبع عند توفره.'),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}

class _ContactTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  const _ContactTile({required this.icon, required this.title, required this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: AppColors.primary.withOpacity(0.1), child: Icon(icon, color: AppColors.primary)),
        title: Text(title),
        subtitle: Text(subtitle, textDirection: TextDirection.ltr),
        onTap: onTap,
      ),
    );
  }
}

class _SocialIcon extends StatelessWidget {
  final IconData icon;
  final String url;
  const _SocialIcon({required this.icon, required this.url});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication),
      child: CircleAvatar(radius: 24, backgroundColor: AppColors.primary.withOpacity(0.1), child: Icon(icon, color: AppColors.primary)),
    );
  }
}

class _FaqTile extends StatelessWidget {
  final String question;
  final String answer;
  const _FaqTile({required this.question, required this.answer});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ExpansionTile(
        title: Text(question, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        children: [Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: Align(alignment: Alignment.centerRight, child: Text(answer, style: const TextStyle(color: AppColors.textMuted))))],
      ),
    );
  }
}
