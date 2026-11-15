# نظام فواتير OMS (OMS Invoice Management System)

> نظام ويب داخلي متكامل لإدارة وتنظيم واعتماد فواتير شركة **OMS** المتخصصة في التسويق والتصميم والبرمجيات بالجنيه المصري (EGP) دون الحاجة لـ Docker.

**التطوير والتنفيذ**: MDE – Matrix Data Egypt  
**الهوية المعتمدة**: الأحمر الأساسي (`#DC2626`)، الأسود الداكن (`#171717`)، والأبيض (`#FFFFFF`).

---

## 🚀 المعمارية التقنية (Tech Stack)

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + React Router (دعم كامل للعربية والإنجليزية والـ RTL/LTR).
- **Backend**: Node.js + Express + TypeScript + Prisma ORM + Zod Validation + JWT Authentication.
- **قاعدة البيانات**: PostgreSQL الأصلية المثبتة على الويندوز (Native Windows Service بدون دكر).

---

## 🛡️ الضوابط وقواعد الأعمال الصارمة (Strict Business Rules)

1. **حدود الاعتماد في جدول الإعدادات (`approval_rules`)**:
   - لا توجد حدود مالية مكتوبة داخل الكود (Hardcoded).
   - الحدود مخزنة في قاعدة البيانات في جدول `approval_rules` ومحمية بحيث لا يمكن تعديلها إلا من قِبل مسؤول النظام (**Admin**).
   - يتم التحقق برمجياً من عدم وجود أي تداخلات (Non-overlapping) وتغطية كافة المبالغ.

2. **مبدأ فصل المهام (Separation of Duties)**:
   - **يُمنع منعاً باتاً** أن يعتمد أي مستخدم فاتورة قام بإنشائها بنفسه (`creator_id !== approver_id`).

3. **إلغاء الاعتماد التلقائي عند التعديل المالي**:
   - أي تعديل في بنود الفاتورة أو المبالغ أو الخصومات بعد اعتمادها أو إصدارها يؤدي فوراً إلى إلغاء الاعتمادات السابقة وتصفيرها وإعادتها للمراجعة وتوثيق ذلك في `audit_logs`.

4. **تجميد الضرائب عند الإصدار (`invoice_taxes`)**:
   - تُحسب وتُسجل الضرائب (ضريبة القيمة المضافة 14% وضريبة الخصم 1%) في جدول مستقل `invoice_taxes` لحظة اعتماد وإصدار الفاتورة.

5. **فصل السجلات (Decoupled Tables)**:
   - `invoices`: بيانات الفاتورة الأساسية والمبالغ.
   - `approval_steps`: توثيق خطوات ومستويات الاعتماد.
   - `invoice_taxes`: الضرائب المجمدة للفاتورة.
   - `delivery_logs`: سجل محاولات الإرسال (PDF / Email / WhatsApp). فشل الإرسال لا يلغي الفاتورة ويمكن إعادة المحاولة.
   - `payments`: توثيق كل دفعة محصلة، طريقة الدفع، ورقم الإيصال.
   - `audit_logs`: سجل تتبع وتدقيق لجميع العمليات الحرجة.

6. **حساب التأخير ديناميكياً (Overdue)**:
   - محسوبة برمجياً بناءً على تاريخ الاستحقاق والرصيد المتبقي دون أي تدخل يدوي.

---

## 👥 مصفوفة الصلاحيات (RBAC)

| الوظيفة / الإجراء | Admin | Finance Manager | Accountant | Sales |
| :--- | :---: | :---: | :---: | :---: |
| إدارة المستخدمين والحدود (`approval_rules`) | ✓ | — | — | — |
| إدارة العملاء | ✓ | ✓ | ✓ | ✓ |
| إدارة دليل الخدمات والأسعار | ✓ | ✓ | — | — |
| إنشاء فاتورة جديدة | ✓ | ✓ | ✓ | — |
| مراجعة الفاتورة | ✓ | ✓ | — | — |
| اعتماد الفاتورة | ✓ | ✓ | — | — |
| تسجيل دفعة مالية | ✓ | ✓ | ✓ | — |
| إلغاء فاتورة | ✓ | ✓ | — | — |
| التقارير المالية ومؤشرات التحصيل | ✓ | ✓ | ✓ | — |
| سجل تدقيق العمليات (`audit_logs`) | ✓ | ✓ | — | — |

---

## 💻 طريقة التشغيل بدون Docker (Native Windows)

### 1. تشغيل خدمة PostgreSQL على الويندوز
لديك بالفعل **PostgreSQL 18** مثبتة على جهازك:
- يمكنك تشغيل الخدمة بضغطة زر عبر النقر بزر الفأرة الأيمن على ملف [start-postgres.bat](file:///e:/MDE/OMS/start-postgres.bat) واختيار **Run as administrator**.
- أو فتح موجه الأوامر (CMD) كمسؤول وتشغيل:
  ```cmd
  net start postgresql-x64-18
  ```

### 2. ضبط كلمة مرور قاعدة البيانات
في ملف [server/.env](file:///e:/MDE/OMS/server/.env)، تأكد من كتابة كلمة المرور الخاصة بمستخدم `postgres` التي حددتها عند تثبيت البرنامج:
```env
DATABASE_URL="postgresql://postgres:كلمة_المرور@localhost:5432/oms_invoice_db?schema=public"
```

### 3. إنشاء الجداول وتوليد البيانات الأولية
في مسار `server`:
```bash
cd server
npx prisma migrate dev --name init
npm run prisma:seed
```

### 4. تشغيل النظام بالكامل
يمكنك تشغيل الخادم والواجهة معاً بالنقر المزدوج على ملف [start-system.bat](file:///e:/MDE/OMS/start-system.bat)، أو يدوياً:
- **تشغيل الـ Backend**:
  ```bash
  cd server && npm run dev
  ```
- **تشغيل الـ Frontend**:
  ```bash
  cd client && npm run dev
  ```
- فتح المتصفح على: `http://localhost:5173` (أو `http://127.0.0.1:5173`)

---

## 🔑 الحسابات الافتراضية للاختبار (Seed Data)

كلمة المرور الموحدة لجميع الحسابات التجريبية: `Oms@123456`

- **Admin**: `admin@oms.com`
- **Finance Manager**: `finance@oms.com`
- **Accountant**: `accountant@oms.com`
- **Sales**: `sales@oms.com`
PS E:\MDE\OMS> DATABASE_URL="postgresql://postgres:aliahmeDali123@@localhost:5432/oms_invoice_db?schema=public