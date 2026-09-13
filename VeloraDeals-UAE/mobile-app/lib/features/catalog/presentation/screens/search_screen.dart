import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/catalog_provider.dart';
import '../widgets/product_card.dart';

/// ملاحظة: Backend الحالي يوفر GET /products بدون معامل بحث نصي مخصص بعد (Search Endpoint منفصل
/// لم يُبنَ في هذه المرحلة). هذه الشاشة تجلب كل المنتجات المفعّلة وتفلترها محليًا بالاسم كحل عملي
/// إلى أن يُضاف /products?search= في Backend لاحقًا (تغيير Backend فقط، دون تعديل هذه الشاشة).
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider(null));

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          decoration: const InputDecoration(hintText: 'ابحث عن منتج...', border: InputBorder.none),
          onChanged: (v) => setState(() => _query = v.trim()),
        ),
      ),
      body: productsAsync.when(
        data: (products) {
          final filtered = _query.isEmpty
              ? <dynamic>[]
              : products.where((p) => p.nameAr.contains(_query) || p.nameEn.toLowerCase().contains(_query.toLowerCase())).toList();

          if (_query.isEmpty) {
            return const Center(child: Text('ابدأ الكتابة للبحث عن منتج'));
          }
          if (filtered.isEmpty) {
            return const Center(child: Text('لا توجد نتائج مطابقة'));
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filtered.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.62,
            ),
            itemBuilder: (_, i) => ProductCard(product: filtered[i]),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
