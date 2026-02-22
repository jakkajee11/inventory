# Feature Specification: Inventory Management System MVP

**Feature Branch**: `001-inventory-management`
**Created**: 2026-02-22
**Status**: Draft
**Input**: User description: "Inventory Management System MVP for SME business with Product Management, Inventory Tracking, Goods Receipt, Goods Issue, Basic Reports, User Management, and Alert/Notification System"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Product Management (Priority: P1)

As a warehouse manager, I need to manage product catalog so that inventory data is accurate and up-to-date. This includes creating products with SKU, barcode, name, category, unit, prices (cost and selling), and uploading product images.

**Why this priority**: Product data is the foundation of all inventory operations. Without products in the system, no other features (receipts, issues, reports) can function.

**Independent Test**: Can be fully tested by creating a new product with all required fields, editing its details, searching by SKU/name/barcode, and soft-deleting it while preserving history.

**Acceptance Scenarios**:

1. **Given** I am logged in as a Manager, **When** I create a new product with SKU "SKU-001", name "Test Product", category, unit, cost price 100, selling price 150, **Then** the product is saved and visible in the product list
2. **Given** a product exists with SKU "SKU-001", **When** I search for "SKU-001" or "Test Product", **Then** the product appears in search results
3. **Given** a product exists, **When** I soft-delete it, **Then** the product is hidden from lists but all historical transactions remain intact

---

### User Story 2 - Real-time Inventory Tracking (Priority: P1)

As a business owner, I need to see current stock levels in real-time so that I can make informed purchasing decisions. I need to view stock quantities, movement history, and export data.

**Why this priority**: Real-time visibility is the core value proposition - SMEs struggle with not knowing their current stock levels.

**Independent Test**: Can be fully tested by viewing the inventory dashboard showing all products with their current stock levels, filtering by date/product, and exporting to Excel/CSV.

**Acceptance Scenarios**:

1. **Given** products exist with stock movements, **When** I view the inventory page, **Then** I see all products with accurate current stock quantities
2. **Given** a product has movement history, **When** I view the product's movement history, **Then** I see all IN/OUT/ADJUST movements with dates, quantities, and references
3. **Given** I am viewing inventory data, **When** I click Export, **Then** a CSV/Excel file is downloaded with current stock data

---

### User Story 3 - Goods Receipt (Priority: P1)

As a warehouse staff, I need to record incoming goods so that stock increases and there is evidence of receipt. Each receipt can have multiple product lines with quantities and unit costs.

**Why this priority**: Receiving goods is a daily operation - without it, stock never increases in the system.

**Independent Test**: Can be fully tested by creating a goods receipt with supplier info, adding multiple product lines, submitting for approval, and verifying stock increases after approval.

**Acceptance Scenarios**:

1. **Given** I am logged in as Staff, **When** I create a goods receipt with supplier name "ABC Corp" and add 2 product lines (Product A: 10 units @ 50, Product B: 20 units @ 30), **Then** the receipt is created with status DRAFT and total amount 1,100
2. **Given** a goods receipt exists in DRAFT status, **When** I submit it for approval, **Then** status changes to PENDING and an Admin/Manager can approve it
3. **Given** a goods receipt is APPROVED, **When** I view the inventory, **Then** stock quantities for all products in the receipt have increased

---

### User Story 4 - Goods Issue (Priority: P1)

As a warehouse staff, I need to record outgoing goods so that stock decreases and there is evidence of issuance. The system must prevent issuing more than available stock.

**Why this priority**: Issuing goods is a daily operation - without it, stock never decreases in the system.

**Independent Test**: Can be fully tested by creating a goods issue with reason, adding product lines, submitting for approval, and verifying stock decreases after approval.

**Acceptance Scenarios**:

1. **Given** I am logged in as Staff and Product A has 50 units in stock, **When** I create a goods issue for Product A with 30 units, **Then** the issue is created with status DRAFT
2. **Given** Product A has 10 units in stock, **When** I try to issue 15 units, **Then** the system shows an error "Insufficient stock" and prevents the transaction
3. **Given** a goods issue is APPROVED, **When** I view the inventory, **Then** stock quantities for all products in the issue have decreased

---

### User Story 5 - Stock Adjustment (Priority: P2)

As a warehouse manager, I need to adjust stock quantities when physical counts differ from system records, so that inventory remains accurate. Adjustments can be increases or decreases with documented reasons.

**Why this priority**: Physical counts rarely match system records - adjustments are necessary for accuracy but can wait until core receipt/issue flows work.

**Independent Test**: Can be fully tested by creating a stock adjustment document, specifying before/after quantities, and verifying the adjustment reflects in inventory.

**Acceptance Scenarios**:

1. **Given** Product A shows 100 units in system but physical count is 95, **When** I create a stock adjustment with quantity_after = 95 and reason "Physical count", **Then** an adjustment document is created
2. **Given** a stock adjustment is APPROVED, **When** I view the product's stock, **Then** it shows 95 units and the movement history shows an ADJUST entry with -5 quantity

---

### User Story 6 - Basic Reports (Priority: P2)

As a business owner, I need to view reports on stock levels and movements so that I can analyze inventory trends and plan purchases. Reports should be filterable and exportable.

**Why this priority**: Reports provide business value but the system is functional without them - they enhance decision-making.

**Independent Test**: Can be fully tested by generating a stock report filtered by category and date range, then exporting to PDF/Excel.

**Acceptance Scenarios**:

1. **Given** products exist with stock movements, **When** I generate a Stock Report for date range Jan 1-31, **Then** I see all products with their stock levels as of Jan 31
2. **Given** I am viewing a Movement Report, **When** I filter by product "Product A" and type "OUT", **Then** I see only outgoing movements for Product A
3. **Given** I am viewing any report, **When** I click Export PDF or Export Excel, **Then** a file is downloaded in the selected format

---

### User Story 7 - User Management (Priority: P1)

As a system administrator, I need to manage users and their permissions so that access to the system is controlled and secure. Users have roles (Admin, Manager, Staff, Viewer) with different capabilities.

**Why this priority**: Multi-user access with appropriate permissions is essential for any business with more than one employee.

**Independent Test**: Can be fully tested by creating a new user with Manager role, logging in as that user, and verifying they can perform Manager actions but not Admin actions.

**Acceptance Scenarios**:

1. **Given** I am logged in as Admin, **When** I create a new user with email "test@example.com" and role "Staff", **Then** the user is created and can log in
2. **Given** a Staff user tries to approve a document, **When** they click Approve, **Then** the system shows "You do not have permission to approve"
3. **Given** a user forgot their password, **When** they use password reset, **Then** they receive an email with reset link and can set a new password

---

### User Story 8 - Alerts & Notifications (Priority: P2)

As a business owner/manager, I need to receive alerts when stock is low or zero so that I can reorder before stockouts. Alerts should appear in-app and optionally via email.

**Why this priority**: Alerts prevent stockouts but the core system functions without them - they're an enhancement.

**Independent Test**: Can be fully tested by setting a product's min_stock to 5, then issuing stock until quantity falls below 5, and verifying an alert is triggered.

**Acceptance Scenarios**:

1. **Given** Product A has min_stock = 10 and current stock = 12, **When** a goods issue is approved reducing stock to 8, **Then** a LOW_STOCK alert is created
2. **Given** a product's stock becomes 0, **When** the daily alert job runs, **Then** a ZERO_STOCK alert is sent to all Admins and Managers
3. **Given** I have unread notifications, **When** I click the notification bell, **Then** I see a list of all alerts with timestamps and can mark them as read

---

### Edge Cases

- What happens when two users try to issue the same product simultaneously? The system must use optimistic locking to prevent negative stock.
- What happens when a goods receipt or issue is cancelled after approval? The system must create reversal stock movements to restore previous stock levels.
- What happens when importing products with duplicate SKUs? The system must reject duplicates and show an error report.
- What happens when a user tries to delete a product with transaction history? The system must prevent hard delete and only allow soft delete.
- What happens when the last Admin tries to deactivate their own account? The system must prevent this action to ensure at least one Admin exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating, editing, and soft-deleting products with SKU (unique), barcode (optional), name, description, category, unit, cost price, selling price, min/max stock levels, and images (up to 5)
- **FR-002**: System MUST support hierarchical product categories (multi-level tree structure)
- **FR-003**: System MUST support multiple units of measure with conversion factors (e.g., 1 box = 12 pieces)
- **FR-004**: System MUST display real-time stock levels calculated from approved stock movements
- **FR-005**: System MUST record all stock movements (IN, OUT, ADJUST) with reference to source document, quantity, unit cost, balance after, timestamp, and user
- **FR-006**: System MUST allow creating goods receipts with supplier info, multiple product lines, quantities, unit costs, and optional attachments
- **FR-007**: System MUST allow creating goods issues with issue type (sale, damage, internal use, other), multiple product lines, quantities, and recipient info
- **FR-008**: System MUST prevent issuing more quantity than available stock (no negative stock)
- **FR-009**: System MUST allow creating stock adjustments with reason (count, damage, return, other), before/after quantities, and optional attachments
- **FR-010**: System MUST support document workflow: DRAFT → PENDING → APPROVED or CANCELLED
- **FR-011**: System MUST only allow Admin and Manager roles to approve documents
- **FR-012**: System MUST prevent self-approval (creator cannot approve their own document)
- **FR-013**: System MUST create stock movements only after document approval
- **FR-014**: System MUST create reversal movements when an approved document is cancelled
- **FR-015**: System MUST calculate cost using Weighted Average Cost method
- **FR-016**: System MUST send low stock alerts when stock falls below min_stock threshold
- **FR-017**: System MUST send zero stock alerts immediately when stock reaches zero
- **FR-018**: System MUST support user registration/login with email and password
- **FR-019**: System MUST support roles: Admin, Manager, Staff, Viewer with appropriate permissions
- **FR-020**: System MUST log all user actions in an audit trail
- **FR-021**: System MUST support password reset via email
- **FR-022**: System MUST expire user sessions after 24 hours
- **FR-023**: System MUST generate stock reports with filtering by date, category, product
- **FR-024**: System MUST generate movement reports with filtering by date, type, product, user
- **FR-025**: System MUST export reports to PDF and Excel formats
- **FR-026**: System MUST support importing products from Excel/CSV (max 1000 rows per batch)
- **FR-027**: System MUST use optimistic locking to prevent concurrent update conflicts
- **FR-028**: System MUST support in-app notifications with optional email delivery
- **FR-029**: System MUST limit stock alerts to 1 per product per day to prevent spam

### Key Entities

- **Product**: Represents an item in inventory with SKU (unique identifier), barcode, name, description, category, unit, cost price, selling price, min/max stock thresholds, images, and active status
- **Category**: Hierarchical classification for products with name, parent category, and sort order
- **Unit**: Measurement unit with name, abbreviation, base unit reference, and conversion factor
- **StockMovement**: Record of inventory change with type (IN/OUT/ADJUST), product reference, quantity (+/-), unit cost, balance after, source document reference, timestamp, and user
- **GoodsReceipt**: Document for receiving goods with receipt number, supplier info, date, status (DRAFT/PENDING/APPROVED/CANCELLED), total amount, line items, attachments, and approval info
- **GoodsIssue**: Document for issuing goods with issue number, type (SALE/DAMAGE/INTERNAL/OTHER), recipient, date, status, line items, attachments, and approval info
- **StockAdjustment**: Document for adjusting stock with adjustment number, type (COUNT/DAMAGE/RETURN/OTHER), date, status, line items (before/after quantities), and approval info
- **User**: System user with email, password, name, role, default warehouse, active status, and last login
- **Role**: User role with name (Admin/Manager/Staff/Viewer), description, and system role flag
- **Permission**: Feature-level permission linked to role with module, action (CREATE/READ/UPDATE/DELETE/APPROVE), and grant status
- **Warehouse**: Storage location with code, name, address, phone, and default flag
- **Notification**: User alert with type (LOW_STOCK/ZERO_STOCK/PENDING_APPROVAL/SYSTEM), title, message, read status, delivery channel, and timestamp
- **AuditLog**: Action history with user, action type, entity type/id, old/new values, IP address, and timestamp
- **Company**: Business entity with name, tax ID, address, phone, email, currency, timezone, logo, and settings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a goods receipt entry (create, add items, submit) in under 3 minutes
- **SC-002**: Users can complete a goods issue entry in under 3 minutes
- **SC-003**: Users can find any product using search in under 5 seconds
- **SC-004**: Inventory accuracy reaches 99%+ (physical count matches system records)
- **SC-005**: System supports 100+ concurrent users without performance degradation
- **SC-006**: All pages load within 3 seconds on 3G mobile connection
- **SC-007**: Report generation completes within 10 seconds for up to 10,000 records
- **SC-008**: New users can complete training and perform basic operations within 2 hours
- **SC-009**: User satisfaction score reaches 4.0/5.0 or higher
- **SC-010**: System uptime maintains 99.5%+ availability
- **SC-011**: Zero instances of negative stock in production
- **SC-012**: All critical actions are logged in audit trail with 100% coverage
- **SC-013**: Low stock alerts are delivered within 5 minutes of threshold breach
- **SC-014**: Data backup completes daily with 30-day retention

## Assumptions

- Users have basic smartphone/computer literacy
- Primary language is Thai with English as secondary
- Currency is primarily Thai Baht (THB)
- MVP supports single warehouse; multi-warehouse is Phase 2
- MVP is web-based; mobile apps are Phase 2
- Email delivery is available for notifications and password reset
- SMEs have stable internet connectivity
- Import files will be provided in Excel (.xlsx) or CSV format
- Users will access the system primarily during business hours (8 AM - 8 PM)
- Approval workflows are simple single-level (not multi-level approval chains)

## Out of Scope

- POS (Point of Sale) system integration
- Accounting module (export to accounting software instead)
- HR/Payroll functionality
- CRM/Sales features
- Manufacturing/Production planning
- Serial number tracking
- Batch/Lot tracking
- Expiry date management
- Multi-currency support
- Advanced demand forecasting/AI
- Marketplace integrations (Shopee, Lazada, TikTok Shop)
- Mobile applications (iOS/Android native apps)
- Multi-warehouse support
