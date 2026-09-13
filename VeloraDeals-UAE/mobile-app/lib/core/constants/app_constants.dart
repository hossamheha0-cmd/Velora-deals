import 'package:flutter_dotenv/flutter_dotenv.dart';

/// كل القيم الثابتة على مستوى التطبيق. لا تحتوي على أي بيانات تواصل أو محتوى تجاري -
/// هذه تُجلب من Backend Settings (انظر SettingsRepository) بحيث يتحكم فيها الـSuper Admin.
class AppConstants {
  AppConstants._();

      String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'https://veloradeals-application.onrender.com/api/v1';
      

  static const String appName = 'VeloraDeals UAE';
  static const String defaultCurrency = 'AED';
  static const String defaultLanguageCode = 'en';
  static const List<String> supportedLanguageCodes = ['ar', 'en'];

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 20);
}

/// مفاتيح التخزين الآمن/المحلي - في مكان واحد لتفادي التكرار أو الأخطاء الإملائية
class StorageKeys {
  StorageKeys._();

  static const String accessToken = 'velora_access_token';
  static const String refreshToken = 'velora_refresh_token';
  static const String userId = 'velora_user_id';
  static const String preferredLanguage = 'velora_preferred_language';
  static const String hasSeenOnboarding = 'velora_has_seen_onboarding';
  static const String hasSelectedLanguage = 'velora_has_selected_language';

  // مفاتيح منفصلة تمامًا لجلسة الأدمن - تخزين مختلف عن جلسة العميل، بحيث وجود Session
  // عميل نشطة لا يعني أبدًا وجود صلاحيات أدمن، والعكس صحيح. لا يشترك الجلستان في أي مفتاح.
  static const String adminAccessToken = 'velora_admin_access_token';
  static const String adminRefreshToken = 'velora_admin_refresh_token';
  static const String adminInfo = 'velora_admin_info';
}

/// مسارات الـAPI - مطابقة 1:1 لما تم تنفيذه فعليًا في Backend (src/modules/*/*.controller.ts)
class ApiPaths {
  ApiPaths._();

  // Auth
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String otpRequest = '/auth/otp/request';
  static const String otpVerify = '/auth/otp/verify';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';

  // Admin Auth - مسار منفصل تمامًا، يتحقق من جدول admin_users وليس users
  static const String adminLogin = '/admin/auth/login';
  static const String adminOrders = '/admin/orders';

  // Users
  static const String me = '/users/me';

  // Addresses
  static const String addresses = '/addresses';

  // Catalog
  static const String categories = '/categories';
  static const String products = '/products';

  // Cart
  static const String cart = '/cart';
  static const String cartItems = '/cart/items';

  // Orders
  static const String orders = '/orders';

  // Payment methods
  static const String paymentMethods = '/payment-methods';

  // Public settings (contact info, social links, currency) - يُضاف Endpoint عام للقراءة فقط
  static const String publicSettings = '/settings/public';

  // Notifications
  static const String notifications = '/notifications';
}
