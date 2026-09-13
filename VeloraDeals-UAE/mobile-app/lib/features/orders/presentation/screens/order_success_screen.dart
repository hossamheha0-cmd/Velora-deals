import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/orders_provider.dart';

class OrderSuccessScreen extends ConsumerWidget {
  final String orderId;
  const OrderSuccessScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: orderAsync.when(
            data: (order) => Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle, color: AppColors.success, size: 80),
                const SizedBox(height: 20),
                Text('تم استلام طلبك بنجاح!', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('رقم الطلب: ${order.orderNumber}', style: const TextStyle(color: AppColors.textMuted)),
                const SizedBox(height: 4),
                const Text(
                  'طلبك الآن قيد المراجعة (Pending) وسيتواصل معك فريقنا لتأكيده قبل التجهيز والشحن.\nالدفع سيكون نقدًا عند الاستلام.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textMuted, height: 1.6),
                ),
                const SizedBox(height: 8),
                Text('${order.finalTotal.toStringAsFixed(2)} AED', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary)),
                const SizedBox(height: 32),
                ElevatedButton(
                  onPressed: () => context.go('/orders/${order.id}'),
                  child: const Text('عرض تفاصيل الطلب'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => context.go('/home'),
                  child: const Text('متابعة التسوق'),
                ),
              ],
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('$e')),
          ),
        ),
      ),
    );
  }
}
