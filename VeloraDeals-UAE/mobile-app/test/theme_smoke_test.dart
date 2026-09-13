import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:velora_deals_uae/core/theme/app_theme.dart';

/// اختبار أساسي (Smoke Test) لا يعتمد على .env أو اتصال Backend أو Riverpod -
/// الهدف التأكد أن حزمة الثيم الأساسية تُبنى بدون أخطاء، كخطوة أولى قبل إضافة اختبارات أعمق.
///
/// ملاحظة صريحة: هذا الملف الوحيد الموجود حاليًا في test/. اختبارات Widget/Unit أشمل لكل
/// feature (auth, cart, orders...) لم تُكتب بعد - أُشير لذلك في PRODUCTION_READINESS.md.
void main() {
  testWidgets('AppTheme.light() builds a valid ThemeData without throwing', (tester) async {
    final theme = AppTheme.light();

    await tester.pumpWidget(
      MaterialApp(
        theme: theme,
        home: const Scaffold(
          body: Center(child: Text('Velora Deals UAE')),
        ),
      ),
    );

    expect(find.text('Velora Deals UAE'), findsOneWidget);
    expect(theme.colorScheme.primary, AppColors.primary);
  });

  test('AppColors brand palette matches official logo reference', () {
    expect(AppColors.primary, const Color(0xFF7A2FE0));
    expect(AppColors.secondary, const Color(0xFFE91E8C));
  });
}
