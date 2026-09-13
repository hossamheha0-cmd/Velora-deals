/// يمثّل حساب الأدمن المسجَّل دخوله - مختلف تمامًا عن UserProfile (حساب العميل)
class AdminProfile {
  final String id;
  final String email;
  final String fullName;
  final String role;

  AdminProfile({required this.id, required this.email, required this.fullName, required this.role});

  factory AdminProfile.fromJson(Map<String, dynamic> json) => AdminProfile(
        id: json['id'] as String,
        email: json['email'] as String,
        fullName: json['fullName'] as String,
        role: json['role'] as String,
      );

  Map<String, dynamic> toJson() => {'id': id, 'email': email, 'fullName': fullName, 'role': role};
}

class AdminAuthResult {
  final String accessToken;
  final String refreshToken;
  final AdminProfile admin;

  AdminAuthResult({required this.accessToken, required this.refreshToken, required this.admin});

  factory AdminAuthResult.fromJson(Map<String, dynamic> json) => AdminAuthResult(
        accessToken: json['accessToken'] as String,
        refreshToken: json['refreshToken'] as String,
        admin: AdminProfile.fromJson(json['admin'] as Map<String, dynamic>),
      );
}
