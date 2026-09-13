class CartItemModel {
  final String id;
  final String productId;
  final String? variantId;
  final String? productName;
  final String? image;
  final double unitPrice;
  final int quantity;
  final double lineTotal;

  CartItemModel({
    required this.id,
    required this.productId,
    this.variantId,
    this.productName,
    this.image,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) => CartItemModel(
        id: json['id'] as String,
        productId: json['productId'] as String,
        variantId: json['variantId'] as String?,
        productName: json['productName'] as String?,
        image: json['image'] as String?,
        unitPrice: double.parse(json['unitPrice'].toString()),
        quantity: json['quantity'] as int,
        lineTotal: double.parse(json['lineTotal'].toString()),
      );
}

class CartModel {
  final String cartId;
  final List<CartItemModel> items;
  final double subtotal;

  CartModel({required this.cartId, required this.items, required this.subtotal});

  factory CartModel.fromJson(Map<String, dynamic> json) => CartModel(
        cartId: json['cartId'] as String,
        items: (json['items'] as List? ?? [])
            .map((e) => CartItemModel.fromJson(e as Map<String, dynamic>))
            .toList(),
        subtotal: double.parse((json['subtotal'] ?? 0).toString()),
      );

  factory CartModel.empty() => CartModel(cartId: '', items: [], subtotal: 0);
}
