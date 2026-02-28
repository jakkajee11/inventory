# Inventory Management System Portfolio

Welcome to our modern, multi-tenant **Inventory Management System**. Built with NestJS and Next.js, this platform provides businesses with a seamless, scalable, and premium solution for managing their operations. 

Below is an overview of the platform's core features, accompanied by high-quality UI concepts that reflect our professional SaaS look and feel.

---

## 🌟 Core Features

### 🏢 **Multi-Tenant Architecture**
Built for scale, the platform supports true multi-tenancy. Each company operates in its own isolated environment with:
- Dedicated settings for currency, timezone, and company branding (logos).
- Granular Role-Based Access Control (RBAC) allowing roles like Admin, Manager, Staff, and Viewer.
- User management segmented securely by company and warehouse.

### 📦 **Comprehensive Product & Inventory Management**
Track and manage your entire catalog effortlessly:
- **Hierarchical Categories & Units:** Support for complex nested categories and base unit conversions (e.g., Box to Pieces).
- **Rich Product Data:** Track SKUs, barcodes, cost prices, selling prices, and min/max stock levels.
- **Multiple Warehouses:** Native support for tracking stock across default and secondary warehouses.
- **Real-Time Stock Calculations:** Automatically updates current stock, average costs, and dynamic balances after every movement.

### 🔄 **Stock Tracking & Movements**
An unbreakable audit trail for all your physical goods:
- **Goods Receipts (Inbound):** Log incoming stock from suppliers with receipt tracking, multi-item scanning, and approval workflows.
- **Goods Issues (Outbound):** Manage outbound operations such as sales, internal usage, or damaged goods processing.
- **Stock Adjustments:** Perform spot audits and periodic counts to keep the system aligned with physical inventory.

### 🔔 **Smart Alerts & Notifications**
Stay ahead of potential stockouts:
- **Automated Alerts:** Get notified instantly when products hit their Minimum Stock or run completely Out of Stock.
- **In-App & Email Delivery:** Flexible delivery channels for crucial system notifications or approval requests.

### 🔐 **Enterprise-Grade Security & Audit Logs**
- A detailed **Audit Log** tracks every critical action (Creates, Updates, Deletes, Approvals, Logins) across entities, complete with user IP, User-Agent, and before/after value snapshots.
- JWT-based authentication combined with strict module-level permissions ensures data is only accessed by authorized staff.

---

## 💻 UI Concepts & Previews

To demonstrate the application's clean design and premium interface, here are dynamic visual concepts modeled after our core capabilities:

### 1. Analytics & Overview Dashboard
A powerful overview giving managers a 10,000-foot view of stock movements and critical restock alerts.
![Inventory Dashboard](/Users/happydaddy/.gemini/antigravity/brain/b28b2112-a113-4884-8d39-7dfad52cca52/inventory_dashboard_1772269456893.png)

### 2. Product Management
A sleek table interface for easy management of products, complete with visual status indicators.
![Product Management](/Users/happydaddy/.gemini/antigravity/brain/b28b2112-a113-4884-8d39-7dfad52cca52/product_management_1772269473807.png)

### 3. Goods Receipt & Order Creation
A modern form interface designed for quick data-entry of incoming supplier shipments.
![Goods Receipt](/Users/happydaddy/.gemini/antigravity/brain/b28b2112-a113-4884-8d39-7dfad52cca52/goods_receipt_1772269493123.png)

---

## 🛠️ Tech Stack
- **Frontend:** Next.js, React, React Query, TailwindCSS
- **Backend:** NestJS, Prisma ORM, PostgreSQL, Redis
- **Infrastructure:** Docker, Turborepo Monorepo Architecture, GitHub Actions (CI/CD)
