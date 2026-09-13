import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/admin_auth_provider.dart';
import '../../data/repositories/admin_auth_repository.dart';

/// شاشة لوحة تحكم مبسطة داخل تطبيق الموبايل - للاطّلاع السريع على الطلبات فقط من الهاتف.
/// الإدارة الكاملة (منتجات/فئات/إعدادات) تبقى في Admin Dashboard (الويب) كما هو معتمد في
/// الـArchitecture الأصلي؛ هذه الشاشة لا تستبدلها بل تضيف دخول أدمن حقيقي داخل تطبيق العميل
/// حسب الطلب الصريح، مع نفس مصدر البيانات الحقيقي (Backend نفسه، عبر توكن أدمن حقيقي).
class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  bool _guardChecked = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _guardAccess());
  }

  // حارس وصول صريح: أي محاولة فتح هذه الشاشة بدون جلسة أدمن صالحة تُعاد توجيهها فورًا لشاشة
  // دخول الأدمن - حتى لو كان هناك جلسة عميل عادية نشطة في نفس الوقت (الجلستان منفصلتان تمامًا).
  void _guardAccess() {
    final status = ref.read(adminAuthProvider).status;
    if (status != AdminAuthStatus.authenticated) {
      context.go('/admin-login');
      return;
    }
    setState(() => _guardChecked = true);
  }

  @override
  Widget build(BuildContext context) {
    final adminState = ref.watch(adminAuthProvider);

    // إعادة التحقق تلقائيًا لو تغيّرت الحالة لغير مصرَّح أثناء عرض الشاشة (مثال: انتهاء الجلسة)
    ref.listen(adminAuthProvider, (previous, next) {
      if (next.status != AdminAuthStatus.authenticated) {
        context.go('/admin-login');
      }
    });

    if (!_guardChecked || adminState.status != AdminAuthStatus.authenticated) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة تحكم المسؤول'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'تسجيل خروج المسؤول',
            onPressed: () async {
              await ref.read(adminAuthProvider.notifier).logout();
              if (context.mounted) context.go('/admin-login');
            },
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: ref.read(adminAuthRepositoryProvider).getOrders(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('${snapshot.error}'));
          }
          final orders = snapshot.data ?? [];
          final pendingCount = orders.where((o) => o['status'] == 'pending').length;
          final totalRevenue = orders
              .where((o) => o['status'] != 'cancelled')
              .fold<double>(0, (sum, o) => sum + double.parse((o['finalTotal'] ?? 0).toString()));

          return RefreshIndicator(
            onRefresh: () async => setState(() {}),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('أهلًا، ${adminState.admin?.fullName ?? ''}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text(adminState.admin?.role ?? '', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _StatCard(label: 'إجمالي الطلبات', value: '${orders.length}')),
                    const SizedBox(width: 12),
                    Expanded(child: _StatCard(label: 'قيد المراجعة', value: '$pendingCount')),
                  ],
                ),
                const SizedBox(height: 12),
                _StatCard(label: 'إجمالي الإيرادات', value: '${totalRevenue.toStringAsFixed(2)} AED', wide: true),
                const SizedBox(height: 20),
                const Text('أحدث الطلبات', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ...orders.take(10).map((o) => Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade100)),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${o['orderNumber']}', style: const TextStyle(fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                                Text('${o['finalTotal']} AED · ${o['paymentMethodCode']}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                            child: Text('${o['status']}', style: const TextStyle(fontSize: 11, color: AppColors.primary)),
                          ),
                        ],
                      ),
                    )),
                if (orders.isEmpty) const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('لا توجد طلبات بعد'))),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final bool wide;
  const _StatCard({required this.label, required this.value, this.wide = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: wide ? double.infinity : null,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.grey.shade100)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary)),
        ],
      ),
    );
  }
}
