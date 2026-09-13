import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../models/auth_models.dart';

/// يغلّف كل نداءات الـAuth الحقيقية مقابل Backend (src/modules/auth/*).
/// يدعم الطريقتين المعتمدتين: Phone+OTP و Email+Password، وحفظ الجلسة بعد النجاح.
class AuthRepository {
  final ApiClient _api;
  final SecureStorageService _storage;

  AuthRepository(this._api, this._storage);

  Future<AuthTokens> registerWithEmail({
    required String email,
    required String password,
    String? fullName,
  }) async {
    final json = await _api.post(
      ApiPaths.register,
      body: {'email': email, 'password': password, if (fullName != null) 'fullName': fullName},
      requiresAuth: false,
    );
    final tokens = AuthTokens.fromJson(json);
    await _persistSession(tokens);
    return tokens;
  }

  Future<AuthTokens> loginWithEmail({required String email, required String password}) async {
    final json = await _api.post(
      ApiPaths.login,
      body: {'email': email, 'password': password},
      requiresAuth: false,
    );
    final tokens = AuthTokens.fromJson(json);
    await _persistSession(tokens);
    return tokens;
  }

  Future<int> requestOtp(String phoneNumber) async {
    final json = await _api.post(
      ApiPaths.otpRequest,
      body: {'phoneNumber': phoneNumber},
      requiresAuth: false,
    );
    return (json['expiresInSeconds'] as num?)?.toInt() ?? 300;
  }

  Future<AuthTokens> verifyOtp({required String phoneNumber, required String code}) async {
    final json = await _api.post(
      ApiPaths.otpVerify,
      body: {'phoneNumber': phoneNumber, 'code': code},
      requiresAuth: false,
    );
    final tokens = AuthTokens.fromJson(json);
    await _persistSession(tokens);
    return tokens;
  }

  Future<UserProfile> getCurrentUser() async {
    final json = await _api.get(ApiPaths.me);
    return UserProfile.fromJson(json);
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiPaths.logout);
    } finally {
      await _storage.clearSession();
    }
  }

  Future<void> _persistSession(AuthTokens tokens) async {
    await _storage.saveTokens(accessToken: tokens.accessToken, refreshToken: tokens.refreshToken);
    await _storage.saveUserId(tokens.userId);
  }
}
