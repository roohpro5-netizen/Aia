# 🚀 دليل النشر السحابي التلقائي عبر GitHub و Cloudflare
### منصة الذكاء الاصطناعي Rooh AI (`roohpro.com/ai`)

تم إعداد وتجهيز مستودع التطبيق بالكامل ليتم رفعه إلى **GitHub** ومزامنته تلقائياً مع **Cloudflare Pages & Workers** عبر **GitHub Actions CI/CD**.

---

## 🔐 1. إعداد أسرار المستودع على GitHub (Repository Secrets)

عند رفع الكود إلى مستودعك على GitHub، انتقل إلى:
**GitHub Repo -> Settings -> Secrets and variables -> Actions -> New repository secret**

وقم بإضافة المتغيرات السرية التالية:

| اسم السر (Secret Name) | البديل المدعوم | الوصف | المصدر |
| :--- | :--- | :--- | :--- |
| `CLOUDFLARE_API_TOKEN` | `CF_TOKEN` | توكن الـ API الخاص بحسابك على Cloudflare مع صلاحيات `Cloudflare Pages (Edit)` | من لوحة Cloudflare -> My Profile -> API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | `CF_ACCOUNT_ID` | معرّف الحساب الرئيسي (Account ID) | من الشريط الجانبي في لوحة Cloudflare |
| `GEMINI_API_KEY` | — | مفتاح Google Gemini API لتوليد البرومبتات وهندسة الأوامر | Google AI Studio |

---

## 🛠️ 2. الملفات المجهزة داخل المشروع

1. **`wrangler.toml`:**
   - ملف الإعداد الرسمي لسحابة Cloudflare Workers & Pages.
   - يربط مستودع التخزين **R2 (`ROOH_STORAGE_R2`)**، وقاعدة بيانات **D1 (`ROOH_D1_DATABASE`)**، وكاش الحافة **KV (`ROOH_KV_CACHE`)**.

2. **`functions/[[path]].ts`:**
   - خادم الحافة (Edge Worker / Pages Function).
   - مسؤول عن توجيه محركات البحث، وتوليد خرائط الموقع الديناميكية XML، وتقديم معاينات OpenGraph للروبوتات، وتطبيق معايير الأمان والحماية (Security Headers).

3. **`.github/workflows/deploy-cloudflare.yml`:**
   - سير عمل الأتمتة (CI/CD) الذي يبني التطبيق وينشره تلقائياً فورياً عند دفع أي تحديث لفرع `main`.

4. **`public/_redirects` & `public/_headers`:**
   - قواعد التوجيه لتطبيقات الصفحة الواحدة (SPA) للمسارات `/ai/*` و `/window/*` و `/item/*`.
   - إعدادات الكاش وحماية المتصفحات.

5. **`public/robots.txt` & `public/sitemap.xml`:**
   - فهارس الأرشفة الأولية المتوافقة مع الدومين الرئيسي `roohpro.com`.

---

## 🔄 3. دورة التحديث التلقائي (Google AI Studio -> GitHub -> Cloudflare)

1. يقوم المطور بإجراء التعديلات وتطوير الميزات مباشرة في Google AI Studio.
2. يتم إرسال التحديثات (Push/Export) إلى مستودع **GitHub**.
3. يقوم **GitHub Actions** فوراً بالتقاط التحديث وبناء التطبيق بشكل آمن دون تسريب أي مفاتيح سرية.
4. يُنشر الإصدار الجديد فوراً على شبكة **Cloudflare** العالمية ويصبح متاحاً على الرابط المعتمد:
   👉 **`https://roohpro.com/ai`**
