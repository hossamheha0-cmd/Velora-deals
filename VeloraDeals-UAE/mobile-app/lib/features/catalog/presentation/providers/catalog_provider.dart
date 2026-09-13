import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/core_providers.dart';
import '../../data/models/catalog_models.dart';
import '../../data/repositories/catalog_repository.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  return CatalogRepository(ref.watch(apiClientProvider));
});

final categoriesProvider = FutureProvider<List<Category>>((ref) {
  return ref.watch(catalogRepositoryProvider).getCategories();
});

final productsProvider = FutureProvider.family<List<Product>, String?>((ref, categoryId) {
  return ref.watch(catalogRepositoryProvider).getProducts(categoryId: categoryId);
});

final productDetailProvider = FutureProvider.family<Product, String>((ref, productId) {
  return ref.watch(catalogRepositoryProvider).getProductById(productId);
});

/// حالة البحث الحالية في شريط البحث (نص فقط - الفلترة الفعلية تتم في CatalogSearchDelegate)
final searchQueryProvider = StateProvider<String>((ref) => '');
