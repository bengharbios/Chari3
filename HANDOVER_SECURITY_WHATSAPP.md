# ChariDay - Project Handover & Next Steps

## 📌 الحالة الحالية للمشروع (Current State)
تم الانتهاء بنجاح من بناء وتطوير **نظام الأمان والدخول (Security & Access)** في لوحة تحكم الإدارة (Super Admin). النظام الآن متكامل ويدعم اللغتين العربية والإنجليزية (مع دعم فرنسي جزئي)، ويدعم اتجاهات العرض (RTL/LTR) بالكامل.

### ✅ ما تم إنجازه:
1. **قاعدة البيانات (Prisma):**
   - إضافة جدول `AuthLog`: لتسجيل جميع محاولات الدخول والتسجيل (الناجحة والفاشلة)، مع تسجيل (IP, الدولة، الجهاز، المتصفح، الطريقة).
   - إضافة جدول `BannedEntity`: لتسجيل الكيانات المحظورة (رقم هاتف، بريد إلكتروني، IP، أو دولة كاملة)، مع تحديد مدة الحظر (مؤقت أو دائم) وسبب الحظر.

2. **الواجهات الأمامية (UI/UX):**
   - إنشاء صفحة **سجلات المصادقة (Auth Logs)**: تعرض الجداول مع فلاتر حسب الحالة (نجاح، فشل، إلخ) والطريقة (SMS، بريد، واتساب).
   - إنشاء صفحة **قائمة الحظر (Ban List)**: تعرض الكيانات المحظورة، مع إمكانية إضافة حظر جديد يدوياً، وحظر دولة بالكامل عبر قائمة منسدلة.
   - إضافة شريط التنقل بين الصفحات (Pagination) وإمكانية تحديد عدد السجلات في كل صفحة (10, 20, 50, 100).
   - دعم كامل للغة العربية (RTL) في الجداول (تم تعديل `TableHead` في مكونات Shadcn).

3. **الترجمة واللغات (i18n):**
   - إضافة جميع النصوص والمفاتيح المتعلقة بقسم الأمان إلى ملفات `ar.json`، `en.json`، و `fr.json`.
   - ترجمة القوائم المنسدلة للفلترة.

4. **القائمة الجانبية (Admin Sidebar):**
   - إنشاء قسم جديد باسم "الأمان والدخول" ونقل إعدادات (Auth & OTP) إليه.

---

## 🚀 الخطوة التالية (Next Steps)
المشروع جاهز الآن للانتقال إلى المرحلة التالية وهي: **دمج بوابة إرسال رسائل الواتساب (WhatsApp Gateway Integration)**.

### 📝 المطلوب تنفيذه في الجلسة القادمة:
1. **ربط مزود خدمة الواتساب (WhatsApp Provider):**
   - إعداد ملفات API للاتصال بمزود الواتساب (مثل Twilio, Meta Graph API, أو مزود محلي).
   - إنشاء دالة مساعدة (Helper Function) في `src/lib/` لإرسال رسائل OTP عبر الواتساب.
   
2. **تحديث واجهة تسجيل الدخول (Auth UI):**
   - في مكونات تسجيل الدخول، عند اختيار المستخدم لتسجيل الدخول أو التسجيل برقم الهاتف، يجب توفير خيار إرسال الكود عبر "WhatsApp" كبديل أو كخيار افتراضي.
   
3. **تحديث الـ Backend (API Routes):**
   - تعديل مسارات تسجيل الدخول `src/app/api/auth/...` لإنشاء الكود (OTP) وإرساله عبر دالة الواتساب الجديدة.
   - تسجيل هذه العملية (ناجحة أو فاشلة) في جدول `AuthLog` مع تحديد الطريقة `whatsapp`.

4. **التحقق والحماية:**
   - تطبيق قيود الإرسال (Rate Limiting) لمنع الإرسال العشوائي وإرهاق الرصيد.
   - التأكد من فحص رقم الهاتف في جدول `BannedEntity` قبل الإرسال لمنع إرسال رسائل للأرقام المحظورة.

---

## 💻 تعليمات للذكاء الاصطناعي القادم (Prompt for the Next AI)
إذا كنت ستكمل العمل مع ذكاء اصطناعي آخر (مثل Claude أو ChatGPT)، انسخ له هذا النص:

> "We are working on the ChariDay platform (Next.js App Router, Prisma, Tailwind, NextAuth). The Security & Access module (AuthLog, BannedEntity) is fully complete. Now, I need to implement the WhatsApp OTP Gateway. Please review the existing authentication logic in `src/app/api/auth/` and create a WhatsApp sending helper in `src/lib/whatsapp.ts`. Then, modify the OTP generation endpoint to send the code via WhatsApp and log the attempt in `AuthLog` with method 'whatsapp'. Ensure you check if the phone number is banned in `BannedEntity` before sending."

