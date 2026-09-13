enum Emirate {
  abuDhabi('abu_dhabi', 'أبوظبي'),
  dubai('dubai', 'دبي'),
  sharjah('sharjah', 'الشارقة'),
  ajman('ajman', 'عجمان'),
  ummAlQuwain('umm_al_quwain', 'أم القيوين'),
  rasAlKhaimah('ras_al_khaimah', 'رأس الخيمة'),
  fujairah('fujairah', 'الفجيرة');

  final String value;
  final String labelAr;
  const Emirate(this.value, this.labelAr);

  static Emirate fromValue(String value) => Emirate.values.firstWhere((e) => e.value == value, orElse: () => Emirate.dubai);
}

class AddressModel {
  final String id;
  final String label;
  final String recipientName;
  final String recipientPhone;
  final Emirate emirate;
  final String city;
  final String addressLine;
  final String? addressLine2;
  final bool isDefault;

  AddressModel({
    required this.id,
    required this.label,
    required this.recipientName,
    required this.recipientPhone,
    required this.emirate,
    required this.city,
    required this.addressLine,
    this.addressLine2,
    required this.isDefault,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) => AddressModel(
        id: json['id'] as String,
        label: json['label'] as String,
        recipientName: json['recipientName'] as String,
        recipientPhone: json['recipientPhone'] as String,
        emirate: Emirate.fromValue(json['emirate'] as String),
        city: json['city'] as String,
        addressLine: json['addressLine'] as String,
        addressLine2: json['addressLine2'] as String?,
        isDefault: json['isDefault'] as bool? ?? false,
      );
}
