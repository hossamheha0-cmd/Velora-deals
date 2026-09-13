import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/core_providers.dart';

class PaymentMethodModel {
  final String code;
  final String nameAr;
  final String nameEn;
  final bool isDefault;

  PaymentMethodModel({required this.code, required this.nameAr, required this.nameEn, required this.isDefault});

  factory PaymentMethodModel.fromJson(Map<String, dynamic> json) => PaymentMethodModel(
        code: json['code'] as String,
        nameAr: json['nameAr'] as String,
        nameEn: json['nameEn'] as String,
        isDefault: json['isDefault'] as bool? ?? false,
      );
}

final paymentMethodsProvider = FutureProvider<List<PaymentMethodModel>>((ref) async {
  final api = ref.watch(apiClientProvider);
  final json = await api.get(ApiPaths.paymentMethods);
  final items = json['items'] as List? ?? [];
  // Backend يرجع فقط الطرق المفعّلة (COD حاليًا) - انظر PaymentMethodsPublicController في Backend
  return items.map((e) => PaymentMethodModel.fromJson(e as Map<String, dynamic>)).toList();
});

final selectedPaymentMethodProvider = StateProvider<String?>((ref) => null);
