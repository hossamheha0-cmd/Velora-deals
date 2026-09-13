import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../data/models/order_model.dart';
import '../providers/orders_provider.dart';

class OrderDetailsScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderDetailProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل الطلب')),
      body: orderAsync.when(
        data: (order) => _buildBody(context, ref, order),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, OrderModel order) {
    final canCancel = order.status == OrderStatus.pending || order.status == OrderStatus.confirmed;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(order.orderNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                    child: Text(order.status.labelAr, style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
              if (order.trackingNumber != null) ...[
                const SizedBox(height: 10),
                Text('رقم التتبع: ${order.trackingNumber}${order.shippingCarrierName != null ? ' (${order.shippingCarrierName})' : ''}', style: const TextStyle(fontSize: 13, color: AppColors.textMuted)),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        const Text('المنتجات', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ...order.items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade100)),
                child: Row(
                  children: [
                    Expanded(child: Text(item.productNameSnapshot)),
                    Text('${item.quantity} × ${item.unitPriceSnapshot.toStringAsFixed(2)}'),
                  ],
                ),
              ),
            )),

        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
          child: Column(
            children: [
              _row('المجموع الفرعي', order.subtotal),
              _row('الخصم', -order.discountAmount),
              _row('ضريبة القيمة المضافة (${order.vatRate.toStringAsFixed(0)}%)', order.vatAmount),
              _row('رسوم الشحن', order.shippingFee),
              const Divider(height: 20),
              _row('الإجمالي النهائي', order.finalTotal, bold: true),
            ],
          ),
        ),

        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('طريقة الدفع', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text(order.paymentMethodCode == 'cod' ? 'الدفع عند الاستلام (COD)' : order.paymentMethodCode.toUpperCase()),
            ],
          ),
        ),

        if (canCancel) ...[
          const SizedBox(height: 20),
          OutlinedButton(
            style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error)),
            onPressed: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('إلغاء الطلب'),
                  content: const Text('هل أنت متأكد من إلغاء هذا الطلب؟'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('تراجع')),
                    TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('نعم، إلغاء')),
                  ],
                ),
              );
              if (confirmed == true) {
                await ref.read(ordersRepositoryProvider).cancelOrder(order.id);
                ref.invalidate(orderDetailProvider(order.id));
              }
            },
            child: const Text('إلغاء الطلب'),
          ),
        ],
      ],
    );
  }

  Widget _row(String label, double value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: bold ? AppColors.textOnLight : AppColors.textMuted, fontWeight: bold ? FontWeight.bold : FontWeight.normal)),
          Text('${value.toStringAsFixed(2)} AED', style: TextStyle(fontWeight: bold ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }
}
