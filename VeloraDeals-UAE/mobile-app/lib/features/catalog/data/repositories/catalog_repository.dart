import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/catalog_models.dart';

class CatalogRepository {
  final ApiClient _api;
  CatalogRepository(this._api);

  Future<List<Category>> getCategories() async {
    final json = await _api.get(ApiPaths.categories);
    final items = json['items'] as List? ?? [];
    return items.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Product>> getProducts({String? categoryId}) async {
    final json = await _api.get(
      ApiPaths.products,
      query: categoryId != null ? {'categoryId': categoryId} : null,
    );
    final items = json['items'] as List? ?? [];
    return items.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Product> getProductById(String id) async {
    final json = await _api.get('${ApiPaths.products}/$id');
    return Product.fromJson(json);
  }
}
