import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/addresses_provider.dart';

class AddressesScreen extends ConsumerWidget {
  final bool selectMode; // true عند فتح الشاشة من Checkout لاختيار عنوان
  const AddressesScreen({super.key, this.selectMode = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addressesAsync = ref.watch(addressesProvider);
    final selectedId = ref.watch(selectedAddressIdProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('عناوين الشحن')),
      body: addressesAsync.when(
        data: (addresses) {
          if (addresses.isEmpty) {
            return const Center(child: Text('لا توجد عناوين محفوظة، أضف عنوانًا جديدًا'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: addresses.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) {
              final a = addresses[i];
              final selected = selectMode && selectedId == a.id;
              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: selected ? AppColors.primary : Colors.grey.shade200, width: selected ? 1.5 : 1),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [
                            Text(a.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                            if (a.isDefault) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                child: const Text('افتراضي', style: TextStyle(fontSize: 10, color: AppColors.primary)),
                              ),
                            ],
                          ]),
                          const SizedBox(height: 4),
                          Text('${a.recipientName} · ${a.recipientPhone}', style: const TextStyle(fontSize: 13)),
                          Text('${a.emirate.labelAr}، ${a.city}، ${a.addressLine}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
                    if (selectMode)
                      Radio<String>(
                        value: a.id,
                        groupValue: selectedId,
                        onChanged: (v) {
                          ref.read(selectedAddressIdProvider.notifier).state = v;
                          context.pop();
                        },
                      )
                    else
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: AppColors.error),
                        onPressed: () => ref.read(addressesProvider.notifier).deleteAddress(a.id),
                      ),
                  ],
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/addresses/add'),
        icon: const Icon(Icons.add),
        label: const Text('عنوان جديد'),
      ),
    );
  }
}
