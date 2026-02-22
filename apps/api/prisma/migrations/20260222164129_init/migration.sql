-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Bangkok',
    "logo" TEXT,
    "settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "warehouse_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "is_granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "base_unit_id" TEXT,
    "conversion_factor" DECIMAL(10,4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT,
    "unit_id" TEXT NOT NULL,
    "cost_price" DECIMAL(15,2) NOT NULL,
    "selling_price" DECIMAL(15,2) NOT NULL,
    "min_stock" INTEGER NOT NULL DEFAULT 0,
    "max_stock" INTEGER,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "average_cost" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "images" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "average_cost_after" DECIMAL(15,2) NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "reference_no" TEXT NOT NULL,
    "notes" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "receipt_no" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_phone" TEXT,
    "supplier_email" TEXT,
    "receipt_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_amount" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "attachments" JSONB,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "cancelled_by_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_items" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_issues" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "issue_no" TEXT NOT NULL,
    "issue_type" TEXT NOT NULL,
    "recipient_name" TEXT,
    "recipient_phone" TEXT,
    "recipient_email" TEXT,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_amount" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "attachments" JSONB,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "cancelled_by_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "goods_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_issue_items" (
    "id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_issue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "adjustment_no" TEXT NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "adjustment_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_amount" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "attachments" JSONB,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "cancelled_by_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustment_items" (
    "id" TEXT NOT NULL,
    "adjustment_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity_before" INTEGER NOT NULL,
    "quantity_after" INTEGER NOT NULL,
    "quantity_diff" INTEGER NOT NULL,
    "unit_cost" DECIMAL(15,2) NOT NULL,
    "total_cost" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_adjustment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "delivery_channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- CreateIndex
CREATE INDEX "users_company_id_email_idx" ON "users"("company_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_company_id_email_key" ON "users"("company_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_role_id_module_action_key" ON "permissions"("role_id", "module", "action");

-- CreateIndex
CREATE INDEX "categories_company_id_idx" ON "categories"("company_id");

-- CreateIndex
CREATE INDEX "categories_company_id_parent_id_idx" ON "categories"("company_id", "parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_company_id_name_key" ON "categories"("company_id", "name");

-- CreateIndex
CREATE INDEX "units_company_id_idx" ON "units"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "units_company_id_abbreviation_key" ON "units"("company_id", "abbreviation");

-- CreateIndex
CREATE INDEX "products_company_id_idx" ON "products"("company_id");

-- CreateIndex
CREATE INDEX "products_company_id_sku_idx" ON "products"("company_id", "sku");

-- CreateIndex
CREATE INDEX "products_company_id_barcode_idx" ON "products"("company_id", "barcode");

-- CreateIndex
CREATE INDEX "products_company_id_category_id_idx" ON "products"("company_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_sku_key" ON "products"("company_id", "sku");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_idx" ON "stock_movements"("company_id");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_product_id_idx" ON "stock_movements"("company_id", "product_id");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_created_at_idx" ON "stock_movements"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_product_id_created_at_idx" ON "stock_movements"("company_id", "product_id", "created_at");

-- CreateIndex
CREATE INDEX "warehouses_company_id_idx" ON "warehouses"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_company_id_code_key" ON "warehouses"("company_id", "code");

-- CreateIndex
CREATE INDEX "goods_receipts_company_id_idx" ON "goods_receipts"("company_id");

-- CreateIndex
CREATE INDEX "goods_receipts_company_id_status_idx" ON "goods_receipts"("company_id", "status");

-- CreateIndex
CREATE INDEX "goods_receipts_company_id_receipt_date_idx" ON "goods_receipts"("company_id", "receipt_date");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_company_id_receipt_no_key" ON "goods_receipts"("company_id", "receipt_no");

-- CreateIndex
CREATE INDEX "goods_receipt_items_receipt_id_idx" ON "goods_receipt_items"("receipt_id");

-- CreateIndex
CREATE INDEX "goods_receipt_items_product_id_idx" ON "goods_receipt_items"("product_id");

-- CreateIndex
CREATE INDEX "goods_issues_company_id_idx" ON "goods_issues"("company_id");

-- CreateIndex
CREATE INDEX "goods_issues_company_id_status_idx" ON "goods_issues"("company_id", "status");

-- CreateIndex
CREATE INDEX "goods_issues_company_id_issue_date_idx" ON "goods_issues"("company_id", "issue_date");

-- CreateIndex
CREATE UNIQUE INDEX "goods_issues_company_id_issue_no_key" ON "goods_issues"("company_id", "issue_no");

-- CreateIndex
CREATE INDEX "goods_issue_items_issue_id_idx" ON "goods_issue_items"("issue_id");

-- CreateIndex
CREATE INDEX "goods_issue_items_product_id_idx" ON "goods_issue_items"("product_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_company_id_idx" ON "stock_adjustments"("company_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_company_id_status_idx" ON "stock_adjustments"("company_id", "status");

-- CreateIndex
CREATE INDEX "stock_adjustments_company_id_adjustment_date_idx" ON "stock_adjustments"("company_id", "adjustment_date");

-- CreateIndex
CREATE UNIQUE INDEX "stock_adjustments_company_id_adjustment_no_key" ON "stock_adjustments"("company_id", "adjustment_no");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_adjustment_id_idx" ON "stock_adjustment_items"("adjustment_id");

-- CreateIndex
CREATE INDEX "stock_adjustment_items_product_id_idx" ON "stock_adjustment_items"("product_id");

-- CreateIndex
CREATE INDEX "notifications_company_id_idx" ON "notifications"("company_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_company_id_created_at_idx" ON "notifications"("company_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_company_id_idx" ON "audit_logs"("company_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_company_id_entity_type_idx" ON "audit_logs"("company_id", "entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_company_id_entity_id_idx" ON "audit_logs"("company_id", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_company_id_created_at_idx" ON "audit_logs"("company_id", "created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_base_unit_id_fkey" FOREIGN KEY ("base_unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_items" ADD CONSTRAINT "goods_receipt_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_issues" ADD CONSTRAINT "goods_issues_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_issues" ADD CONSTRAINT "goods_issues_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_issues" ADD CONSTRAINT "goods_issues_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_issues" ADD CONSTRAINT "goods_issues_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_issue_items" ADD CONSTRAINT "goods_issue_items_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "goods_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_issue_items" ADD CONSTRAINT "goods_issue_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_cancelled_by_id_fkey" FOREIGN KEY ("cancelled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_adjustment_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "stock_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustment_items" ADD CONSTRAINT "stock_adjustment_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
