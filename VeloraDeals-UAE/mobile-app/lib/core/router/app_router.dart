import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../widgets/main_shell.dart';
import '../../features/splash/presentation/screens/splash_screen.dart';
import '../../features/language/presentation/screens/language_selection_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/otp_request_screen.dart';
import '../../features/auth/presentation/screens/otp_verify_screen.dart';
import '../../features/admin/presentation/screens/admin_login_screen.dart';
import '../../features/admin/presentation/screens/admin_dashboard_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/catalog/presentation/screens/categories_tab_screen.dart';
import '../../features/catalog/presentation/screens/product_listing_screen.dart';
import '../../features/catalog/presentation/screens/product_details_screen.dart';
import '../../features/catalog/presentation/screens/search_screen.dart';
import '../../features/wishlist/presentation/screens/wishlist_screen.dart';
import '../../features/cart/presentation/screens/cart_screen.dart';
import '../../features/checkout/presentation/screens/checkout_screen.dart';
import '../../features/addresses/presentation/screens/addresses_screen.dart';
import '../../features/addresses/presentation/screens/add_address_screen.dart';
import '../../features/orders/presentation/screens/order_success_screen.dart';
import '../../features/orders/presentation/screens/orders_screen.dart';
import '../../features/orders/presentation/screens/order_details_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/settings/presentation/screens/app_settings_screen.dart';
import '../../features/support/presentation/screens/support_screen.dart';
import '../../features/support/presentation/screens/about_us_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/language-selection', builder: (_, __) => const LanguageSelectionScreen()),
      GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),

      // ---- Auth (بدون Bottom Nav) ----
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/otp-request', builder: (_, __) => const OtpRequestScreen()),
      GoRoute(
        path: '/otp-verify',
        builder: (context, state) => OtpVerifyScreen(phoneNumber: state.extra as String),
      ),

      // ---- Admin (منفصل تمامًا عن مسارات العميل - جلسة وتوكن مستقلان) ----
      GoRoute(path: '/admin-login', builder: (_, __) => const AdminLoginScreen()),
      GoRoute(path: '/admin-dashboard', builder: (_, __) => const AdminDashboardScreen()),

      // ---- Main Shell (Bottom Nav) ----
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
          GoRoute(path: '/categories-tab', builder: (_, __) => const CategoriesTabScreen()),
          GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
          GoRoute(path: '/profile-tab', builder: (_, __) => const ProfileScreen()),
        ],
      ),

      // ---- Catalog ----
      GoRoute(
        path: '/products',
        builder: (context, state) => ProductListingScreen(
          categoryId: state.uri.queryParameters['categoryId'],
          title: state.uri.queryParameters['title'] ?? 'المنتجات',
        ),
      ),
      GoRoute(
        path: '/product/:id',
        builder: (context, state) => ProductDetailsScreen(productId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),

      // ---- Cart & Checkout ----
      GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
      GoRoute(path: '/checkout', builder: (_, __) => const CheckoutScreen()),

      // ---- Addresses ----
      GoRoute(
        path: '/addresses',
        builder: (context, state) => AddressesScreen(selectMode: state.uri.queryParameters['select'] == 'true'),
      ),
      GoRoute(path: '/addresses/add', builder: (_, __) => const AddAddressScreen()),

      // ---- Orders ----
      GoRoute(
        path: '/order-success/:id',
        builder: (context, state) => OrderSuccessScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) => OrderDetailsScreen(orderId: state.pathParameters['id']!),
      ),

      // ---- Profile-related ----
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const AppSettingsScreen()),
      GoRoute(path: '/support', builder: (_, __) => const SupportScreen()),
      GoRoute(path: '/about', builder: (_, __) => const AboutUsScreen()),
    ],
  );
});
