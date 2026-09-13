import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/order_model.dart';

class OrdersRepository {
  final ApiClient _api;
  OrdersRepository(this._api);

  /// إنشاء طلب فعلي - Backend هو المصدر الوحيد لحساب السعر/الضريبة/الشحن (لا شيء يُرسَل من التطبيق)
  Future<OrderModel> createOrder({required String shippingAddressId, required String paymentMethodCode, String? customerNote}) async {
    final json = await _api.post(ApiPaths.orders, body: {
      'shippingAddressId': shippingAddressId,
      'paymentMethodCode': paymentMethodCode,
      if (customerNote != null && customerNote.isNotEmpty) 'customerNote': customerNote,
    });
    return OrderModel.fromJson(json);
  }

  Future<List<OrderModel>> getMyOrders() async {
    final json = await _api.get(ApiPaths.orders);
    final items = json['items'] as List? ?? [];
    return items.map((e) => OrderModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<OrderModel> getOrderById(String id) async {
    final json = await _api.get('${ApiPaths.orders}/$id');
    return OrderModel.fromJson(json);
  }

  Future<OrderModel> cancelOrder(String id) async {
    final json = await _api.patch('${ApiPaths.orders}/$id/cancel');
    return OrderModel.fromJson(json);
  }
}
