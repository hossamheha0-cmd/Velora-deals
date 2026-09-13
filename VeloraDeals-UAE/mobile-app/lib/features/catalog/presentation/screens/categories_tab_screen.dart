import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/catalog_provider.dart';

class CategoriesTabScreen extends ConsumerWidget {
  const CategoriesTabScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الفئات')),
      body: categoriesAsync.when(
        data: (categories) => GridView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: categories.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.3),
          itemBuilder: (_, i) {
            final c = categories[i];
            return InkWell(
              onTap: () => context.push('/products?categoryId=${c.id}&title=${c.nameAr}'),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade100)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppColors.primary.withOpacity(0.08),
                      backgroundImage: c.imageUrl != null ? CachedNetworkImageProvider(c.imageUrl!) : null,
                      child: c.imageUrl == null ? const Icon(Icons.category_outlined, color: AppColors.primary) : null,
                    ),
                    const SizedBox(height: 8),
                    Text(c.nameAr, style: const TextStyle(fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            );
          },
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
    );
  }
}
