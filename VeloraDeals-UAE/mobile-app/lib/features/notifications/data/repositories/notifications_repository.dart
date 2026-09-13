import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/api_client.dart';
import '../models/notification_model.dart';

class NotificationsRepository {
  final ApiClient _api;
  NotificationsRepository(this._api);

  Future<List<AppNotification>> getMyNotifications() async {
    final json = await _api.get(ApiPaths.notifications);
    final items = json['items'] as List? ?? [];
    return items.map((e) => AppNotification.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<int> getUnreadCount() async {
    final json = await _api.get('${ApiPaths.notifications}/unread-count');
    return (json['value'] as num?)?.toInt() ?? 0;
  }

  Future<void> markAsRead(String notificationId) async {
    await _api.patch('${ApiPaths.notifications}/$notificationId/read');
  }
}
