class Category {
  final String id;
  final String nameAr;
  final String nameEn;
  final String slug;
  final String? imageUrl;
  final bool enabled;

  Category({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.slug,
    this.imageUrl,
    required this.enabled,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as String,
        nameAr: json['nameAr'] as String,
        nameEn: json['nameEn'] as String,
        slug: json['slug'] as String,
        imageUrl: json['imageUrl'] as String?,
        enabled: json['enabled'] as bool? ?? true,
      );
}

class ProductVariant {
  final String id;
  final String sku;
  final String? color;
  final String? size;
  final double price;
  final int stockQuantity;

  ProductVariant({
    required this.id,
    required this.sku,
    this.color,
    this.size,
    required this.price,
    required this.stockQuantity,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) => ProductVariant(
        id: json['id'] as String,
        sku: json['sku'] as String,
        color: json['color'] as String?,
        size: json['size'] as String?,
        price: double.parse(json['price'].toString()),
        stockQuantity: json['stockQuantity'] as int? ?? 0,
      );
}

class Product {
  final String id;
  final String nameAr;
  final String nameEn;
  final String slug;
  final String? descriptionAr;
  final String? descriptionEn;
  final List<String> images;
  final String categoryId;
  final double basePrice;
  final double? oldPrice;
  final String sku;
  final int stockQuantity;
  final bool enabled;
  final List<ProductVariant> variants;

  Product({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.slug,
    this.descriptionAr,
    this.descriptionEn,
    required this.images,
    required this.categoryId,
    required this.basePrice,
    this.oldPrice,
    required this.sku,
    required this.stockQuantity,
    required this.enabled,
    this.variants = const [],
  });

  bool get inStock => stockQuantity > 0;
  double? get discountPercent {
    if (oldPrice == null || oldPrice! <= basePrice) return null;
    return ((oldPrice! - basePrice) / oldPrice! * 100).roundToDouble();
  }

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as String,
        nameAr: json['nameAr'] as String,
        nameEn: json['nameEn'] as String,
        slug: json['slug'] as String,
        descriptionAr: json['descriptionAr'] as String?,
        descriptionEn: json['descriptionEn'] as String?,
        images: (json['images'] as List?)?.map((e) => e.toString()).toList() ?? [],
        categoryId: json['categoryId'] as String,
        basePrice: double.parse(json['basePrice'].toString()),
        oldPrice: json['oldPrice'] != null ? double.parse(json['oldPrice'].toString()) : null,
        sku: json['sku'] as String,
        stockQuantity: json['stockQuantity'] as int? ?? 0,
        enabled: json['enabled'] as bool? ?? true,
        variants: (json['variants'] as List?)
                ?.map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [],
      );
}
