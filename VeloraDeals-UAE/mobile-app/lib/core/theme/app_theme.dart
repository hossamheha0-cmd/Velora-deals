import 'package:flutter/material.dart';

/// نظام الألوان الرسمي - مُستخرج فعليًا (بأخذ عينات ألوان حقيقية من الصورة) من شعار
/// "Veloradeals UAE" الجديد (كحل أزرق داكن/ذهبي)، بعد استبدال اللوجو القديم (بنفسجي/فوشيا).
/// هذه القيم هي "المرجع الرسمي" الحالي ولا تُعدَّل بدون موافقة صريحة.
class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF132E53); // أزرق داكن (كحلي) - من اللوجو الجديد
  static const Color secondary = Color(0xFF2E86D8); // أزرق فاتح (جناح النسر) - من اللوجو الجديد
  static const Color accentGold = Color(0xFFC0995B); // ذهبي - من اللوجو الجديد
  static const Color accentOrange = Color(0xFFFF6A00);
  static const Color accentBlue = Color(0xFF2FA8E0);

  static const Color backgroundDark = Color(0xFF0B1C36);
  static const Color backgroundLight = Color(0xFFF7F9FB);

  static const Color textOnDark = Color(0xFFFFFFFF);
  static const Color textOnLight = Color(0xFF16233B);
  static const Color textMuted = Color(0xFF7A8699);

  static const Color success = Color(0xFF22C55E);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFC0995B);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.centerRight, // يبدأ من اليمين لدعم اتجاه RTL بصريًا
    end: Alignment.centerLeft,
  );
}

class AppTheme {
  AppTheme._();

  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
      ),
      scaffoldBackgroundColor: AppColors.backgroundLight,
      fontFamily: 'Cairo', // خط يدعم العربي والإنجليزي بوضوح - يُضاف عبر google_fonts أو أصول محلية
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.textOnLight,
        elevation: 0,
        centerTitle: true,
        surfaceTintColor: Colors.transparent,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: 0,
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          side: const BorderSide(color: AppColors.primary),
          foregroundColor: AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.error),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.grey.shade100),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
    );
  }
}
