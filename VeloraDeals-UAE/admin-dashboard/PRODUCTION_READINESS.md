# PRODUCTION_READINESS.md — Velora Deals UAE Admin Dashboard

---

## A. Completed

- Next.js 16 + React 19 + TypeScript + Tailwind، صفحات: Login، Dashboard (إحصائيات)، Orders
  (List + Detail)، Products (CRUD)، Categories (CRUD)، Payment Methods (Enable/Disable)،
  Settings (Shipping + VAT + COD Default Status فقط — انظر الفجوة أدناه)
- `AuthProvider` (JWT حقيقي، حماية Routes تلقائيًا)، `ApiClient` موحّد

### ⚠️ فجوة حقيقية تم اكتشافها في هذه المراجعة: Store/Contact/Social Settings UI

الـBackend يخزّن **17 مفتاح إعداد**، لكن صفحة `/settings` الحالية تعرض واجهة تعديل **لـ6 مفاتيح
فقط** (`shipping_fee`, `free_shipping_enabled`, `free_shipping_threshold`, `vat_enabled`,
`vat_rate`, `default_cod_order_status`).

**لا توجد واجهة في لوحة التحكم لتعديل:** `store_name`, `default_currency`, `default_language`,
`contact_email`, `contact_phone`, `contact_whatsapp`, `social_facebook`, `social_instagram`,
`social_tiktok`, `social_youtube`, `official_website`.

هذه القيم **موجودة وقابلة للقراءة/التعديل تقنيًا** عبر `GET/PUT /admin/settings/:key` (نفس
الـEndpoint المستخدم لبقية الإعدادات، ومختبر ويعمل)، لكن **لا يوجد زر أو نموذج (Form) في
الواجهة** يسمح للـSuper Admin بتغييرها بدون استخدام API مباشرة (Swagger أو curl). هذا يعني أن
البند المطلوب في التوجيه الأخير ("Admin Dashboard يستطيع تعديل البيانات") **غير محقَّق فعليًا
من ناحية تجربة المستخدم**، رغم أن الـBackend يدعمه بالكامل.

**كذلك — حقول مطلوبة في التوجيه الأخير غير موجودة حتى في الـBackend نفسه (وليس فقط في
الواجهة):** `Logo` (كرابط منفصل قابل للتعديل)، `Address` (عنوان نصي للمتجر)، `Google Maps`
(رابط أو إحداثيات)، `Support Hours` (ساعات الدعم). هذه الحقول الأربعة **لم تُزرَع في جدول
`settings` أصلًا** ولا في `PUBLIC_SETTING_KEYS` في Backend.

**لم أقم بإضافة أي من هذا الآن** التزامًا بتعليمة "لا تضف Features جديدة" — هذا القسم موجود
هنا فقط لتوثيق الفجوة بدقة كما طُلب، وليقرر صاحب القرار الخطوة التالية.

### فجوات أخرى من Architecture الأصلي غير مبنية في الواجهة (لأن Backend لا يدعمها أصلًا)
Customers، Inventory (كصفحة مستقلة)، Coupons، Banners، Notifications Management، Admin
Permissions Management (لا توجد شاشة لإنشاء/تعديل حسابات أدمن أخرى أو صلاحياتها — يتم حاليًا
فقط عبر Seed Script أو مباشرة في قاعدة البيانات).

---

## B. Runtime Tested

- **لا شيء** — لم يتم فتح أي صفحة فعليًا في متصفح حقيقي وتفاعل معها (Clicking through) خلال أي
  جلسة من جلسات هذا المشروع. كل "الاختبار" كان عبر: نجاح `npm run build`، فحص HTTP status
  (`curl`)، وفحص نص HTML الأولي المُخدَّم لصفحة `/login`.

---

## C. Static/Structural Verified

| الفحص | النتيجة |
|---|---|
| `npm run build` (نظيف من الصفر، بعد حذف `.next/`) — أُعيد التحقق منه في هذه الجلسة تحديدًا | ✅ صفر أخطاء — 9 صفحات |
| كل حقول TypeScript types (`src/lib/types.ts`) قورنت مقابل استجابات Backend الحية فعليًا (وليس افتراضًا) | ✅ تطابق كامل لكل الحقول المستخدمة |
| كل استدعاء `apiRequest()` في كل صفحة قورن مقابل Controllers الفعلية (المسار + HTTP Method) | ✅ تطابق 100% |
| شكل استجابة `/admin/auth/login` (`accessToken`, `refreshToken`, `admin`) يطابق `LoginResponse` interface في `auth-context.tsx` | ✅ |
| لا توجد Mock Data أو Fake API في أي صفحة — كل صفحة تستدعي `apiRequest` حقيقي | ✅ تم فحص كل ملف صفحة يدويًا |
| لا توجد Secrets/كلمات مرور مكتوبة داخل الكود المصدري (فحص نصي شامل) | ✅ صفر نتائج (فقط أسماء متغيرات State طبيعية مثل `password`) |
| `.env.local` مستثنى من Git عبر `.gitignore` (نمط `.env*`) | ✅ |

---

## D. Not Runtime Tested

- تسجيل الدخول الفعلي (إدخال بيانات → توجيه → عرض Dashboard) بمتصفح حقيقي
- عمليات CRUD فعلية بالضغط على الأزرار (إنشاء/تعديل/حذف منتج أو فئة)
- سلوك حماية الـRoutes فعليًا (هل يُعاد التوجيه لـ`/login` فعلًا عند انتهاء الجلسة؟)
- عرض RTL الفعلي بصريًا في متصفح
- استجابة الواجهة على شاشات مختلفة الأحجام (Responsive behavior)

---

## E. Requires Local Environment

- Node.js لتشغيل `npm run dev` أو `npm run build && npm run start`
- الـBackend يجب أن يكون شغّالًا فعليًا على العنوان المحدد في `NEXT_PUBLIC_API_BASE_URL`

---

## F. Requires Firebase Setup

غير منطبق — لا تستخدم لوحة التحكم Firebase.

---

## G. Requires Payment Gateway Setup

غير منطبق مباشرة — صفحة Payment Methods تدير فقط تفعيل/تعطيل الطرق المسجَّلة في Backend،
لا تتطلب مفاتيح بوابة دفع خاصة بها.

---

## H. Requires Shipping Provider Setup

غير منطبق — الشحن يُدار يدويًا بالكامل من صفحة تفاصيل الطلب.

---

## I. Required Production Secrets

لا توجد Secrets خاصة باللوحة نفسها بخلاف `NEXT_PUBLIC_API_BASE_URL` (وهو ليس Secret بل رابط
عام، لأنه `NEXT_PUBLIC_*` ويُخبَز داخل الـBuild ويظهر في كود المتصفح — هذا متوقع وسليم لأنه
مجرد رابط API عام وليس مفتاحًا سريًا).

---

## J. Remaining Steps Before Launch

1. **قرار مطلوب:** هل نبني واجهة لتعديل الـ11 مفتاح إعداد المتبقية (Store Name، Contact، Social
   Media) الآن، أم تبقى تُدار مؤقتًا عبر Swagger/curl مباشرة حتى مرحلة تالية؟
2. **قرار مطلوب:** هل حقول Logo/Address/Google Maps/Support Hours مطلوبة قبل الإطلاق الأول؟
   (تتطلب أولًا إضافتها في Backend `settings` schema، ثم واجهة لها)
3. اختبار تفاعلي فعلي في متصفح حقيقي لكل الصفحات الموجودة حاليًا
4. تغيير `NEXT_PUBLIC_API_BASE_URL` لرابط الإنتاج قبل Build نهائي
5. اختيار منصة النشر (Vercel أو Docker/ECS) وإعدادها
6. **قرار أمني مطلوب:** هل تُنشَر اللوحة كموقع عام، أم تُقيَّد بـIP/VPN نظرًا لحساسية البيانات
   التي تديرها؟
