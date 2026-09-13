import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/public_store_settings.dart';

class SettingsRepository {
  final ApiClient _api;
  SettingsRepository(this._api);

  /// GET /settings/public - بدون توثيق، يرجّع فقط المفاتيح الآمنة للعرض العام
  Future<PublicStoreSettings> getPublicSettings() async {
    final json = await _api.get(ApiPaths.publicSettings);
    return PublicStoreSettings.fromJson(json);
  }
}
