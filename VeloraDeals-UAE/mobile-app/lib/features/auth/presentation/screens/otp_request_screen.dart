import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl_phone_field/intl_phone_field.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';

class OtpRequestScreen extends ConsumerStatefulWidget {
  const OtpRequestScreen({super.key});

  @override
  ConsumerState<OtpRequestScreen> createState() => _OtpRequestScreenState();
}

class _OtpRequestScreenState extends ConsumerState<OtpRequestScreen> {
  String? _fullPhoneNumber;

  Future<void> _submit() async {
    if (_fullPhoneNumber == null) return;
    final seconds = await ref.read(authProvider.notifier).requestOtp(_fullPhoneNumber!);
    if (seconds != null && mounted) {
      context.push('/otp-verify', extra: _fullPhoneNumber);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الدخول برقم الهاتف')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'أدخل رقم هاتفك وسنرسل لك رمز تحقق (OTP) لتسجيل الدخول أو إنشاء حساب جديد تلقائيًا',
                style: TextStyle(color: AppColors.textMuted),
              ),
              const SizedBox(height: 24),
              IntlPhoneField(
                initialCountryCode: 'AE',
                decoration: const InputDecoration(labelText: 'رقم الهاتف', border: OutlineInputBorder()),
                onChanged: (phone) => _fullPhoneNumber = phone.completeNumber,
              ),
              if (authState.errorMessage != null) ...[
                const SizedBox(height: 12),
                Text(authState.errorMessage!, style: const TextStyle(color: AppColors.error)),
              ],
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: authState.isLoading ? null : _submit,
                child: authState.isLoading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('إرسال رمز التحقق'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
