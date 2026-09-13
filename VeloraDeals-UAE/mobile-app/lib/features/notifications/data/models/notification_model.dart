class AppNotification {
  final String id;
  final String titleAr;
  final String titleEn;
  final String bodyAr;
  final String bodyEn;
  final String type; // 'promotion' | 'new_arrival' | 'order_update' | 'general'
  final bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.titleAr,
    required this.titleEn,
    required this.bodyAr,
    required this.bodyEn,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] as String,
        titleAr: json['titleAr'] as String,
        titleEn: json['titleEn'] as String,
        bodyAr: json['bodyAr'] as String,
        bodyEn: json['bodyEn'] as String,
        type: json['type'] as String,
        isRead: json['isRead'] as bool? ?? false,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );
}
