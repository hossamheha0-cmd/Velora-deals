import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/errors/api_exception.dart';
import '../../data/models/catalog_models.dart';
import '../providers/catalog_provider.dart';
import '../../../cart/presentation/providers/cart_provider.dart';
import '../../../wishlist/presentation/providers/wishlist_provider.dart';

class ProductDetailsScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductDetailsScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends ConsumerState<ProductDetailsScreen> {
  ProductVariant? _selectedVariant;
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));
    final isWishlisted = ref.watch(wishlistProvider).contains(widget.productId);

    return Scaffold(
      body: productAsync.when(
        data: (product) => _buildContent(context, product, isWishlisted),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
      bottomNavigationBar: productAsync.maybeWhen(
        data: (product) => ProductDetailsBottomBar(product: product, variant: _selectedVariant, quantity: _quantity),
        orElse: () => null,
      ),
    );
  }

  Widget _buildContent(BuildContext context, Product product, bool isWishlisted) {
    final activePrice = _selectedVariant?.price ?? product.basePrice;
    final activeStock = _selectedVariant?.stockQuantity ?? product.stockQuantity;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 340,
          pinned: true,
          actions: [
            IconButton(
              icon: Icon(isWishlisted ? Icons.favorite : Icons.favorite_border, color: isWishlisted ? AppColors.error : null),
              onPressed: () => ref.read(wishlistProvider.notifier).toggle(product.id),
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: product.images.isNotEmpty
                ? CarouselSlider(
                    options: CarouselOptions(height: 340, viewportFraction: 1),
                    items: product.images
                        .map((img) => CachedNetworkImage(imageUrl: img, fit: BoxFit.cover, width: double.infinity))
                        .toList(),
                  )
                : Container(color: Colors.grey.shade100, child: const Icon(Icons.shopping_bag_outlined, size: 64)),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.nameAr, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(children: [
                  Text('${activePrice.toStringAsFixed(2)} AED', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary)),
                  if (product.oldPrice != null) ...[
                    const SizedBox(width: 10),
                    Text('${product.oldPrice!.toStringAsFixed(2)} AED', style: const TextStyle(color: AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                  ],
                ]),
                const SizedBox(height: 4),
                Text(activeStock > 0 ? 'متوفر بالمخزون ($activeStock)' : 'نفدت الكمية', style: TextStyle(color: activeStock > 0 ? AppColors.success : AppColors.error, fontSize: 13)),

                if (product.variants.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  const Text('اختر النوع', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: product.variants.map((v) {
                      final selected = _selectedVariant?.id == v.id;
                      final label = [v.color, v.size].where((e) => e != null).join(' - ');
                      return ChoiceChip(
                        label: Text(label.isEmpty ? v.sku : label),
                        selected: selected,
                        onSelected: (_) => setState(() => _selectedVariant = v),
                      );
                    }).toList(),
                  ),
                ],

                const SizedBox(height: 20),
                const Text('الوصف', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text(product.descriptionAr ?? 'لا يوجد وصف متاح لهذا المنتج حاليًا', style: const TextStyle(color: AppColors.textMuted, height: 1.6)),

                const SizedBox(height: 20),
                Row(children: [
                  const Text('الكمية', style: TextStyle(fontWeight: FontWeight.bold)),
                  const Spacer(),
                  IconButton(icon: const Icon(Icons.remove_circle_outline), onPressed: () => setState(() => _quantity = (_quantity - 1).clamp(1, 99))),
                  Text('$_quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.add_circle_outline), onPressed: () => setState(() => _quantity = (_quantity + 1).clamp(1, 99))),
                ]),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class ProductDetailsBottomBar extends ConsumerWidget {
  final Product product;
  final ProductVariant? variant;
  final int quantity;

  const ProductDetailsBottomBar({super.key, required this.product, this.variant, required this.quantity});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: ElevatedButton.icon(
          icon: const Icon(Icons.add_shopping_cart),
          label: const Text('أضف إلى السلة'),
          onPressed: () async {
            try {
              await ref.read(cartProvider.notifier).addItem(productId: product.id, variantId: variant?.id, quantity: quantity);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تمت الإضافة إلى السلة')));
              }
            } on ApiException catch (e) {
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
              }
            }
          },
        ),
      ),
    );
  }
}
