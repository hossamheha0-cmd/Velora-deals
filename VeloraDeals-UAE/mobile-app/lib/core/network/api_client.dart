import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';
import '../constants/app_constants.dart';
import '../errors/api_exception.dart';
import '../storage/secure_storage_service.dart';

/// عميل API موحّد لكل نداءات الـBackend. يتعامل تلقائيًا مع:
/// - إرفاق Bearer Token في كل طلب محمي
/// - إعادة تجديد الـAccess Token تلقائيًا عبر Refresh Token عند 401 (مرة واحدة فقط لتفادي حلقة لا نهائية)
/// - فك تغليف شكل الاستجابة الموحّد { success, data, error } القادم من Backend
class ApiClient {
  final Dio _dio;
  final SecureStorageService _storage;
  bool _isRefreshing = false;

  ApiClient({SecureStorageService? storage})
      : _storage = storage ?? SecureStorageService(),
        _dio = Dio(
          BaseOptions(
            baseUrl: AppConstants.apiBaseUrl,
            connectTimeout: AppConstants.connectTimeout,
            receiveTimeout: AppConstants.receiveTimeout,
            headers: {'Content-Type': 'application/json'},
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final useAdminToken = options.extra['useAdminToken'] == true;
          if (useAdminToken) {
            // طلبات الأدمن تستخدم حصريًا توكن جلسة الأدمن المنفصلة - لا يُخلَط أبدًا بتوكن العميل
            final adminToken = await _storage.getAdminAccessToken();
            if (adminToken != null) {
              options.headers['Authorization'] = 'Bearer $adminToken';
            }
          } else if (options.extra['requiresAuth'] != false) {
            final token = await _storage.getAccessToken();
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final isUnauthorized = error.response?.statusCode == 401;
          final isRefreshCall = error.requestOptions.path.contains('/auth/refresh');
          final isAdminRequest = error.requestOptions.extra['useAdminToken'] == true;

          // جلسة الأدمن ليس لها Refresh Token Endpoint في الـBackend (Admin Auth أبسط عمدًا) -
          // عند 401 على طلب أدمن، الجلسة تُعتبر منتهية مباشرة بدلًا من محاولة تجديد غير موجود.
          if (isUnauthorized && isAdminRequest) {
            await _storage.clearAdminSession();
            handler.next(error);
            return;
          }

          if (isUnauthorized && !isRefreshCall && !isAdminRequest && !_isRefreshing) {
            _isRefreshing = true;
            try {
              final refreshed = await _tryRefreshToken();
              _isRefreshing = false;
              if (refreshed != null) {
                final retryOptions = error.requestOptions;
                retryOptions.headers['Authorization'] = 'Bearer $refreshed';
                final response = await _dio.fetch(retryOptions);
                return handler.resolve(response);
              }
            } catch (_) {
              _isRefreshing = false;
            }
            // فشل التجديد -> الجلسة منتهية فعليًا، على واجهة المستخدم توجيه العميل لتسجيل الدخول
            await _storage.clearSession();
          }
          handler.next(error);
        },
      ),
    );

    _dio.interceptors.add(
      PrettyDioLogger(requestBody: true, responseBody: true, error: true),
    );
  }

  Future<String?> _tryRefreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null) return null;

    final response = await _dio.post(
      ApiPaths.refresh,
      data: {'refreshToken': refreshToken},
      options: Options(extra: {'requiresAuth': false}),
    );
    final data = response.data['data'];
    final newAccess = data['accessToken'] as String;
    final newRefresh = data['refreshToken'] as String;
    await _storage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);
    return newAccess;
  }

  Future<Map<String, dynamic>> get(String path, {Map<String, dynamic>? query, bool useAdminToken = false}) async {
    final res = await _request(
      () => _dio.get(path, queryParameters: query, options: Options(extra: {'useAdminToken': useAdminToken})),
    );
    return res;
  }

  Future<Map<String, dynamic>> post(String path, {Object? body, bool requiresAuth = true, bool useAdminToken = false}) async {
    final res = await _request(
      () => _dio.post(path, data: body, options: Options(extra: {'requiresAuth': requiresAuth, 'useAdminToken': useAdminToken})),
    );
    return res;
  }

  Future<Map<String, dynamic>> patch(String path, {Object? body, bool useAdminToken = false}) async {
    final res = await _request(
      () => _dio.patch(path, data: body, options: Options(extra: {'useAdminToken': useAdminToken})),
    );
    return res;
  }

  Future<Map<String, dynamic>> put(String path, {Object? body, bool useAdminToken = false}) async {
    final res = await _request(
      () => _dio.put(path, data: body, options: Options(extra: {'useAdminToken': useAdminToken})),
    );
    return res;
  }

  Future<Map<String, dynamic>> delete(String path, {bool useAdminToken = false}) async {
    final res = await _request(
      () => _dio.delete(path, options: Options(extra: {'useAdminToken': useAdminToken})),
    );
    return res;
  }

  /// ترجع دائمًا القيمة الفعلية لحقل "data" من استجابة Backend (وليس Map فارغ لأي نوع فشل بصمت)
  Future<Map<String, dynamic>> _request(Future<Response> Function() call) async {
    try {
      final response = await call();
      final body = response.data;
      if (body is Map<String, dynamic>) {
        final data = body['data'];
        if (data is Map<String, dynamic>) return data;
        if (data is List) return {'items': data}; // يُعاد تفكيكه في الـRepository حسب النوع
        return {'value': data};
      }
      return {};
    } on DioException catch (e) {
      final backendMessage = e.response?.data is Map
          ? (e.response?.data['error']?['message'] as String?)
          : null;
      throw ApiException(
        backendMessage ?? _fallbackMessage(e),
        statusCode: e.response?.statusCode,
      );
    }
  }

  String _fallbackMessage(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'انتهت مهلة الاتصال، تحقق من الإنترنت وحاول مرة أخرى';
      case DioExceptionType.connectionError:
        return 'تعذر الاتصال بالخادم، تحقق من اتصال الإنترنت';
      default:
        return 'حدث خطأ غير متوقع، برجاء المحاولة لاحقًا';
    }
  }
}
