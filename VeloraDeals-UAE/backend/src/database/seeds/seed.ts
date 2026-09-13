import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from '../data-source';
import { Setting } from '../../modules/settings/entities/setting.entity';
import { PaymentMethod, PaymentMethodType } from '../../modules/payment-methods/entities/payment-method.entity';
import { AdminUser, AdminRole } from '../../modules/admin/entities/admin-user.entity';
import { Category } from '../../modules/categories/entities/category.entity';

// يزرع القيم الافتراضية المعتمدة بالضبط في المحادثة:
// Shipping Fee = 9 AED | VAT = 5% | COD فقط مفعّلة | Order Initial Status = Pending
async function seed() {
  await AppDataSource.initialize();

  const settingsRepo = AppDataSource.getRepository(Setting);
  const defaultSettings: Array<Partial<Setting>> = [
    { key: 'shipping_fee', value: '9', type: 'number', description: 'رسوم الشحن الأساسية بالدرهم' },
    { key: 'free_shipping_enabled', value: 'false', type: 'boolean', description: 'تفعيل الشحن المجاني' },
    { key: 'free_shipping_threshold', value: '0', type: 'number', description: 'الحد الأدنى للشحن المجاني' },
    { key: 'vat_enabled', value: 'true', type: 'boolean', description: 'تفعيل ضريبة القيمة المضافة' },
    { key: 'vat_rate', value: '5', type: 'number', description: 'نسبة ضريبة القيمة المضافة %' },
    {
      key: 'default_cod_order_status',
      value: 'pending',
      type: 'string',
      description: 'حالة الطلب الابتدائية عند الدفع عبر COD (pending أو confirmed)',
    },
    { key: 'default_currency', value: 'AED', type: 'string', description: 'العملة الأساسية للمتجر' },
    { key: 'default_language', value: 'en', type: 'string', description: 'اللغة الافتراضية للتطبيق' },
    { key: 'store_name', value: 'VeloraDeals UAE', type: 'string', description: 'اسم المتجر' },
    { key: 'contact_email', value: 'veloradeals.uae@gmail.com', type: 'string', description: 'البريد الإلكتروني للتواصل' },
    { key: 'contact_phone', value: '+971509411928', type: 'string', description: 'رقم الهاتف للتواصل' },
    { key: 'contact_whatsapp', value: '+971509411928', type: 'string', description: 'رقم واتساب للتواصل' },
    { key: 'social_facebook', value: 'https://www.facebook.com/profile.php?id=61578447221765', type: 'string', description: 'رابط فيسبوك' },
    { key: 'social_instagram', value: 'https://www.instagram.com/velora.deals.uae', type: 'string', description: 'رابط انستجرام' },
    { key: 'social_tiktok', value: 'https://www.tiktok.com/@velora.deals.uae', type: 'string', description: 'رابط تيك توك' },
    { key: 'social_youtube', value: 'https://www.youtube.com/@VeloraDealsUae', type: 'string', description: 'رابط يوتيوب' },
    { key: 'official_website', value: '', type: 'string', description: 'الموقع الرسمي (غير متاح بعد)' },

    // ---- خصومات تلقائية وحد أدنى للطلب (نظام الخصومات والكوبونات) ----
    { key: 'min_order_amount', value: '60', type: 'number', description: 'الحد الأدنى لقيمة الطلب بالدرهم' },
    { key: 'first_order_discount_enabled', value: 'true', type: 'boolean', description: 'تفعيل خصم أول طلب' },
    { key: 'first_order_discount_type', value: 'percentage', type: 'string', description: 'نوع خصم أول طلب: percentage أو free_shipping' },
    { key: 'first_order_discount_percentage', value: '15', type: 'number', description: 'نسبة خصم أول طلب %' },
    { key: 'cart_value_discount_enabled', value: 'true', type: 'boolean', description: 'تفعيل خصم قيمة السلة' },
    { key: 'cart_value_discount_threshold', value: '250', type: 'number', description: 'الحد الأدنى لقيمة السلة للحصول على الخصم (AED)' },
    { key: 'cart_value_discount_percentage', value: '15', type: 'number', description: 'نسبة خصم قيمة السلة %' },

    // ---- Order Tracking Workflow ----
    { key: 'live_order_tracking_enabled', value: 'true', type: 'boolean', description: 'إظهار شريط تتبع حالة الطلب التفصيلي للعملاء' },

    // ---- Payment Rules ----
    // القيمة الافتراضية 0 = بدون حد (معطّل) عمدًا: تفعيله بقيمة > 0 الآن سيمنع الطلبات الكبيرة
    // من الدفع عند الاستلام دون وجود بديل إلكتروني فعلي بعد (Telr/PayTabs لسه معطّلين) - الأدمن
    // يفعّله بنفسه بعد ربط بوابة دفع إلكترونية حقيقية.
    { key: 'max_cod_amount', value: '0', type: 'number', description: 'حد أقصى لقيمة طلبات الدفع عند الاستلام (0 = بدون حد)' },
    { key: 'card_payment_otp_enabled', value: 'false', type: 'boolean', description: 'طلب OTP إضافي عند الدفع بالبطاقة (غير فعّال حتى ربط بوابة دفع إلكترونية حقيقية)' },
    { key: 'card_payment_otp_threshold', value: '500', type: 'number', description: 'الحد الأدنى للمبلغ لطلب OTP إضافي عند الدفع بالبطاقة' },

    // ---- Theme Customization (تُقرأ من Backend فقط حاليًا - غير مربوطة بعرض ديناميكي في
    // تطبيق Flutter بعد؛ التطبيق يستخدم ثيمًا ثابتًا في الكود، وربطه بهذه القيم فعليًا خطوة لاحقة) ----
    { key: 'theme_primary_color', value: '#132E53', type: 'string', description: 'اللون الأساسي للتطبيق (Hex)' },
    { key: 'theme_secondary_color', value: '#2E86D8', type: 'string', description: 'اللون الثانوي للتطبيق (Hex)' },
    { key: 'theme_font_scale', value: '1.0', type: 'number', description: 'مقياس حجم الخط العام (1.0 = افتراضي)' },
    { key: 'theme_style', value: 'modern', type: 'string', description: 'نمط التصميم العام: modern | classic | minimal' },
    { key: 'homepage_section_order', value: 'banners,new_arrivals,offers,categories', type: 'string', description: 'ترتيب أقسام الصفحة الرئيسية مفصولة بفواصل' },
  ];

  for (const s of defaultSettings) {
    const exists = await settingsRepo.findOne({ where: { key: s.key } });
    if (!exists) {
      await settingsRepo.save(settingsRepo.create(s));
      console.log(`✔ Setting seeded: ${s.key} = ${s.value}`);
    }
  }

  const paymentRepo = AppDataSource.getRepository(PaymentMethod);
  const paymentMethods: Array<Partial<PaymentMethod>> = [
    {
      code: 'cod',
      nameAr: 'الدفع عند الاستلام',
      nameEn: 'Cash On Delivery',
      type: PaymentMethodType.MANUAL,
      enabled: true,
      isDefault: true,
      sortOrder: 1,
      configuration: { minOrderAmount: 0, maxOrderAmount: null, extraFee: 0 },
    },
    {
      code: 'telr',
      nameAr: 'Telr (قريبًا)',
      nameEn: 'Telr (Coming Soon)',
      type: PaymentMethodType.GATEWAY,
      enabled: false,
      isDefault: false,
      sortOrder: 2,
      configuration: {},
    },
    {
      code: 'paytabs',
      nameAr: 'PayTabs (قريبًا)',
      nameEn: 'PayTabs (Coming Soon)',
      type: PaymentMethodType.GATEWAY,
      enabled: false,
      isDefault: false,
      sortOrder: 3,
      configuration: {},
    },
  ];

  for (const pm of paymentMethods) {
    const exists = await paymentRepo.findOne({ where: { code: pm.code } });
    if (!exists) {
      await paymentRepo.save(paymentRepo.create(pm));
      console.log(`✔ Payment method seeded: ${pm.code} (enabled=${pm.enabled})`);
    }
  }

  const adminRepo = AppDataSource.getRepository(AdminUser);

  const adminAccounts: Array<{ email: string; password: string; fullName: string; role: AdminRole }> = [
    { email: 'admin@veloradeals.ae', password: 'ChangeMe123!', fullName: 'Super Admin', role: AdminRole.SUPER_ADMIN },
    // حساب تجريبي إضافي طُلب صراحة لاختبار تسجيل دخول الأدمن من تطبيق الموبايل - نفس آلية
    // التخزين الآمنة (bcrypt) المستخدمة لأي حساب أدمن آخر، وليس بيانات ثابتة داخل كود التطبيق.
    { email: 'admin@myapp.com', password: 'Admin@123456', fullName: 'Test Admin', role: AdminRole.SUPER_ADMIN },
  ];

  for (const acc of adminAccounts) {
    const existing = await adminRepo.findOne({ where: { email: acc.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(acc.password, 10);
      await adminRepo.save(
        adminRepo.create({
          email: acc.email,
          passwordHash,
          fullName: acc.fullName,
          role: acc.role,
        }),
      );
      console.log(`✔ Admin seeded: ${acc.email} / ${acc.password} (role: ${acc.role}) — غيّر كلمة المرور قبل أي استخدام إنتاجي`);
    }
  }

  const categoryRepo = AppDataSource.getRepository(Category);
  const categories: Array<{ nameAr: string; nameEn: string; slug: string; sortOrder: number }> = [
    { nameAr: 'الأجهزة الكهربائية', nameEn: 'Home Appliances', slug: 'home-appliances', sortOrder: 1 },
    { nameAr: 'الهواتف والإكسسوارات', nameEn: 'Phones & Accessories', slug: 'phones-accessories', sortOrder: 2 },
    { nameAr: 'أدوات المطبخ', nameEn: 'Kitchen', slug: 'kitchen', sortOrder: 3 },
    { nameAr: 'مستلزمات الحمام', nameEn: 'Bathroom', slug: 'bathroom', sortOrder: 4 },
    { nameAr: 'الملابس', nameEn: 'Apparel', slug: 'apparel', sortOrder: 5 },
    { nameAr: 'ملابس الأطفال', nameEn: "Kids' Apparel", slug: 'kids-apparel', sortOrder: 6 },
    { nameAr: 'إكسسوارات السيارات', nameEn: 'Car Accessories', slug: 'car-accessories', sortOrder: 7 },
    { nameAr: 'العناية بالبشرة', nameEn: 'Skincare', slug: 'skincare', sortOrder: 8 },
    { nameAr: 'أدوات التجميل', nameEn: 'Cosmetics', slug: 'cosmetics', sortOrder: 9 },
    { nameAr: 'العطور', nameEn: 'Perfumes', slug: 'perfumes', sortOrder: 10 },
  ];
  for (const c of categories) {
    const exists = await categoryRepo.findOne({ where: { slug: c.slug } });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create({ ...c, enabled: true }));
      console.log(`✔ Category seeded: ${c.nameEn}`);
    }
  }

  await AppDataSource.destroy();
  console.log('\n✅ Seeding completed.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
