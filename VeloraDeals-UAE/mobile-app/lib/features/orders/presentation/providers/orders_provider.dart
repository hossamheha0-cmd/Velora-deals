import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/core_providers.dart';
import '../../data/models/order_model.dart';
import '../../data/repositories/orders_repository.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.watch(apiClientProvider));
});

final myOrdersProvider = FutureProvider.autoDispose<List<OrderModel>>((ref) {
  return ref.watch(ordersRepositoryProvider).getMyOrders();
});

final orderDetailProvider = FutureProvider.family.autoDispose<OrderModel, String>((ref, orderId) {
  return ref.watch(ordersRepositoryProvider).getOrderById(orderId);
});
