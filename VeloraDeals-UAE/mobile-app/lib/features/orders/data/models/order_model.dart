class OrderItemModel {
  final String id;
  final String productId;
  final String productNameSnapshot;
  final String skuSnapshot;
  final double unitPriceSnapshot;
  final int quantity;
  final double lineTotal;

  OrderItemModel({
    required this.id,
    required this.productId,
    required this.productNameSnapshot,
    required this.skuSnapshot,
    required this.unitPriceSnapshot,
    required this.quantity,
    required this.lineTotal,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) => OrderItemModel(
        id: json['id'] as String,
        productId: json['productId'] as String,
        productNameSnapshot: json['productNameSnapshot'] as String,
        skuSnapshot: json['skuSnapshot'] as String,
        unitPriceSnapshot: double.parse(json['unitPriceSnapshot'].toString()),
        quantity: json['quantity'] as int,
        lineTotal: double.parse(json['lineTotal'].toString()),
      );
}

/// نفس تسلسل حالات الطلب المعتمد في Architecture: pending -> confirmed -> processing ->
/// packed -> shipped -> out_for_delivery -> delivered (أو cancelled / returned / refunded)
enum OrderStatus {
  pending, confirmed, processing, packed, shipped, outForDelivery, delivered, cancelled, returned, refunded;

  static OrderStatus fromValue(String value) {
    switch (value) {
      case 'pending': return OrderStatus.pending;
      case 'confirmed': return OrderStatus.confirmed;
      case 'processing': return OrderStatus.processing;
      case 'packed': return OrderStatus.packed;
      case 'shipped': return OrderStatus.shipped;
      case 'out_for_delivery': return OrderStatus.outForDelivery;
      case 'delivered': return OrderStatus.delivered;
      case 'cancelled': return OrderStatus.cancelled;
      case 'returned': return OrderStatus.returned;
      case 'refunded': return OrderStatus.refunded;
      default: return OrderStatus.pending;
    }
  }

  String get labelAr {
    switch (this) {
      case OrderStatus.pending: return 'قيد المراجعة';
      case OrderStatus.confirmed: return 'مؤكد';
      case OrderStatus.processing: return 'قيد التجهيز';
      case OrderStatus.packed: return 'تم التغليف';
      case OrderStatus.shipped: return 'تم الشحن';
      case OrderStatus.outForDelivery: return 'خارج للتوصيل';
      case OrderStatus.delivered: return 'تم التسليم';
      case OrderStatus.cancelled: return 'ملغي';
      case OrderStatus.returned: return 'مرتجع';
      case OrderStatus.refunded: return 'مسترد';
    }
  }
}

class OrderModel {
  final String id;
  final String orderNumber;
  final double subtotal;
  final double discountAmount;
  final double vatRate;
  final double vatAmount;
  final double shippingFee;
  final double finalTotal;
  final String currency;
  final String paymentMethodCode;
  final String paymentStatus;
  final OrderStatus status;
  final String? trackingNumber;
  final String? shippingCarrierName;
  final DateTime createdAt;
  final List<OrderItemModel> items;

  OrderModel({
    required this.id,
    required this.orderNumber,
    required this.subtotal,
    required this.discountAmount,
    required this.vatRate,
    required this.vatAmount,
    required this.shippingFee,
    required this.finalTotal,
    required this.currency,
    required this.paymentMethodCode,
    required this.paymentStatus,
    required this.status,
    this.trackingNumber,
    this.shippingCarrierName,
    required this.createdAt,
    required this.items,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) => OrderModel(
        id: json['id'] as String,
        orderNumber: json['orderNumber'] as String,
        subtotal: double.parse(json['subtotal'].toString()),
        discountAmount: double.parse((json['discountAmount'] ?? 0).toString()),
        vatRate: double.parse((json['vatRate'] ?? 0).toString()),
        vatAmount: double.parse((json['vatAmount'] ?? 0).toString()),
        shippingFee: double.parse((json['shippingFee'] ?? 0).toString()),
        finalTotal: double.parse(json['finalTotal'].toString()),
        currency: json['currency'] as String? ?? 'AED',
        paymentMethodCode: json['paymentMethodCode'] as String,
        paymentStatus: json['paymentStatus'] as String,
        status: OrderStatus.fromValue(json['status'] as String),
        trackingNumber: json['trackingNumber'] as String?,
        shippingCarrierName: json['shippingCarrierName'] as String?,
        createdAt: DateTime.parse(json['createdAt'] as String),
        items: (json['items'] as List? ?? [])
            .map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}
