import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/core_providers.dart';
import '../../data/models/cart_models.dart';
import '../../data/repositories/cart_repository.dart';

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  return CartRepository(ref.watch(apiClientProvider));
});

class CartNotifier extends StateNotifier<AsyncValue<CartModel>> {
  final CartRepository _repository;
  CartNotifier(this._repository) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final cart = await _repository.getCart();
      state = AsyncValue.data(cart);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addItem({required String productId, String? variantId, required int quantity}) async {
    final cart = await _repository.addItem(productId: productId, variantId: variantId, quantity: quantity);
    state = AsyncValue.data(cart);
  }

  Future<void> updateQuantity(String itemId, int quantity) async {
    final cart = await _repository.updateItemQuantity(itemId, quantity);
    state = AsyncValue.data(cart);
  }

  Future<void> removeItem(String itemId) async {
    final cart = await _repository.removeItem(itemId);
    state = AsyncValue.data(cart);
  }

  Future<void> clear() async {
    await _repository.clearCart();
    state = AsyncValue.data(CartModel.empty());
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, AsyncValue<CartModel>>((ref) {
  return CartNotifier(ref.watch(cartRepositoryProvider));
});

final cartItemCountProvider = Provider<int>((ref) {
  final cart = ref.watch(cartProvider).valueOrNull;
  if (cart == null) return 0;
  return cart.items.fold(0, (sum, item) => sum + item.quantity);
});
