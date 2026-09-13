/// يمثّل بيانات المتجر العامة (تواصل، روابط تواصل اجتماعي، عملة) القادمة من
/// GET /settings/public في Backend - لا شيء منها Hardcoded في التطبيق.
class PublicStoreSettings {
  final String storeName;
  final String currency;
  final String defaultLanguage;
  final String contactEmail;
  final String contactPhone;
  final String contactWhatsapp;
  final String? facebookUrl;
  final String? instagramUrl;
  final String? tiktokUrl;
  final String? youtubeUrl;
  final String? officialWebsite;

  PublicStoreSettings({
    required this.storeName,
    required this.currency,
    required this.defaultLanguage,
    required this.contactEmail,
    required this.contactPhone,
    required this.contactWhatsapp,
    this.facebookUrl,
    this.instagramUrl,
    this.tiktokUrl,
    this.youtubeUrl,
    this.officialWebsite,
  });

  factory PublicStoreSettings.fromJson(Map<String, dynamic> json) {
    String? emptyToNull(String? v) => (v == null || v.isEmpty) ? null : v;
    return PublicStoreSettings(
      storeName: json['store_name'] as String? ?? 'Velora Deals UAE',
      currency: json['default_currency'] as String? ?? 'AED',
      defaultLanguage: json['default_language'] as String? ?? 'ar',
      contactEmail: json['contact_email'] as String? ?? '',
      contactPhone: json['contact_phone'] as String? ?? '',
      contactWhatsapp: json['contact_whatsapp'] as String? ?? '',
      facebookUrl: emptyToNull(json['social_facebook'] as String?),
      instagramUrl: emptyToNull(json['social_instagram'] as String?),
      tiktokUrl: emptyToNull(json['social_tiktok'] as String?),
      youtubeUrl: emptyToNull(json['social_youtube'] as String?),
      officialWebsite: emptyToNull(json['official_website'] as String?),
    );
  }
}
