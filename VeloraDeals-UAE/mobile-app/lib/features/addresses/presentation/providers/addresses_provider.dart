import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/core_providers.dart';
import '../../data/models/address_model.dart';
import '../../data/repositories/addresses_repository.dart';

final addressesRepositoryProvider = Provider<AddressesRepository>((ref) {
  return AddressesRepository(ref.watch(apiClientProvider));
});

class AddressesNotifier extends StateNotifier<AsyncValue<List<AddressModel>>> {
  final AddressesRepository _repository;
  AddressesNotifier(this._repository) : super(const AsyncValue.loading()) {
    load();
  }

  Future<void> load() async {
    state = const AsyncValue.loading();
    try {
      final addresses = await _repository.getAll();
      state = AsyncValue.data(addresses);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addAddress({
    required String label,
    required String recipientName,
    required String recipientPhone,
    required Emirate emirate,
    required String city,
    required String addressLine,
    String? addressLine2,
    bool isDefault = false,
  }) async {
    await _repository.create(
      label: label,
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      emirate: emirate,
      city: city,
      addressLine: addressLine,
      addressLine2: addressLine2,
      isDefault: isDefault,
    );
    await load();
  }

  Future<void> deleteAddress(String id) async {
    await _repository.delete(id);
    await load();
  }
}

final addressesProvider = StateNotifierProvider<AddressesNotifier, AsyncValue<List<AddressModel>>>((ref) {
  return AddressesNotifier(ref.watch(addressesRepositoryProvider));
});

/// العنوان المختار حاليًا في Checkout
final selectedAddressIdProvider = StateProvider<String?>((ref) => null);
