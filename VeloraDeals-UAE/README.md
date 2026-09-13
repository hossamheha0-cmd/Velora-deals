# VeloraDeals UAE

تطبيق تجارة إلكترونية متكامل لسوق الإمارات — Flutter Mobile App + NestJS Backend + Next.js
Admin Dashboard. هذا الـRepo يضم المشاريع الثلاثة معًا.

## البنية

```
VeloraDeals-UAE/
├── backend/            NestJS + TypeORM + PostgreSQL — الـAPI الحقيقي لكل شيء
├── admin-dashboard/    Next.js — لوحة تحكم إدارة المتجر (ويب)
└── mobile-app/         Flutter — تطبيق العميل (Android + iOS)
```

كل مشروع فرعي عنده `README.md` خاص فيه بخطوات التشغيل الكاملة، و`PRODUCTION_READINESS.md`
يوضّح بدقة وصدق تام: إيه اللي اتبنى واتحقق منه فعليًا، وإيه اللي محتاج إعداد إضافي منك قبل
الإطلاق التجاري (مفاتيح حقيقية، حسابات خدمات خارجية، إلخ).

## من فين تبدأ

1. **`backend/README.md`** — شغّل هذا أولًا. كل حاجة تانية بتعتمد عليه.
2. **`admin-dashboard/README.md`** — لوحة التحكم، تحتاج الـBackend شغّال.
3. **`mobile-app/README.md`** — تطبيق العميل، يحتاج الـBackend شغّال + Flutter SDK مثبت عندك
   (لم يُشغَّل Flutter داخل بيئة التطوير التي بُني بها هذا المشروع — راجع
   `mobile-app/PRODUCTION_READINESS.md` للتفاصيل).

## الحالة الحالية (نظرة سريعة، صادقة بدون مبالغة)

| الجزء | الحالة |
|---|---|
| Auth (Email+Password, Phone+OTP, بنية جاهزة لـGoogle/Apple) | ✅ مبني ومُختبَر حيًا |
| الكتالوج (10 فئات، منتجات، متغيرات) | ✅ مبني ومُختبَر حيًا |
| السلة والطلبات (COD) | ✅ مبني ومُختبَر حيًا |
| الخصومات التلقائية + الكوبونات | ✅ مبني ومُختبَر حيًا |
| Order Tracking Workflow (Pending→Preparing→Shipped) | ✅ مبني ومُختبَر حيًا |
| الحسابات البنكية (بيانات مرجعية للتبديل بينها) | ✅ مبني ومُختبَر حيًا |
| حد أقصى لطلبات COD | ✅ مبني ومُختبَر حيًا (معطّل افتراضيًا لحين ربط بوابة دفع حقيقية) |
| الإشعارات داخل التطبيق (In-App) | ✅ مبني ومُختبَر حيًا |
| إعدادات الثيم (ألوان/خط/تخطيط) | ⚠️ مخزَّنة في Backend وقابلة للتعديل من لوحة التحكم، لكن **غير مربوطة بعد** بعرض ديناميكي فعلي داخل تطبيق Flutter (يستخدم حاليًا ثيمًا ثابتًا في الكود) |
| بوابات دفع إلكترونية حقيقية (Visa/Mastercard/Apple Pay/Samsung Pay) | ❌ تحتاج حساب بوابة دفع حقيقي (Telr/PayTabs/Stripe) بمفاتيح API فعلية — البنية (`PaymentProviderInterface`) جاهزة لاستقبالها |
| Push Notifications حقيقي (FCM) | ❌ تحتاج مشروع Firebase حقيقي مربوط |
| مساعد ذكاء اصطناعي للدردشة | ❌ تحتاج مفتاح API حقيقي (OpenAI/Anthropic) |
| Admin: Google/Apple Sign-In فعليًا | ❌ تحتاج `GOOGLE_CLIENT_ID`/`APPLE_CLIENT_ID` حقيقيين في `.env` |

راجع `backend/PRODUCTION_READINESS.md` و`mobile-app/PRODUCTION_READINESS.md` و
`admin-dashboard/PRODUCTION_READINESS.md` للتفاصيل الكاملة لكل بند.

## بيانات دخول تجريبية (Development فقط — غيّرها فورًا في أي بيئة حقيقية)

```
Admin Email:    admin@myapp.com
Admin Password: Admin@123456
```

## الأمان — قبل الرفع على GitHub كـRepo عام

هذا الـRepo **لا يحتوي على أي ملف `.env` حقيقي** (مُستثناة عبر `.gitignore` في كل مستوى) — فقط
`.env.example` بأسماء المتغيرات بدون قيم سرّية. **لو الـRepo هيكون عامًا (Public)**، راجع
الآتي قبل أول Push:
- غيّر `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` في بيئتك الفعلية (القيم في `.env.example` مجرد
  Placeholders واضحة، وليست قيمًا سرّية حقيقية)
- غيّر كلمة مرور حساب الأدمن التجريبي أعلاه قبل أي استخدام حقيقي
