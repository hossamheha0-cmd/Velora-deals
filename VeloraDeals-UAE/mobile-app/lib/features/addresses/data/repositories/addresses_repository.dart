import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/address_model.dart';

class AddressesRepository {
  final ApiClient _api;
  AddressesRepository(this._api);

  Future<List<AddressModel>> getAll() async {
    final json = await _api.get(ApiPaths.addresses);
    final items = json['items'] as List? ?? [];
    return items.map((e) => AddressModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<AddressModel> create({
    required String label,
    required String recipientName,
    required String recipientPhone,
    required Emirate emirate,
    required String city,
    required String addressLine,
    String? addressLine2,
    bool isDefault = false,
  }) async {
    final json = await _api.post(ApiPaths.addresses, body: {
      'label': label,
      'recipientName': recipientName,
      'recipientPhone': recipientPhone,
      'emirate': emirate.value,
      'city': city,
      'addressLine': addressLine,
      if (addressLine2 != null) 'addressLine2': addressLine2,
      'isDefault': isDefault,
    });
    return AddressModel.fromJson(json);
  }

  Future<void> delete(String id) async {
    await _api.delete('${ApiPaths.addresses}/$id');
  }
}
