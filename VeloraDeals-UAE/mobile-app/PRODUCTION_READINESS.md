# PRODUCTION_READINESS.md — Velora Deals UAE Mobile App

هذا التقرير هو النسخة النهائية بعد مرحلة **FINAL INTEGRATION & PRODUCTION VALIDATION** — يراجع
التطبيق كطرف في منظومة كاملة (Mobile ↔ Backend ↔ Database)، مع تركيز خاص على تطابق الـAPI
Contracts الفعلي (وليس الافتراضي).

---

## A. Completed

- 60 ملف Dart، Clean Architecture كاملة، 18 feature module
- الشاشات الأساسية: Splash, Onboarding, Login, Register, OTP, Home, Categories, Search,
  Product Listing/Details, Wishlist, Cart, Checkout, Addresses, Orders, Profile, Settings,
  Support/Contact Us, About Us
- **جديد: Admin Login + Admin Dashboard مبسّطة داخل التطبيق** — جلسة أدمن منفصلة تمامًا عن
  جلسة العميل (تخزين، توكن، منطق تحديث/انتهاء صلاحية كلها مستقلة)، تتحدث حصريًا مع
  `/admin/auth/login` و`/admin/orders` بتوكن أدمن حقيقي. حساب تجريبي (`admin@myapp.com`) زُرع
  في Backend عبر seed script — **غير مكتوب في أي مكان داخل كود Flutter**. تحقق حي (curl) في
  هذه الجلسة يثبت أن حساب عميل عادي حقيقي يُرفَض تمامًا عند محاولة استخدامه على مسار الأدمن
- اللوجو الرسمي، Theme، Router، API Client (Dio + Auto Token Refresh)

---

## B. Runtime Tested

**لا شيء** — لا يوجد Flutter/Dart runtime في هذا الـSandbox. لم يُشغَّل `flutter pub get` ولا
`flutter analyze` ولا `flutter test` ولا `flutter run` في أي جلسة من جلسات هذا المشروع. هذا لم
يتغيّر منذ آخر تقرير.

---

## C. Static/Structural Verified

هذا القسم هو الأهم في مرحلة التكامل الحالية — تم التحقق **الحي** (وليس افتراضًا) من تطابق كل
عقد API بين التطبيق والـBackend الفعلي المُشغَّل:

| الفحص | النتيجة |
|---|---|
| كل الـ135 استيراد نسبي (relative imports) يُحل لملف موجود | ✅ |
| كل الـ14 حزمة مستخدمة موجودة في `pubspec.yaml` | ✅ |
| كل الـ24 Riverpod provider المستخدمة معرَّفة | ✅ |
| كل route مستخدم مطابق لتعريفات `go_router` | ✅ |
| **`ApiPaths` (18 مسار في `app_constants.dart`) قورنت مباشرة مقابل الـController الفعلي المُشغَّل حيًا في هذه الجلسة** — تطابق 100% في المسار والـHTTP Method | ✅ |
| **حقول `AuthTokens`/`UserProfile` Dart models قورنت مقابل استجابة `/auth/register` و`/users/me` الحية** | ✅ تطابق |
| **حقول `Product`/`Category`/`ProductVariant` Dart models قورنت مقابل استجابة `/products` و`/categories` الحية** (نفس الـEntities المستخدمة في Admin Dashboard، فُحصت بالفعل في هذه الجلسة) | ✅ تطابق |
| **حقول `CartModel`/`CartItemModel` قورنت مقابل بنية استجابة `CartService` في Backend** | ✅ تطابق |
| **حقول `OrderModel`/`OrderItemModel` قورنت مقابل استجابة `/admin/orders` الحية (نفس الـEntity)** | ✅ تطابق |
| **`PublicStoreSettings.fromJson` يقرأ بالضبط الـ11 مفتاحًا المُعرَّفة في `PUBLIC_SETTING_KEYS` بالـBackend، لا أكثر ولا أقل** | ✅ تطابق دقيق |
| لا يوجد Secret أو API Key أو DB Credential مكتوب داخل كود التطبيق (فحص نصي شامل) | ✅ صفر نتائج |
| صفر ذكر لـ SAR/ريال، AED مستخدمة حصريًا | ✅ |
| Authorization: التطبيق لا يستخدم أي مسار `/admin/*` إطلاقًا — فصل تام عن صلاحيات الأدمن | ✅ |

---

## D. Not Runtime Tested (تفصيل — كل ما هو غير Static Verified في القسم C يقع هنا تلقائيًا)

- **Android APK: لم يُبنَ ولن يُبنى داخل هذا الـSandbox.** تحقق مباشر في هذه الجلسة: لا يوجد
  `flutter`/`dart`/`gradle` مثبت، ولا يمكن تثبيتهم لأن الشبكة المتاحة هنا تمنع صراحة الوصول لـ
  `storage.googleapis.com` (مصدر تحميل Flutter SDK وGradle dependencies) — تحقق فعلي بطلب HTTP
  رجع `403 host_not_allowed`. **أي ادّعاء ببناء APK هنا سيكون غير صحيح.** البناء الفعلي يجب أن
  يتم على جهازك بعد نقل المشروع (خطوات دقيقة في `README.md`).

- أي تفاعل بصري فعلي (لا توجد لقطة شاشة أو تشغيل واحد تم فحصه بصريًا)
- سلوك RTL الفعلي على الشاشة
- التنقل الفعلي بين الشاشات أثناء التشغيل
- حفظ/قراءة Secure Storage فعليًا على جهاز حقيقي
- Auto Token Refresh عند انتهاء صلاحية Access Token فعليًا أثناء تشغيل حقيقي

---

## E. Requires Local Environment

- Flutter SDK ≥3.22 + Dart SDK ≥3.4 (يأتي مع Flutter)
- `flutter create --platforms=android,ios .` لتوليد Gradle Wrapper ومشروع Xcode الكامل
- Backend شغّال فعليًا (`API_BASE_URL` في `.env` يجب أن يشاور عليه)

---

## F. Requires Firebase Setup

- `firebase_core`/`firebase_messaging` في `pubspec.yaml` لكن **غير مربوطة بمشروع Firebase
  حقيقي** — `Firebase.initializeApp()` معلَّق عمدًا في `main.dart`
- **تحذير معروف:** وجود هاتين الحزمتين قد يتطلب `google-services.json`/
  `GoogleService-Info.plist` عند أول Android/iOS build حتى قبل الاستخدام الفعلي — الحل السريع
  المؤقت موثّق في `README.md`

---

## G. Requires Payment Gateway Setup

**غير مطلوب حاليًا.** تحقق مؤكد: لا يوجد أي كود في `CheckoutScreen` أو أي مكان آخر يفتح بوابة
دفع أو WebView — الطلب يُنشأ مباشرة عبر `paymentMethodCode: 'cod'`، ورسالة النجاح تعرض بوضوح
"قيد المراجعة (Pending)" و"الدفع نقدًا عند الاستلام" (نص فعلي في `order_success_screen.dart`،
تم فحصه مباشرة في هذه الجلسة).

---

## H. Requires Shipping Provider Setup

**غير مطلوب حاليًا.** التطبيق يعرض فقط `trackingNumber`/`shippingCarrierName` كما يرجعهما
Backend (تُدخَل يدويًا من الأدمن) — لا يوجد أي تكامل شحن آلي في كود التطبيق.

---

## I. Required Production Secrets

**لا توجد Secrets مطلوبة من جهة التطبيق نفسه.** كل ما يحتاجه هو `API_BASE_URL` (رابط عام وليس
سريًا) في `.env`، والذي يجب تغييره لرابط الإنتاج الفعلي قبل أي Build نهائي. أي مفاتيح Firebase
مستقبلية (`google-services.json`) ليست Secrets بالمعنى الحساس (هي معرّفات تطبيق عامة تُنشر مع
كل تطبيق Firebase أصلًا) لكنها لا تزال غير موجودة حاليًا.

---

## J. Remaining Steps Before Launch

1. نقل المشروع لجهاز فيه Flutter مثبت وتشغيل `flutter pub get` → `flutter analyze` → إصلاح أي
   أخطاء تظهر (هذه هي الخطوة الحرجة الوحيدة المتبقية لتحويل "Static Verified" إلى "Runtime
   Tested" فعليًا)
2. `flutter create --platforms=android,ios .`
3. `flutter test` ثم `flutter run` مع Backend شغّال، واختبار كل الشاشات يدويًا
4. **ملاحظة تكاملية مهمة من مراجعة هذه الجلسة:** صفحة الإعدادات في Admin Dashboard لا تعرض
   واجهة لتعديل بيانات التواصل/السوشيال ميديا (رغم أن `/settings/public` الذي يعتمد عليه هذا
   التطبيق يعمل بشكل صحيح ويقرأ منها). هذا لا يمنع عمل هذا التطبيق، لكنه يعني أن أي تعديل فعلي
   لبيانات التواصل حاليًا يتطلب استخدام Swagger/curl مباشرة على Backend وليس عبر لوحة تحكم
   بصرية — راجع `admin-dashboard/PRODUCTION_READINESS.md` للتفاصيل
5. توليد الأيقونات والـSplash من اللوجو الرسمي
6. إعداد Firebase الحقيقي أو حذف الحزمتين مؤقتًا
7. تغيير `API_BASE_URL` لرابط الإنتاج بعد نشر Backend
