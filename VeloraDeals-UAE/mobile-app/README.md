# Velora Deals UAE — تطبيق الموبايل (Flutter)

هذا الدليل يشرح خطوة بخطوة كيفية تشغيل التطبيق على جهازك، لأن الكود اتكتب في بيئة سحابية بدون
اتصال بـ pub.dev، فلم يتم تشغيله فعليًا بعد. كل الكود حقيقي ومُراجَع يدويًا (الاستيرادات،
أسماء الحزم، المسارات، الإعدادات) لكن أول Build فعلي هيحصل عندك.

**قبل أي شيء، اقرأ `PRODUCTION_READINESS.md`** في نفس المجلد — يوضح بدقة الفرق بين ما تم
التحقق منه فعليًا وما ينتظر أول تشغيل حقيقي على جهازك.

---

## المتطلبات المطلوب تثبيتها على جهازك (Checklist)

| الأداة | مطلوبة؟ | لماذا |
|---|---|---|
| **Flutter SDK** | ✅ إلزامي | يشمل Dart SDK تلقائيًا بداخله - لا تحتاج تثبيت Dart بشكل منفصل |
| **Dart SDK** | ضمنيًا | يأتي مع Flutter SDK - لا تثبيت منفصل مطلوب |
| **Git** | ✅ إلزامي | لنقل/إدارة المشروع، ومطلوب أيضًا بواسطة Flutter SDK نفسه داخليًا |
| **Android Studio** | ✅ إلزامي لتطوير Android | يوفر Android SDK وAVD Manager (لإنشاء محاكيات) وأدوات Debugging |
| **Android SDK** | ✅ إلزامي لتطوير Android | يُثبَّت عادة تلقائيًا مع Android Studio (Settings → SDK Manager للتأكد) |
| **Xcode** | ✅ إلزامي لتطوير iOS | **فقط على macOS** - لا بديل له لبناء iOS، حتى لو كنت تستخدم VS Code كمحرر |
| **CocoaPods** | ✅ إلزامي لتطوير iOS | لإدارة مكتبات iOS الأصلية (`sudo gem install cocoapods`) |
| **VS Code أو Android Studio** (كمحرر) | اختياري لكن مُنصَح به | كلاهما يدعم Flutter رسميًا عبر Extension/Plugin |
| **حساب Google Play Console** | فقط عند النشر | رسوم اشتراك لمرة واحدة |
| **حساب Apple Developer** | فقط عند النشر على iOS | اشتراك سنوي |

**ملخص سريع:**
- **لتطوير Android فقط:** Flutter + Android Studio (يشمل Android SDK) + Git → يعمل على
  Windows / macOS / Linux
- **لتطوير iOS:** يلزم **جهاز Mac** + Xcode + CocoaPods بالإضافة لما سبق
- **Dart منفصل؟** لا - Flutter SDK يتضمن Dart SDK بداخله بالكامل

تحقق من اكتمال كل شيء بأمر واحد بعد التثبيت:
```bash
flutter doctor -v
```

---

## التسلسل المختصر (Copy-Paste سريع)

```bash
cd mobile-app
flutter pub get
flutter analyze
flutter test
flutter run
```

هذا هو التسلسل الفعلي المطلوب تشغيله بالترتيب. الشرح التفصيلي لكل خطوة (بما فيه إعداد
`.env` قبل `flutter pub get`) موجود في الأقسام التالية.

---

## تسلسل التشغيل الكامل (من الصفر لجهاز جديد)

```
1. تثبيت Flutter SDK
        ↓
2. Project Setup (نسخ/نقل المشروع + flutter create لتوليد الملفات الناقصة)
        ↓
3. Environment Variables (.env)
        ↓
4. flutter pub get
        ↓
5. flutter analyze
        ↓
6. flutter test
        ↓
7. flutter run
```

### الخطوة 1 — تثبيت Flutter SDK

اتبع الدليل الرسمي حسب نظام التشغيل: https://docs.flutter.dev/get-started/install

بعد التثبيت، تأكد إن كل حاجة تمام:
```bash
flutter doctor
```
يجب حل أي مشاكل يظهرها `flutter doctor` (خصوصًا Android toolchain وXcode) قبل المتابعة.

**متطلبات الإصدار (محدَّدة في `pubspec.yaml`):** Flutter >= 3.22.0 · Dart SDK >= 3.4.0

### الخطوة 2 — Project Setup

انسخ مجلد `mobile-app` كاملًا لجهازك، ثم من داخله شغّل:
```bash
cd mobile-app
flutter create --platforms=android,ios .
```
**هذا الأمر آمن تمامًا** ولن يمسح `lib/` أو `pubspec.yaml` أو أي كود موجود - وظيفته توليد الملفات
التي لا يمكن كتابتها يدويًا بأمان خارج بيئة Flutter الفعلية (Gradle Wrapper لـAndroid، ومشروع
Xcode الكامل لـiOS). التفاصيل الكاملة لماذا هذه الخطوة ضرورية موجودة في `PRODUCTION_READINESS.md`
(القسم D).

### الخطوة 3 — Environment Variables

المشروع يحتوي على `.env.example` كقالب (بدون أي قيم سرّية أو حقيقية — أسماء المتغيرات فقط).
انسخه إلى `.env` وعدّل القيم:

```bash
cp .env.example .env
```

الملف `.env` موجود بالفعل أيضًا في جذر المشروع بقيمة افتراضية جاهزة للتطوير المحلي (لو
حبيت تستخدمها مباشرة بدل النسخ):
```
API_BASE_URL=http://10.0.2.2:3000/api/v1
ENVIRONMENT=development
```

**مهم:**
- `10.0.2.2` هو عنوان خاص بمحاكي Android بيشاور على `localhost` بتاع جهازك
- على **جهاز Android حقيقي**: استبدله بـIP الفعلي لجهاز الكمبيوتر على نفس الشبكة (مثال:
  `http://192.168.1.5:3000/api/v1`)
- على **iOS Simulator**: استخدم `http://localhost:3000/api/v1` مباشرة
- قبل الإطلاق التجاري: استبدله برابط AWS الفعلي بعد نشر الـBackend

تأكد أن الـBackend شغّال فعليًا (`cd backend && npm run start:dev` أو `node dist/main.js`) قبل
تجربة أي شاشة تسجيل دخول أو تصفح، لأن التطبيق **لا يحتوي أي بيانات وهمية** ويعتمد بالكامل على
الـAPI الحقيقي.

### الخطوة 4 — flutter pub get
```bash
flutter pub get
```
يحمّل كل الحزم المذكورة في `pubspec.yaml` (29 حزمة أساسية + 8 حزم تطوير).

### الخطوة 5 — flutter analyze
```bash
flutter analyze
```
**هذا هو الفحص الحقيقي الوحيد** الذي يكشف أي خطأ Type أو Syntax لم تقدر المراجعة اليدوية
(الموضحة في `PRODUCTION_READINESS.md`) تكتشفه بدون Dart Analyzer فعلي.

### الخطوة 6 — flutter test
```bash
flutter test
```
يشغّل `test/theme_smoke_test.dart` - اختبار أساسي لا يعتمد على `.env` أو اتصال Backend، للتأكد
أن حزمة الثيم الأساسية تُبنى بدون أخطاء. اختبارات أعمق لكل feature لم تُكتب بعد (موضح في
`PRODUCTION_READINESS.md`).

### الخطوة 7 — flutter run
```bash
flutter run
```
تأكد أن الـBackend شغّال أولًا. لو عندك أكثر من جهاز/محاكي متصل، استخدم `flutter devices` لمعرفة
الأسماء ثم `flutter run -d <device_id>`.

---

## Backend APIs التي يعتمد عليها التطبيق

كل هذه المسارات مبنية فعليًا في `backend/src/modules/*` ومختبرة حيًا (انظر المحادثات السابقة
لأمثلة curl فعلية). القاعدة: `{API_BASE_URL}` = القيمة في `.env` (افتراضيًا
`http://10.0.2.2:3000/api/v1`).

| المسار | الطريقة | الوصف | يتطلب توثيق (JWT)؟ |
|---|---|---|---|
| `/auth/register` | POST | تسجيل بالبريد + كلمة مرور | ❌ |
| `/auth/login` | POST | دخول بالبريد + كلمة مرور | ❌ |
| `/auth/otp/request` | POST | طلب رمز OTP لرقم هاتف | ❌ |
| `/auth/otp/verify` | POST | تأكيد OTP ودخول/تسجيل تلقائي | ❌ |
| `/auth/refresh` | POST | تجديد Access Token | ❌ (يستخدم Refresh Token) |
| `/auth/logout` | POST | تسجيل خروج | ✅ |
| `/users/me` | GET/PATCH | بيانات الحساب الحالي | ✅ |
| `/addresses` | GET/POST | عناوين الشحن للمستخدم | ✅ |
| `/addresses/:id` | PATCH/DELETE | تعديل/حذف عنوان | ✅ |
| `/categories` | GET | الفئات المفعّلة | ❌ |
| `/products` | GET | المنتجات (مع `?categoryId=`) | ❌ |
| `/products/:id` | GET | تفاصيل منتج | ❌ |
| `/cart` | GET/DELETE | عرض/تفريغ السلة | ✅ |
| `/cart/items` | POST | إضافة عنصر للسلة | ✅ |
| `/cart/items/:id` | PATCH/DELETE | تعديل كمية/حذف عنصر | ✅ |
| `/orders` | GET/POST | طلباتي / إنشاء طلب جديد | ✅ |
| `/orders/:id` | GET | تفاصيل طلب | ✅ |
| `/orders/:id/cancel` | PATCH | إلغاء طلب | ✅ |
| `/payment-methods` | GET | طرق الدفع المفعّلة (COD حاليًا فقط) | ❌ |
| `/settings/public` | GET | بيانات التواصل والعملة العامة | ❌ |

**Endpoints غير موجودة بعد في Backend** (الشاشات المرتبطة بها تعمل بحلول مؤقتة موضّحة في
تعليقات الكود نفسه): `/wishlist/*`، بحث نصي مخصص `/products?search=`، `/notifications` (سجل
الإشعارات).

---

## Mock Data / Fake API — إفصاح كامل

**لا توجد أي Mock Data أو Fake API في مسارات الإنتاج (Production Paths).** كل شاشة تتحدث فعليًا
مع Backend حقيقي. الاستثناءات الوحيدة، موثّقة صراحة كتعليقات داخل الكود نفسه:

1. **`WishlistNotifier`** (`lib/features/wishlist/presentation/providers/wishlist_provider.dart`)
   — حالة محلية في الذاكرة (In-memory) فقط، لأن Backend لا يحتوي بعد على `/wishlist` endpoints.
   ليست بيانات وهمية بمعنى "بيانات تجريبية معروضة للخداع" - هي حالة تفاعل مستخدم حقيقية، لكنها
   غير محفوظة على السيرفر ولا تُزامَن بين الأجهزة حاليًا.
2. **`SearchScreen`** — يجلب كل المنتجات الحقيقية من `/products` ثم يفلترها محليًا بالاسم، لعدم
   وجود `search` parameter مخصص في الـBackend بعد. البيانات حقيقية 100%، فقط آلية الفلترة مؤقتة.
3. **`NotificationsScreen`** — واجهة فارغة (Empty State) فقط، لا يوجد استدعاء API لأن Endpoint
   السجل غير موجود بعد.

لا يوجد أي Placeholder Data لمنتجات أو طلبات أو مستخدمين في أي مكان آخر بالتطبيق.

---

## دخول المسؤول (Admin) من داخل التطبيق

التطبيق يحتوي الآن على شاشة دخول مسؤول منفصلة تمامًا عن دخول العملاء (رابط "دخول كمسؤول
(Admin)" أسفل شاشة تسجيل الدخول العادية). بعد الدخول الناجح، تُعرض لوحة تحكم مبسّطة (إحصائيات
وأحدث الطلبات) بدلًا من واجهة العميل، عبر جلسة وتوكن منفصلين بالكامل عن جلسة العميل.

**بيانات الحساب التجريبي** (مزروعة في قاعدة بيانات Backend عبر `npm run seed`، **وليست مكتوبة
في أي مكان داخل كود Flutter**):
```
Email:    admin@myapp.com
Password: Admin@123456
```

**قبل استخدام هذا الحساب، يجب:**
1. تشغيل Backend فعليًا (`cd backend && npm run migration:run && npm run seed && npm run start`)
2. التأكد أن `API_BASE_URL` في `.env` بتطبيق Flutter يشاور فعليًا على نفس الـBackend

**غيّر كلمة المرور فورًا** قبل أي استخدام حقيقي (عبر تحديث مباشر في قاعدة البيانات أو إضافة
Endpoint لتغيير كلمة المرور لاحقًا — غير موجود حاليًا).

---

## بناء نسخة Android APK للاختبار على هاتفك

**لم يُبنَ أي APK داخل بيئة التطوير السحابية** لأنها لا تحتوي Flutter/Android SDK ولا يمكنها
الوصول لمصادر تحميلهما. على جهازك، بعد إكمال الخطوات 1-4 أعلاه (تثبيت Flutter، `flutter pub
get`، إعداد `.env`، `flutter create --platforms=android .`):

```bash
flutter build apk --debug
```

**استخدم `--debug` وليس `--release` للاختبار السريع على هاتفك الشخصي** — لا يحتاج Keystore
توقيع حقيقي (يستخدم مفتاح Debug تلقائي من Android SDK)، وقابل للتثبيت مباشرة. الملف الناتج:
```
build/app/outputs/flutter-apk/app-debug.apk
```

انسخه لهاتفك (عبر USB، أو رابط تحميل من Google Drive، أو `adb install`)، فعّل "تثبيت من مصادر
غير معروفة" في إعدادات الهاتف، وثبّته.

لنسخة أقرب للإنتاج (لكن لا تزال للاختبار، ليست جاهزة للمتجر):
```bash
flutter build apk --release
```
هذه تستخدم أيضًا Debug Signing افتراضيًا حاليًا (`android/app/build.gradle` لم يُضبَط بمفتاح
Release حقيقي بعد — انظر قسم "إنشاء Production Build" أدناه) لذا فهي مناسبة للاختبار الشخصي
لكن **غير صالحة للرفع على Google Play** بصيغتها الحالية.

---



```bash
flutter pub run flutter_launcher_icons
flutter pub run flutter_native_splash:create
```
هذا يولّد كل أحجام الأيقونات المطلوبة تلقائيًا من `assets/images/velora_logo.jpg` (اللوجو
الرسمي المرفوع فعليًا، وليس أي Placeholder).

---

## ربط Firebase (لتفعيل Push Notifications الفعلي)

راجع `PRODUCTION_READINESS.md` (القسم E) لتفاصيل كاملة عن المخاطر المحتملة وخطوات الحل. ملخص
الخطوات:

1. أنشئ مشروع على https://console.firebase.google.com باسم "Velora Deals UAE"
2. أضف تطبيق Android بـ Package Name: `com.veloradeals.uae` → حمّل `google-services.json` وضعه
   في `android/app/`
3. أضف تطبيق iOS بـ Bundle ID: `com.veloradeals.uae` → حمّل `GoogleService-Info.plist` وضعه في
   `ios/Runner/`
4. في `lib/main.dart`، فعّل السطر المُعلَّق: `await Firebase.initializeApp();`

---

## إنشاء Production Build

### Android (APK للتجربة المباشرة)
```bash
flutter build apk --release
```
الملف الناتج: `build/app/outputs/flutter-apk/app-release.apk`

### Android (App Bundle لرفعه على Google Play)
```bash
flutter build appbundle --release
```
**قبل هذه الخطوة، لازم تنشئ Keystore حقيقي** (بدلًا من debug signing المستخدم حاليًا):
```bash
keytool -genkey -v -keystore velora-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias velora
```
ثم أنشئ `android/key.properties` واربطه في `android/app/build.gradle` بدلاً من
`signingConfigs.debug`.

### iOS (لرفعه على App Store)
```bash
flutter build ipa --release
```
يتطلب Apple Developer Account فعّال وCertificates/Provisioning Profiles معدّة في Xcode.

---

## Checklist قبل الإطلاق التجاري الفعلي

راجع `PRODUCTION_READINESS.md` (القسم G) للقائمة الكاملة المرتبة بالخطوات.

