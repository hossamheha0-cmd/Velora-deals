import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/models/address_model.dart';
import '../providers/addresses_provider.dart';

class AddAddressScreen extends ConsumerStatefulWidget {
  const AddAddressScreen({super.key});

  @override
  ConsumerState<AddAddressScreen> createState() => _AddAddressScreenState();
}

class _AddAddressScreenState extends ConsumerState<AddAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  final _labelController = TextEditingController(text: 'المنزل');
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  final _addressController = TextEditingController();
  Emirate _emirate = Emirate.dubai;
  bool _saving = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await ref.read(addressesProvider.notifier).addAddress(
            label: _labelController.text.trim(),
            recipientName: _nameController.text.trim(),
            recipientPhone: _phoneController.text.trim(),
            emirate: _emirate,
            city: _cityController.text.trim(),
            addressLine: _addressController.text.trim(),
          );
      if (mounted) context.pop();
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('عنوان جديد')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(controller: _labelController, decoration: const InputDecoration(labelText: 'اسم العنوان (مثال: المنزل، العمل)'), validator: _required),
                const SizedBox(height: 12),
                TextFormField(controller: _nameController, decoration: const InputDecoration(labelText: 'اسم المستلم'), validator: _required),
                const SizedBox(height: 12),
                TextFormField(controller: _phoneController, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'رقم هاتف المستلم'), validator: _required),
                const SizedBox(height: 12),
                DropdownButtonFormField<Emirate>(
                  initialValue: _emirate,
                  decoration: const InputDecoration(labelText: 'الإمارة'),
                  items: Emirate.values.map((e) => DropdownMenuItem(value: e, child: Text(e.labelAr))).toList(),
                  onChanged: (v) => setState(() => _emirate = v ?? Emirate.dubai),
                ),
                const SizedBox(height: 12),
                TextFormField(controller: _cityController, decoration: const InputDecoration(labelText: 'المدينة'), validator: _required),
                const SizedBox(height: 12),
                TextFormField(controller: _addressController, maxLines: 2, decoration: const InputDecoration(labelText: 'العنوان بالتفصيل (شارع، مبنى، شقة)'), validator: _required),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _saving ? null : _submit,
                  child: _saving
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('حفظ العنوان'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String? _required(String? v) => (v == null || v.trim().isEmpty) ? 'هذا الحقل مطلوب' : null;
}
