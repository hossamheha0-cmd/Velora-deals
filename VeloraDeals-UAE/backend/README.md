# Velora Deals UAE — Backend (NestJS)

Backend حقيقي (NestJS + TypeORM + PostgreSQL) — لا Fake APIs ولا Fake Database. تم تطويره
واختباره حيًا داخل الـSandbox (Migrations فعلية، Auth حقيقي bcrypt+JWT، طلبات COD كاملة
بحساب VAT/Shipping فعلي). راجع `PRODUCTION_READINESS.md` في هذا المجلد لتفاصيل ما هو مُتحقَّق
منه بالضبط مقابل ما يحتاج بيئة إنتاج حقيقية (AWS، SMS Provider، Payment Gateway مستقبلي).

---

## المتطلبات

| الأداة | الإصدار المُختبَر | ملاحظات |
|---|---|---|
| Node.js | v22.x | أي إصدار LTS حديث (≥18) يجب أن يعمل |
| PostgreSQL | 16 | يمكن تشغيله محليًا أو عبر AWS RDS في الإنتاج |
| npm | 10.x | يأتي مع Node.js |

---

## التشغيل المحلي من الصفر

```bash
# 1) تثبيت الحزم
npm install

# 2) إعداد قاعدة بيانات PostgreSQL محلية
createdb velora_deals_uae   # أو عبر psql: CREATE DATABASE velora_deals_uae;

# 3) نسخ متغيرات البيئة وتعديلها
cp .env.example .env
# عدّل DB_PASSWORD وJWT secrets على الأقل قبل أي استخدام جدي

# 4) بناء المشروع
npm run build

# 5) تشغيل الـMigrations الحقيقية (ينشئ كل الجداول والعلاقات)
npm run migration:run

# 6) زرع القيم الافتراضية (COD مفعّلة، Shipping=9 AED، VAT=5%، بيانات تواصل، Super Admin)
npm run seed

# 7) التشغيل
npm run start           # إنتاج (يستخدم dist/ المبني)
# أو
npm run start:dev       # تطوير (Hot reload عبر ts-node-dev)
```

بعد التشغيل، الـAPI متاح على `http://localhost:3000/api/v1` وتوثيق Swagger على
`http://localhost:3000/api/v1/docs`.

**بيانات دخول الـSuper Admin الافتراضية بعد الـseed:**
`admin@veloradeals.ae` / `ChangeMe123!` — **غيّرها فورًا في أي بيئة غير محلية.**

---

## Environment Variables (`.env`)

| المتغير | الوصف | مثال إنتاج |
|---|---|---|
| `NODE_ENV` | development / production | `production` |
| `PORT` | منفذ التشغيل | `3000` |
| `API_PREFIX` | بادئة كل المسارات | `api/v1` |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | اتصال PostgreSQL | RDS endpoint في الإنتاج |
| `DB_SYNCHRONIZE` | يجب أن يبقى `false` دائمًا | `false` (لا تُفعّله أبدًا في إنتاج) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | مفاتيح توقيع JWT | **قيم عشوائية طويلة حقيقية — انظر قسم Secrets أدناه** |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | مدة صلاحية التوكنات | `15m` / `30d` |
| `SMS_PROVIDER` | `console` (تطوير) أو مزود حقيقي | `unifonic` أو `twilio` عند الربط الفعلي |
| `OTP_EXPIRES_IN_SECONDS` / `OTP_LENGTH` | إعدادات OTP | `300` / `6` |
| `AWS_REGION` / `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | تخزين الصور (غير مُفعَّل بعد فعليًا في الكود) | مطلوبة فقط عند تفعيل رفع الصور لـS3 |

---

## Secrets المطلوبة قبل أي نشر حقيقي

هذه القيم **غير موجودة حاليًا كقيم إنتاجية حقيقية** — الموجود في `.env` هو قيم تطوير محلي فقط:

1. **`JWT_ACCESS_SECRET` و `JWT_REFRESH_SECRET`** — يجب توليدهما عشوائيًا بطول كافٍ، مثال:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   شغّله مرتين للحصول على قيمتين مختلفتين. **لا تستخدم القيم الافتراضية الموجودة في
   `.env.example` في أي بيئة حقيقية.**
2. **بيانات اتصال قاعدة بيانات الإنتاج** (RDS endpoint, username, password) — تُنشأ عند إعداد
   AWS RDS الفعلي.
3. **مفاتيح مزود SMS حقيقي** (Unifonic/Twilio) — عند الانتقال من `SMS_PROVIDER=console` (الذي
   يطبع الكود في الـLogs فقط) لمزود فعلي يرسل رسائل SMS حقيقية.
4. **مفاتيح AWS S3** — فقط لو فعّلت رفع صور المنتجات لـS3 (البنية جاهزة في `.env.example` لكن
   الكود الفعلي لرفع الملفات لـS3 لم يُبنَ بعد في هذه المرحلة).
5. **مفاتيح بوابة دفع إلكتروني** (Telr/PayTabs) — فقط عند قرار مستقبلي بتفعيل الدفع الإلكتروني؛
   البنية (`PaymentProviderInterface`) جاهزة لاستقبالها دون تعديل Checkout.

---

## بنية الـAPI

كل التوثيق التفاعلي الكامل متاح عبر Swagger على `/api/v1/docs` بعد تشغيل السيرفر. نظرة عامة
على المجموعات الرئيسية: `auth`، `admin/auth`، `users`، `addresses`، `categories` +
`admin/categories`، `products` + `admin/products`، `cart`، `orders` + `admin/orders`،
`payment-methods` + `admin/payment-methods`، `settings/public` + `admin/settings`.

---

## النشر على AWS (نظرة عامة — التفاصيل الكاملة في `PRODUCTION_READINESS.md`)

المعمارية المعتمدة (من مرحلة Architecture): **ECS Fargate + RDS PostgreSQL (Single-AZ بداية) +
S3 + CloudFront + ElastiCache Redis + Route 53**. لم يتم إعداد أي من هذه الموارد فعليًا بعد —
هذا Backend حاليًا مُختبَر محليًا فقط داخل الـSandbox.
