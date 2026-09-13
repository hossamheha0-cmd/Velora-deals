import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;

    final items = <_ProfileItem>[
      _ProfileItem(Icons.receipt_long_outlined, 'طلباتي', '/orders'),
      _ProfileItem(Icons.location_on_outlined, 'عناويني', '/addresses'),
      _ProfileItem(Icons.favorite_border, 'المفضلة', '/wishlist'),
      _ProfileItem(Icons.notifications_outlined, 'الإشعارات', '/notifications'),
      _ProfileItem(Icons.settings_outlined, 'الإعدادات', '/settings'),
      _ProfileItem(Icons.support_agent_outlined, 'الدعم والتواصل', '/support'),
      _ProfileItem(Icons.info_outline, 'عن Velora Deals UAE', '/about'),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(16)),
            child: Row(
              children: [
                const CircleAvatar(radius: 28, backgroundColor: Colors.white24, child: Icon(Icons.person, color: Colors.white, size: 30)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.fullName ?? 'مستخدم Velora', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 2),
                      Text(user?.email ?? user?.phoneNumber ?? '', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          ...items.map((item) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: Icon(item.icon, color: AppColors.primary),
                  title: Text(item.label),
                  trailing: const Icon(Icons.chevron_left),
                  onTap: () => context.push(item.route),
                ),
              )),
          const SizedBox(height: 12),
          Card(
            margin: EdgeInsets.zero,
            child: ListTile(
              leading: const Icon(Icons.logout, color: AppColors.error),
              title: const Text('تسجيل الخروج', style: TextStyle(color: AppColors.error)),
              onTap: () async {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) context.go('/login');
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileItem {
  final IconData icon;
  final String label;
  final String route;
  _ProfileItem(this.icon, this.label, this.route);
}
