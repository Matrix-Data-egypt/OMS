# نظام فواتير وميديا OMS (OMS Business Suite)

> نظام ويب داخلي متكامل لإدارة وتنظيم فواتير وحملات ميديا شركة **OMS** المتخصصة في التسويق والتصميم والبرمجيات بالجنيه المصري (EGP).

**التطوير والتنفيذ**: MDE – Matrix Data Egypt  
**الهوية المعتمدة**: الأحمر الأساسي (`#DC2626`)، الأسود الداكن (`#171717`)، والأبيض (`#FFFFFF`).

---

## 📁 أقسام النظام (System Modules)

1. **نظام المحاسبة والفواتير (OMS Invoice)**:
   - `server/`: خادم Node.js + Express على المنفذ `5001`.
   - `client/`: واجهة React + Vite على المنفذ `5173`.
   - دورة حياة الفاتورة، الاعتماد المالي، الضرائب (14% VAT و 1% WHT)، مبدأ فصل المهام.

2. **قسم الميديا والإعلانات (OMS Media)**:
   - `media/backend/`: خادم Node.js + Express على المنفذ `5002`.
   - `media/frontend/`: واجهة React + Vite على المنفذ `5174`.
   - صفحات مخصصة لإدارة:
     - **العملاء (Clients)**: إدخال الاسم بالكامل فقط.
     - **الموردين (Suppliers)**: إدخال الاسم فقط (Meta, Google, TikTok...).
     - **القنوات (Channels)**: إدخال اسم القناة الإعلانية فقط.
     - **أنواع المحتوى (Content Types)**: اسم النوع وتوليد معرّف (ID) فريد للربط.
     - **المحتوى (Content)**: اسم المحتوى وربطه مع نوع المحتوى عبر الـ ID.
     - **لوحة التحكم (Dashboard)**: محرك بحث ذكي وفلاتر متقدمة على نظام **Kaggle** (Client, Supplier, Channel, Content, Month).
     - **الربط مع قسم المحاسبة**: زر بضغطة واحدة لإصدار فاتورة رسمية في نظام المحاسبة من أي حملة ميديا!

---

## 🚀 تشغيل النظام (Quick Start)

### 1. تشغيل قسم الميديا (Media Department):
يمكنك تشغيل قسم الميديا بضغطة زر عبر النقر المزدوج على:
👉 [start-media.bat](file:///e:/MDE/OMS/start-media.bat)

أو يدوياً عبر موجه الأوامر:
- **الخادم (Backend)**:
  ```bash
  cd media/backend
  npm run dev
  ```
- **الواجهة (Frontend)**:
  ```bash
  cd media/frontend
  npm run dev
  ```
- **رابط الواجهة**: `http://localhost:5174`

---

### 2. تشغيل قسم المحاسبة والفواتير (Invoice Department):
👉 [start-system.bat](file:///e:/MDE/OMS/start-system.bat)
- **الخادم (Backend)**: يعمل على `http://localhost:5001`
- **الواجهة (Frontend)**: تعمل على `http://localhost:5173`
