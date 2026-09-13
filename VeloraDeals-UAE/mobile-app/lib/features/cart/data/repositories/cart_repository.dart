import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/cart_models.dart';

class CartRepository {
  final ApiClient _api;
  CartRepository(this._api);

  Future<CartModel> getCart() async {
    final json = await _api.get(ApiPaths.cart);
    return CartModel.fromJson(json);
  }

  Future<CartModel> addItem({required String productId, String? variantId, required int quantity}) async {
    final json = await _api.post(ApiPaths.cartItems, body: {
      'productId': productId,
      if (variantId != null) 'variantId': variantId,
      'quantity': quantity,
    });
    return CartModel.fromJson(json);
  }

  Future<CartModel> updateItemQuantity(String itemId, int quantity) async {
    final json = await _api.patch('${ApiPaths.cartItems}/$itemId', body: {'quantity': quantity});
    return CartModel.fromJson(json);
  }

  Future<CartModel> removeItem(String itemId) async {
    final json = await _api.delete('${ApiPaths.cartItems}/$itemId');
    return CartModel.fromJson(json);
  }

  Future<void> clearCart() async {
    await _api.delete(ApiPaths.cart);
  }
}
