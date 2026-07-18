-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'INVENTORY_MANAGER', 'CASHIER');

-- CreateEnum
CREATE TYPE "BrandState" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONNECT');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "AdjustmentReason" AS ENUM ('DAMAGED', 'LOST', 'EXPIRED', 'RETURNED', 'COUNTING_ERROR', 'SYSTEM_CORRECTION');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'ONLINE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('SEASONAL', 'DAILY', 'COMBO', 'BILL');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('DRAFT', 'APPROVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DISCOUNT_APPROVAL', 'DISCOUNT_RESPONSE', 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'EXPIRING_SOON', 'EXPIRED', 'DEMAND_FORECAST', 'STOCK_VELOCITY', 'COMBO_SUGGESTION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CASHIER',
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "sub_categories" (
    "subc_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("subc_id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "state" "BrandState" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_product_class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "subcategory_id" TEXT,
    "brand_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "has_varient" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_product_class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "sku" TEXT NOT NULL,
    "master_id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit_type" TEXT NOT NULL,
    "cost_price" DOUBLE PRECISION NOT NULL,
    "selling_price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION DEFAULT 0,
    "current_stock" INTEGER NOT NULL DEFAULT 0,
    "reorder_level" INTEGER NOT NULL DEFAULT 25,
    "target_capacity" INTEGER NOT NULL,
    "mfg_date" DATE,
    "expiry_date" DATE,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "image_url" TEXT,
    "batch_number" TEXT,
    "seasonal" TEXT,
    "variant_attribute_type" TEXT,
    "low_order_level" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("sku")
);

-- CreateTable
CREATE TABLE "goods_receiving_notes" (
    "id" TEXT NOT NULL,
    "grn_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "operator_id" TEXT NOT NULL,
    "grn_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "goods_receiving_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_items" (
    "id" TEXT NOT NULL,
    "grn_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "added_quantity" INTEGER NOT NULL,
    "final_quantity" INTEGER NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL,
    "mfd" DATE,
    "epd" DATE,

    CONSTRAINT "grn_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty_changed" INTEGER NOT NULL,
    "reason" "AdjustmentReason" NOT NULL,
    "adjusted_by" TEXT NOT NULL,
    "final_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_bills" (
    "id" TEXT NOT NULL,
    "bill_number" TEXT NOT NULL,
    "cashier_id" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "total_discount" DOUBLE PRECISION DEFAULT 0,
    "total_bill" DOUBLE PRECISION NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "draft" BOOLEAN NOT NULL DEFAULT false,
    "total_qty" INTEGER NOT NULL,
    "paid_amount" DOUBLE PRECISION,
    "change_amount" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_bill_items" (
    "id" TEXT NOT NULL,
    "bill_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "discount_id" TEXT,
    "discount_value" DOUBLE PRECISION,

    CONSTRAINT "sales_bill_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "combo_price" DOUBLE PRECISION,
    "min_bill_amount" DOUBLE PRECISION,
    "label" TEXT,
    "image_url" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "daily_start_time" TEXT,
    "daily_end_time" TEXT,
    "applicable_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_or_daily_products" (
    "id" TEXT NOT NULL,
    "discount_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,

    CONSTRAINT "seasonal_or_daily_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_combo_items" (
    "id" TEXT NOT NULL,
    "discount_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "min_qty" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "discount_combo_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_refunds" (
    "id" TEXT NOT NULL,
    "refund_number" TEXT NOT NULL,
    "original_bill_id" TEXT NOT NULL,
    "cashier_id" TEXT NOT NULL,
    "refund_amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_refund_items" (
    "id" TEXT NOT NULL,
    "refund_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "refund_value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "sales_refund_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ready',
    "created_by_role" TEXT NOT NULL DEFAULT 'ADMIN',
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sku" TEXT,
    "suggested_action" TEXT,
    "metadata" JSONB,
    "target_role" "Role",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_states" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),

    CONSTRAINT "user_notification_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_forecast_runs" (
    "id" TEXT NOT NULL,
    "target_month" DATE NOT NULL,
    "data_start_date" DATE NOT NULL,
    "data_end_date" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_forecast_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_analysis" (
    "id" TEXT NOT NULL,
    "forecast_run_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "recent_30_day_sales" INTEGER NOT NULL,
    "previous_30_day_sales" INTEGER NOT NULL,
    "recent_growth_percent" DOUBLE PRECISION,
    "three_month_average" DOUBLE PRECISION NOT NULL,
    "six_month_average" DOUBLE PRECISION NOT NULL,
    "same_month_historical_average" DOUBLE PRECISION,
    "average_daily_sales" DOUBLE PRECISION NOT NULL,
    "discount_uplift_percent" DOUBLE PRECISION,
    "refund_quantity" INTEGER NOT NULL DEFAULT 0,
    "stock_out_estimate" INTEGER NOT NULL DEFAULT 0,
    "demand_trend" TEXT NOT NULL,
    "data_quality" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_forecasts" (
    "id" TEXT NOT NULL,
    "forecast_run_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "current_stock_snapshot" INTEGER NOT NULL,
    "stock_coverage_days" DOUBLE PRECISION,
    "predicted_demand" INTEGER NOT NULL,
    "recommended_quantity" INTEGER NOT NULL,
    "selected_model" TEXT NOT NULL,
    "accuracy_score" DOUBLE PRECISION,
    "prediction_reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sub_categories_name_key" ON "sub_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receiving_notes_grn_id_key" ON "goods_receiving_notes"("grn_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_bills_bill_number_key" ON "sales_bills"("bill_number");

-- CreateIndex
CREATE UNIQUE INDEX "seasonal_or_daily_products_discount_id_sku_key" ON "seasonal_or_daily_products"("discount_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "discount_combo_items_discount_id_sku_key" ON "discount_combo_items"("discount_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "sales_refunds_refund_number_key" ON "sales_refunds"("refund_number");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_states_user_id_notification_id_key" ON "user_notification_states"("user_id", "notification_id");

-- CreateIndex
CREATE INDEX "demand_forecast_runs_target_month_idx" ON "demand_forecast_runs"("target_month");

-- CreateIndex
CREATE INDEX "demand_analysis_sku_idx" ON "demand_analysis"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "demand_analysis_forecast_run_id_sku_key" ON "demand_analysis"("forecast_run_id", "sku");

-- CreateIndex
CREATE INDEX "demand_forecasts_sku_idx" ON "demand_forecasts"("sku");

-- CreateIndex
CREATE INDEX "demand_forecasts_status_idx" ON "demand_forecasts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "demand_forecasts_forecast_run_id_sku_key" ON "demand_forecasts"("forecast_run_id", "sku");

-- AddForeignKey
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_product_class" ADD CONSTRAINT "master_product_class_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_product_class" ADD CONSTRAINT "master_product_class_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "sub_categories"("subc_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_product_class" ADD CONSTRAINT "master_product_class_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "master_product_class" ADD CONSTRAINT "master_product_class_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_master_id_fkey" FOREIGN KEY ("master_id") REFERENCES "master_product_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receiving_notes" ADD CONSTRAINT "goods_receiving_notes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receiving_notes" ADD CONSTRAINT "goods_receiving_notes_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "goods_receiving_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grn_items" ADD CONSTRAINT "grn_items_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_adjusted_by_fkey" FOREIGN KEY ("adjusted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_bills" ADD CONSTRAINT "sales_bills_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_bill_items" ADD CONSTRAINT "sales_bill_items_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "sales_bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_bill_items" ADD CONSTRAINT "sales_bill_items_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_bill_items" ADD CONSTRAINT "sales_bill_items_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasonal_or_daily_products" ADD CONSTRAINT "seasonal_or_daily_products_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasonal_or_daily_products" ADD CONSTRAINT "seasonal_or_daily_products_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_combo_items" ADD CONSTRAINT "discount_combo_items_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_combo_items" ADD CONSTRAINT "discount_combo_items_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_refunds" ADD CONSTRAINT "sales_refunds_original_bill_id_fkey" FOREIGN KEY ("original_bill_id") REFERENCES "sales_bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_refunds" ADD CONSTRAINT "sales_refunds_cashier_id_fkey" FOREIGN KEY ("cashier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_refund_items" ADD CONSTRAINT "sales_refund_items_refund_id_fkey" FOREIGN KEY ("refund_id") REFERENCES "sales_refunds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_refund_items" ADD CONSTRAINT "sales_refund_items_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_states" ADD CONSTRAINT "user_notification_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_states" ADD CONSTRAINT "user_notification_states_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_analysis" ADD CONSTRAINT "demand_analysis_forecast_run_id_fkey" FOREIGN KEY ("forecast_run_id") REFERENCES "demand_forecast_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_analysis" ADD CONSTRAINT "demand_analysis_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_forecast_run_id_fkey" FOREIGN KEY ("forecast_run_id") REFERENCES "demand_forecast_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_sku_fkey" FOREIGN KEY ("sku") REFERENCES "products"("sku") ON DELETE RESTRICT ON UPDATE CASCADE;
