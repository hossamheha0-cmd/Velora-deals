import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/errors/api_exception.dart';
import '../../../addresses/presentation/providers/addresses_provider.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../data/models/payment_method_model.dart';
import '../../../orders/presentation/providers/orders_provider.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _noteController = TextEditingController();
  bool _placing = false;
  String? _error;

  Future<void> _placeOrder() async {
    final addressId = ref.read(selectedAddressIdProvider);
    final paymentCode = ref.read(selectedPaymentMethodProvider);

    if (addressId == null) {
      setState(() => _error = 'برجاء اختيار عنوان الشحن');
      return;
    }
    if (paymentCode == null) {
      setState(() => _error = 'برجاء اختيار طريقة الدفع');
      return;
    }

    setState(() {
      _placing = true;
      _error = null;
    });

    try {
      final order = await ref.read(ordersRepositoryProvider).createOrder(
            shippingAddressId: addressId,
            paymentMethodCode: paymentCode,
            customerNote: _noteController.text.trim(),
          );
      // تفريغ حالة السلة محليًا بعد نجاح الطلب (Backend يكون قد فرّغها فعليًا بالفعل)
      ref.invalidate(cartProvider);
      if (mounted) {
        context.go('/order-success/${order.id}');
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final addressesAsync = ref.watch(addressesProvider);
    final selectedAddressId = ref.watch(selectedAddressIdProvider);
    final paymentMethodsAsync = ref.watch(paymentMethodsProvider);
    final selectedPayment = ref.watch(selectedPaymentMethodProvider);
    final cartAsync = ref.watch(cartProvider);

    // اختيار العنوان الافتراضي تلقائيًا عند أول تحميل لو مفيش عنوان مختار بعد
    addressesAsync.whenData((addresses) {
      if (selectedAddressId == null && addresses.isNotEmpty) {
        final defaultAddress = addresses.firstWhere((a) => a.isDefault, orElse: () => addresses.first);
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref.read(selectedAddressIdProvider.notifier).state = defaultAddress.id;
        });
      }
    });
    paymentMethodsAsync.whenData((methods) {
      if (selectedPayment == null && methods.isNotEmpty) {
        final defaultMethod = methods.firstWhere((m) => m.isDefault, orElse: () => methods.first);
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref.read(selectedPaymentMethodProvider.notifier).state = defaultMethod.code;
        });
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('إتمام الطلب')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _SectionCard(
                title: 'عنوان الشحن',
                trailing: TextButton(
                  onPressed: () => context.push('/addresses?select=true'),
                  child: const Text('تغيير'),
                ),
                child: addressesAsync.when(
                  data: (addresses) {
                    if (addresses.isEmpty) {
                      return OutlinedButton.icon(
                        onPressed: () => context.push('/addresses/add'),
                        icon: const Icon(Icons.add_location_alt_outlined),
                        label: const Text('إضافة عنوان شحن'),
                      );
                    }
                    final selected = addresses.firstWhere(
                      (a) => a.id == selectedAddressId,
                      orElse: () => addresses.first,
                    );
                    return Text(
                      '${selected.recipientName}\n${selected.emirate.labelAr}، ${selected.city}، ${selected.addressLine}',
                      style: const TextStyle(color: AppColors.textMuted, height: 1.5),
                    );
                  },
                  loading: () => const LinearProgressIndicator(),
                  error: (e, _) => Text('$e', style: const TextStyle(color: AppColors.error)),
                ),
              ),
              const SizedBox(height: 16),

              _SectionCard(
                title: 'طريقة الدفع',
                child: paymentMethodsAsync.when(
                  data: (methods) => Column(
                    children: methods
                        .map((m) => RadioListTile<String>(
                              contentPadding: EdgeInsets.zero,
                              value: m.code,
                              groupValue: selectedPayment,
                              title: Text(m.nameAr),
                              subtitle: m.code == 'cod' ? const Text('ادفع نقدًا عند استلام طلبك', style: TextStyle(fontSize: 12)) : null,
                              onChanged: (v) => ref.read(selectedPaymentMethodProvider.notifier).state = v,
                            ))
                        .toList(),
                  ),
                  loading: () => const LinearProgressIndicator(),
                  error: (e, _) => Text('$e', style: const TextStyle(color: AppColors.error)),
                ),
              ),
              const SizedBox(height: 16),

              _SectionCard(
                title: 'ملاحظات إضافية (اختياري)',
                child: TextField(
                  controller: _noteController,
                  maxLines: 2,
                  decoration: const InputDecoration(hintText: 'مثال: يرجى الاتصال قبل التوصيل'),
                ),
              ),
              const SizedBox(height: 16),

              cartAsync.when(
                data: (cart) => _SectionCard(
                  title: 'ملخص الطلب',
                  child: Column(
                    children: [
                      _summaryRow('المجموع الفرعي', '${cart.subtotal.toStringAsFixed(2)} AED'),
                      const SizedBox(height: 6),
                      const Text(
                        'سيتم إضافة الضريبة (VAT) ورسوم الشحن تلقائيًا عند تأكيد الطلب من الخادم',
                        style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                loading: () => const SizedBox(),
                error: (e, _) => const SizedBox(),
              ),

              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(_error!, style: const TextStyle(color: AppColors.error), textAlign: TextAlign.center),
              ],

              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _placing ? null : _placeOrder,
                child: _placing
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('تأكيد الطلب'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [Text(label, style: const TextStyle(color: AppColors.textMuted)), Text(value, style: const TextStyle(fontWeight: FontWeight.bold))],
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? trailing;

  const _SectionCard({required this.title, required this.child, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
              if (trailing != null) trailing!,
            ],
          ),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}
