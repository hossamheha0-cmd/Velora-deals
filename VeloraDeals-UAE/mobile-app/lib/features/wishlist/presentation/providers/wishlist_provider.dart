import 'package:flutter_riverpod/flutter_riverpod.dart';

/// ملاحظة صريحة: Backend الحالي لا يتضمن بعد Endpoints مخصصة لـWishlist (لم تُبنَ في مرحلة الـBackend).
/// هذا الـProvider يدير حالة محلية مؤقتة فقط (In-memory) لتفعيل تجربة المستخدم في الواجهة.
/// عند بناء /wishlist API في Backend لاحقًا، يُستبدل هذا الـNotifier بواحد يستدعي API حقيقي
/// بنفس الطريقة المتبعة في CartRepository، دون تغيير واجهة الاستخدام في الشاشات.
class WishlistNotifier extends StateNotifier<Set<String>> {
  WishlistNotifier() : super({});

  void toggle(String productId) {
    if (state.contains(productId)) {
      state = {...state}..remove(productId);
    } else {
      state = {...state, productId};
    }
  }

  bool contains(String productId) => state.contains(productId);
}

final wishlistProvider = StateNotifierProvider<WishlistNotifier, Set<String>>((ref) {
  return WishlistNotifier();
});
