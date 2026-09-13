# Velora Deals UAE — Admin Dashboard (Next.js)

لوحة تحكم حقيقية (Next.js 16 + React 19 + Tailwind) تتحدث مباشرة مع الـBackend الفعلي —
لا بيانات وهمية، كل شاشة (الطلبات، المنتجات، الفئات، طرق الدفع، الإعدادات) تقرأ وتكتب من
الـAPI الحقيقي. راجع `PRODUCTION_READINESS.md` في هذا المجلد للتفاصيل الكاملة.

---

## التشغيل المحلي

```bash
npm install
cp .env.example .env.local
npm run dev
```

يفتح على `http://localhost:3000` افتراضيًا. **لازم الـBackend يكون شغّال أولًا** (راجع
`../backend/README.md`) لأن اللوحة لا تعمل بدونه بالكامل.

بيانات دخول الـSuper Admin الافتراضية (من seed الـBackend):
`admin@veloradeals.ae` / `ChangeMe123!`

---

## Environment Variables

| المتغير | الوصف | القيمة الحالية (`.env.local`) |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | رابط الـBackend API | `http://localhost:3000/api/v1` |

**قبل النشر:** غيّر القيمة لرابط الـBackend الفعلي على AWS (مثال:
`https://api.veloradeals.ae/api/v1`).

---

## الصفحات المبنية

| المسار | الوظيفة |
|---|---|
| `/login` | دخول الأدمن (JWT حقيقي عبر `/admin/auth/login`) |
| `/` | لوحة قيادة بإحصائيات حية من الطلبات الفعلية |
| `/orders` + `/orders/[id]` | إدارة كاملة: مراجعة، تأكيد COD، تحديث حالة الطلب خطوة بخطوة، تتبع شحن يدوي |
| `/products` | CRUD كامل للمنتجات |
| `/categories` | CRUD كامل للفئات |
| `/payment-methods` | تفعيل/تعطيل طرق الدفع (COD فقط شغالة حاليًا) |
| `/settings` | تعديل حي لـShipping Fee وVAT وCOD Default Status وغيرها |

كل صفحة محمية بـ `AuthProvider` (`src/lib/auth-context.tsx`) — تعيد التوجيه لـ`/login`
تلقائيًا لو لم يكن هناك جلسة صالحة.

---

## Build للإنتاج

```bash
npm run build
npm run start
```

تم التحقق أن `npm run build` ينجح بدون أخطاء (Next.js 16، React 19، TypeScript صارم) — راجع
`PRODUCTION_READINESS.md`.

---

## النشر (Deployment)

اللوحة تطبيق Next.js قياسي، يمكن نشرها على أي منصة تدعم Next.js (Vercel، AWS Amplify، أو
كحاوية Docker على نفس ECS Cluster الخاص بالـBackend). لم يتم إعداد أي نشر فعلي بعد — راجع
`PRODUCTION_READINESS.md` (القسم D) للخطوات المتبقية.
