import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _decideNextRoute());
  }

  Future<void> _decideNextRoute() async {
    await Future.delayed(const Duration(milliseconds: 900)); // مدة عرض بسيطة للشعار
    if (!mounted) return;

    final prefs = await SharedPreferences.getInstance();

    // ترتيب الفحص: اختيار اللغة أولًا (أول شيء إطلاقًا) -> Onboarding -> حالة تسجيل الدخول
    final hasSelectedLanguage = prefs.getBool(StorageKeys.hasSelectedLanguage) ?? false;
    if (!hasSelectedLanguage) {
      if (mounted) context.go('/language-selection');
      return;
    }

    final hasSeenOnboarding = prefs.getBool(StorageKeys.hasSeenOnboarding) ?? false;

    if (!hasSeenOnboarding) {
      if (mounted) context.go('/onboarding');
      return;
    }

    // ننتظر حسم حالة تسجيل الدخول (AuthNotifier._bootstrap يتحقق من التوكن المخزَّن فعليًا)
    while (ref.read(authProvider).status == AuthStatus.unknown) {
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted) return;
    }

    final isAuthenticated = ref.read(authProvider).status == AuthStatus.authenticated;
    if (!mounted) return;
    context.go(isAuthenticated ? '/home' : '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white, // اللوجو الجديد بخلفية بيضاء - نفس لون خلفية Native Splash
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('assets/images/velora_logo.png', height: 160),
            const SizedBox(height: 24),
            const CircularProgressIndicator(color: AppColors.accentGold, strokeWidth: 2),
          ],
        ),
      ),
    );
  }
}
