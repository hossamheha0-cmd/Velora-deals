/// يمثّل استجابة تسجيل الدخول/التسجيل - مطابق لما يرجعه AuthService في Backend
class AuthTokens {
  final String accessToken;
  final String refreshToken;
  final String userId;

  AuthTokens({required this.accessToken, required this.refreshToken, required this.userId});

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      userId: json['userId'] as String,
    );
  }
}

class UserProfile {
  final String id;
  final String? phoneNumber;
  final bool phoneVerified;
  final String? email;
  final bool emailVerified;
  final String? fullName;
  final String preferredLanguage;

  UserProfile({
    required this.id,
    this.phoneNumber,
    required this.phoneVerified,
    this.email,
    required this.emailVerified,
    this.fullName,
    required this.preferredLanguage,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      phoneNumber: json['phoneNumber'] as String?,
      phoneVerified: json['phoneVerified'] as bool? ?? false,
      email: json['email'] as String?,
      emailVerified: json['emailVerified'] as bool? ?? false,
      fullName: json['fullName'] as String?,
      preferredLanguage: json['preferredLanguage'] as String? ?? 'ar',
    );
  }
}
