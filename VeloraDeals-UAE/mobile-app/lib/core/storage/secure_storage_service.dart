import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/app_constants.dart';

/// تخزين آمن للتوكنات (Keychain على iOS، EncryptedSharedPreferences على Android)
/// لا يُخزَّن أي Secret أو API Key هنا - فقط توكنات جلسة المستخدم الحالي.
class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
  }

  Future<String?> getAccessToken() => _storage.read(key: StorageKeys.accessToken);
  Future<String?> getRefreshToken() => _storage.read(key: StorageKeys.refreshToken);

  Future<void> saveUserId(String userId) => _storage.write(key: StorageKeys.userId, value: userId);
  Future<String?> getUserId() => _storage.read(key: StorageKeys.userId);

  Future<void> clearSession() async {
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);
    await _storage.delete(key: StorageKeys.userId);
  }

  Future<bool> hasSession() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  // ================= جلسة الأدمن - منفصلة تمامًا عن جلسة العميل أعلاه =================
  // مفاتيح تخزين مختلفة بالكامل (StorageKeys.adminAccessToken...) بحيث لا يوجد أي تداخل
  // بين الجلستين. تسجيل خروج العميل لا يمس جلسة الأدمن، والعكس صحيح.

  Future<void> saveAdminSession({
    required String accessToken,
    required String refreshToken,
    required String adminInfoJson,
  }) async {
    await _storage.write(key: StorageKeys.adminAccessToken, value: accessToken);
    await _storage.write(key: StorageKeys.adminRefreshToken, value: refreshToken);
    await _storage.write(key: StorageKeys.adminInfo, value: adminInfoJson);
  }

  Future<String?> getAdminAccessToken() => _storage.read(key: StorageKeys.adminAccessToken);
  Future<String?> getAdminInfoJson() => _storage.read(key: StorageKeys.adminInfo);

  Future<void> clearAdminSession() async {
    await _storage.delete(key: StorageKeys.adminAccessToken);
    await _storage.delete(key: StorageKeys.adminRefreshToken);
    await _storage.delete(key: StorageKeys.adminInfo);
  }

  Future<bool> hasAdminSession() async {
    final token = await getAdminAccessToken();
    return token != null && token.isNotEmpty;
  }
}
