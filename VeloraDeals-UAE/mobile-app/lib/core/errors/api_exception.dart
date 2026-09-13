/// يمثّل شكل الخطأ الموحّد القادم من Backend: { success:false, error: { message, statusCode, ... } }
/// (انظر src/common/filters/http-exception.filter.ts في الـBackend)
class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isValidationError => statusCode == 400;
  bool get isServerError => statusCode != null && statusCode! >= 500;
  bool get isNetworkError => statusCode == null;

  @override
  String toString() => message;
}
