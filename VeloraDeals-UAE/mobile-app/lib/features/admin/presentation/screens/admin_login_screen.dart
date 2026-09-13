import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../providers/admin_auth_provider.dart';

class AdminLoginScreen extends ConsumerStatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  ConsumerState<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends ConsumerState<AdminLoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final success = await ref.read(adminAuthProvider.notifier).login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );
    if (success && mounted) context.go('/admin-dashboard');
  }

  @override
  Widget build(BuildContext context) {
    final adminAuthState = ref.watch(adminAuthProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('دخول المسؤول')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 12),
                const Icon(Icons.admin_panel_settings_outlined, size: 56, color: AppColors.primary),
                const SizedBox(height: 12),
                const Text(
                  'هذه الشاشة مخصصة لحسابات الإدارة فقط. حسابات العملاء العادية لا تملك صلاحية الدخول هنا.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                ),
                const SizedBox(height: 28),

                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'البريد الإلكتروني للمسؤول'),
                  validator: (v) => (v == null || !v.contains('@')) ? 'برجاء إدخال بريد إلكتروني صحيح' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    labelText: 'كلمة المرور',
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  validator: (v) => (v == null || v.isEmpty) ? 'برجاء إدخال كلمة المرور' : null,
                ),

                if (adminAuthState.errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(adminAuthState.errorMessage!, style: const TextStyle(color: AppColors.error), textAlign: TextAlign.center),
                ],

                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: adminAuthState.isLoading ? null : _submit,
                  child: adminAuthState.isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('دخول لوحة التحكم'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
