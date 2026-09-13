import 'dart:convert';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../models/admin_models.dart';

/// يتحدث حصريًا مع /admin/auth/login و/admin/orders - مسارات الأدمن الفعلية في Backend.
/// لا علاقة له بجدول users أو AuthRepository الخاص بالعميل - عزل كامل عبر Backend نفسه
/// (جدول admin_users منفصل) وليس مجرد فصل شكلي في التطبيق.
class AdminAuthRepository {
  final ApiClient _api;
  final SecureStorageService _storage;

  AdminAuthRepository(this._api, this._storage);

  Future<AdminAuthResult> login({required String email, required String password}) async {
    final json = await _api.post(
      ApiPaths.adminLogin,
      body: {'email': email, 'password': password},
      requiresAuth: false,
    );
    final result = AdminAuthResult.fromJson(json);
    await _storage.saveAdminSession(
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      adminInfoJson: jsonEncode(result.admin.toJson()),
    );
    return result;
  }

  Future<AdminProfile?> restoreSession() async {
    final hasSession = await _storage.hasAdminSession();
    if (!hasSession) return null;
    final infoJson = await _storage.getAdminInfoJson();
    if (infoJson == null) return null;
    try {
      return AdminProfile.fromJson(jsonDecode(infoJson) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    // لا يوجد /admin/auth/logout في الـBackend حاليًا (تصميم الأدمن أبسط عمدًا من العميل) -
    // تسجيل الخروج هنا هو مسح الجلسة المحلية فقط، وهو كافٍ لأن التوكن سينتهي أصلًا خلال دقائق.
    await _storage.clearAdminSession();
  }

  /// مثال حقيقي على استخدام useAdminToken لجلب بيانات فعلية من لوحة الأدمن (وليس Placeholder)
  Future<List<Map<String, dynamic>>> getOrders() async {
    final json = await _api.get(ApiPaths.adminOrders, useAdminToken: true);
    final items = json['items'] as List? ?? [];
    return items.cast<Map<String, dynamic>>();
  }
}
