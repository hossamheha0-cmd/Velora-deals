import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/core_providers.dart';
import '../../../../core/errors/api_exception.dart';
import '../../data/models/admin_models.dart';
import '../../data/repositories/admin_auth_repository.dart';

final adminAuthRepositoryProvider = Provider<AdminAuthRepository>((ref) {
  return AdminAuthRepository(ref.watch(apiClientProvider), ref.watch(secureStorageProvider));
});

enum AdminAuthStatus { unknown, authenticated, unauthenticated }

class AdminAuthState {
  final AdminAuthStatus status;
  final AdminProfile? admin;
  final String? errorMessage;
  final bool isLoading;

  const AdminAuthState({
    this.status = AdminAuthStatus.unknown,
    this.admin,
    this.errorMessage,
    this.isLoading = false,
  });

  AdminAuthState copyWith({AdminAuthStatus? status, AdminProfile? admin, String? errorMessage, bool? isLoading}) {
    return AdminAuthState(
      status: status ?? this.status,
      admin: admin ?? this.admin,
      errorMessage: errorMessage,
      isLoading: isLoading ?? false,
    );
  }
}

/// حالة منفصلة تمامًا عن AuthNotifier (جلسة العميل) - وجود admin نشط لا يُغيّر ولا يتأثر بحالة
/// تسجيل دخول العميل، والعكس صحيح. هذا هو أساس منع وصول العميل العادي لواجهات الأدمن.
class AdminAuthNotifier extends StateNotifier<AdminAuthState> {
  final AdminAuthRepository _repository;

  AdminAuthNotifier(this._repository) : super(const AdminAuthState()) {
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    final admin = await _repository.restoreSession();
    state = state.copyWith(
      status: admin != null ? AdminAuthStatus.authenticated : AdminAuthStatus.unauthenticated,
      admin: admin,
    );
  }

  Future<bool> login({required String email, required String password}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _repository.login(email: email, password: password);
      state = state.copyWith(status: AdminAuthStatus.authenticated, admin: result.admin, isLoading: false);
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.message);
      return false;
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AdminAuthState(status: AdminAuthStatus.unauthenticated);
  }
}

final adminAuthProvider = StateNotifierProvider<AdminAuthNotifier, AdminAuthState>((ref) {
  return AdminAuthNotifier(ref.watch(adminAuthRepositoryProvider));
});
