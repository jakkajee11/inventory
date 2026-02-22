# Tasks: Inventory Management System MVP

**Input**: Design documents from `/specs/001-inventory-management/`
**Prerequisites**: spec.md (user stories with priorities), implementation plan (technical context)

**Tests**: TDD approach with 70%+ unit test coverage requirement - tests are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Technical Context**:
- **Language**: TypeScript 5.x
- **Backend**: NestJS + Fastify adapter
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Testing**: Vitest (unit), Playwright (E2E)
- **Monorepo**: Turborepo + pnpm

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/api/src/`
- **Frontend**: `apps/web/src/`
- **Shared Types**: `packages/types/src/`
- **Shared Utils**: `packages/utils/src/`
- **E2E Tests**: `e2e/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic monorepo structure

- [x] T001 Create root package.json with Turborepo configuration and pnpm workspace
- [x] T002 [P] Create turbo.json with task pipeline configuration
- [x] T003 [P] Create pnpm-workspace.yaml for monorepo
- [x] T004 [P] Create root tsconfig.json with strict TypeScript settings
- [x] T005 [P] Create .eslintrc.js, .prettierrc, .gitignore at root
- [x] T006 [P] Create shared ESLint config package in packages/eslint-config/
- [x] T007 Create apps/, packages/, e2e/ directory structure
- [x] T008 [P] Create packages/types/package.json with TypeScript configuration
- [x] T009 [P] Create packages/utils/package.json with TypeScript configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [x] T010 Create apps/api/package.json with NestJS, Fastify, Prisma dependencies
- [x] T011 [P] Create apps/api/tsconfig.json with NestJS decorators support
- [x] T012 [P] Create apps/api/nest-cli.json configuration
- [x] T013 [P] Create apps/api/vitest.config.ts for unit testing
- [x] T014 [P] Create apps/api/vitest.config.e2e.ts for E2E testing
- [x] T015 Create apps/api/src/main.ts with Fastify adapter and global pipes
- [x] T016 [P] Create apps/api/src/config/configuration.ts with environment validation
- [x] T017 Create apps/api/src/app.module.ts importing all feature modules
- [x] T018 Create apps/api/src/prisma/prisma.module.ts and prisma.service.ts
- [x] T019 [P] Create apps/api/test/setup.ts for test environment
- [x] T020 [P] Create apps/api/test/setup.e2e.ts for E2E test environment
- [x] T021 Create apps/api/.env.example with all required environment variables

### Database Schema (Prisma)

- [x] T022 Create apps/api/prisma/schema.prisma with all 14 entities (Company, User, Role, Permission, Product, Category, Unit, StockMovement, GoodsReceipt, GoodsReceiptItem, GoodsIssue, GoodsIssueItem, StockAdjustment, StockAdjustmentItem, Warehouse, Notification, AuditLog) with tenant_id for multi-tenancy
- [x] T023 [P] Create apps/api/prisma/seed.ts for default roles and permissions

### Frontend Foundation

- [x] T024 Create apps/web/package.json with Next.js 14, React, TanStack Query, Zustand
- [x] T025 [P] Create apps/web/tsconfig.json with Next.js plugin
- [x] T026 [P] Create apps/web/next.config.js with transpilePackages for shared packages
- [x] T027 [P] Create apps/web/tailwind.config.ts with shadcn/ui theme
- [x] T028 [P] Create apps/web/postcss.config.js
- [x] T029 [P] Create apps/web/vitest.config.ts for component testing
- [x] T030 Create apps/web/src/app/globals.css with CSS variables theme
- [x] T031 [P] Create apps/web/src/app/layout.tsx with providers
- [x] T032 [P] Create apps/web/src/app/providers.tsx with QueryClient and ThemeProvider
- [x] T033 Create apps/web/src/app/page.tsx as landing page
- [x] T034 [P] Create apps/web/src/lib/utils.ts with cn() utility
- [x] T035 [P] Create apps/web/src/lib/api/api-client.ts with Axios wrapper and auth interceptors
- [x] T036 [P] Create apps/web/src/stores/auth.store.ts with Zustand for auth state

### Shared Packages

- [x] T037 [P] Create packages/types/src/entities/product.types.ts
- [x] T038 [P] Create packages/types/src/entities/user.types.ts
- [x] T039 [P] Create packages/types/src/entities/company.types.ts
- [x] T040 [P] Create packages/types/src/entities/inventory.types.ts
- [x] T041 [P] Create packages/types/src/dto/pagination.dto.ts
- [x] T042 [P] Create packages/types/src/enums/status.enums.ts
- [x] T043 [P] Create packages/utils/src/format/currency.ts
- [x] T044 [P] Create packages/utils/src/format/date.ts
- [x] T045 [P] Create packages/utils/src/validation/sku.ts
- [x] T046 [P] Create packages/utils/src/calculation/weighted-average.ts

### Common Backend Infrastructure

- [x] T047 Create apps/api/src/common/guards/jwt-auth.guard.ts
- [x] T048 [P] Create apps/api/src/common/guards/roles.guard.ts for RBAC
- [x] T049 [P] Create apps/api/src/common/decorators/current-user.decorator.ts
- [x] T050 [P] Create apps/api/src/common/decorators/roles.decorator.ts
- [x] T051 [P] Create apps/api/src/common/decorators/tenant-id.decorator.ts
- [x] T052 [P] Create apps/api/src/common/interceptors/audit-log.interceptor.ts
- [x] T053 [P] Create apps/api/src/common/filters/all-exceptions.filter.ts
- [x] T054 Create apps/api/src/modules/tenant/tenant.module.ts and tenant.middleware.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 7 - User Management & Authentication (Priority: P1) 🎯 MVP Core

**Goal**: Enable user registration, login, role-based access control, and user management

**Independent Test**: Create a new user with Manager role, login as that user, verify permissions work correctly

**Note**: US7 is placed first because authentication is required for all other user stories

### Tests for User Story 7 (TDD)

- [ ] T055 [P] [US7] Create test for password hashing in apps/api/test/auth/password.spec.ts
- [ ] T056 [P] [US7] Create test for JWT token generation in apps/api/test/auth/jwt.spec.ts
- [ ] T057 [P] [US7] Create test for role-based access control in apps/api/test/auth/rbac.spec.ts
- [ ] T058 [P] [US7] Create E2E test for login flow in apps/api/test/auth/login.e2e-spec.ts

### Backend Implementation for User Story 7

- [x] T059 [P] [US7] Create Role entity with permissions in apps/api/src/modules/user/domain/entities/role.entity.ts
- [x] T060 [P] [US7] Create Permission entity in apps/api/src/modules/user/domain/entities/permission.entity.ts
- [x] T061 [P] [US7] Create User entity with relations in apps/api/src/modules/user/domain/entities/user.entity.ts
- [x] T062 [US7] Create UserRepository interface in apps/api/src/modules/user/domain/repositories/user.repository.interface.ts
- [x] T063 [US7] Implement UserRepository with Prisma in apps/api/src/modules/user/infrastructure/user.repository.ts
- [x] T064 [US7] Create RegisterDto, LoginDto in apps/api/src/modules/auth/application/dtos/
- [x] T065 [US7] Implement AuthService with register, login, refresh, password reset in apps/api/src/modules/auth/auth.service.ts
- [x] T066 [US7] Implement JwtStrategy for passport in apps/api/src/modules/auth/strategies/jwt.strategy.ts
- [x] T067 [US7] Implement LocalStrategy for passport in apps/api/src/modules/auth/strategies/local.strategy.ts
- [x] T068 [US7] Complete AuthController with all endpoints in apps/api/src/modules/auth/auth.controller.ts
- [x] T069 [US7] Implement UserService with CRUD operations in apps/api/src/modules/user/user.service.ts
- [x] T070 [US7] Complete UserController with all endpoints in apps/api/src/modules/user/user.controller.ts
- [x] T071 [US7] Implement RolesGuard with permission checking in apps/api/src/common/guards/roles.guard.ts

### Frontend Implementation for User Story 7

- [x] T072 [P] [US7] Create auth types in apps/web/src/features/auth/types/auth.types.ts
- [x] T073 [P] [US7] Create login schema with Zod in apps/web/src/features/auth/schemas/login.schema.ts
- [x] T074 [P] [US7] Create register schema with Zod in apps/web/src/features/auth/schemas/register.schema.ts
- [x] T075 [US7] Create auth API hooks in apps/web/src/features/auth/api/auth.api.ts
- [x] T076 [US7] Implement useAuth hook in apps/web/src/features/auth/hooks/useAuth.ts
- [x] T077 [P] [US7] Create LoginPage component in apps/web/src/app/(auth)/login/page.tsx
- [x] T078 [P] [US7] Create RegisterPage component in apps/web/src/app/(auth)/register/page.tsx
- [x] T079 [P] [US7] Create ForgotPasswordPage in apps/web/src/app/(auth)/forgot-password/page.tsx
- [x] T080 [P] [US7] Create LoginForm component in apps/web/src/features/auth/components/LoginForm.tsx
- [x] T081 [P] [US7] Create RegisterForm component in apps/web/src/features/auth/components/RegisterForm.tsx

**Checkpoint**: Authentication and user management fully functional

---

## Phase 4: User Story 1 - Product Management (Priority: P1)

**Goal**: Manage product catalog with SKU, barcode, name, category, unit, prices, and images

**Independent Test**: Create a product with all fields, edit it, search by SKU/name, soft-delete it

### Tests for User Story 1 (TDD)

- [ ] T082 [P] [US1] Create test for SKU uniqueness validation in apps/api/test/product/sku.spec.ts
- [ ] T083 [P] [US1] Create test for hierarchical categories in apps/api/test/product/category.spec.ts
- [ ] T084 [P] [US1] Create test for unit conversions in apps/api/test/product/unit.spec.ts
- [ ] T085 [P] [US1] Create E2E test for product CRUD in apps/api/test/product/product.e2e-spec.ts

### Backend Implementation for User Story 1

- [x] T086 [P] [US1] Create Category entity in apps/api/src/modules/product/domain/entities/category.entity.ts
- [x] T087 [P] [US1] Create Unit entity with conversions in apps/api/src/modules/product/domain/entities/unit.entity.ts
- [x] T088 [P] [US1] Create Product entity with all fields in apps/api/src/modules/product/domain/entities/product.entity.ts
- [x] T089 [US1] Create ProductRepository interface in apps/api/src/modules/product/domain/repositories/product.repository.interface.ts
- [x] T090 [US1] Implement ProductRepository with Prisma in apps/api/src/modules/product/infrastructure/product.repository.ts
- [x] T091 [US1] Create ProductDtos (Create, Update, Response, Query) in apps/api/src/modules/product/application/dtos/
- [x] T092 [US1] Implement ProductService with CRUD, search, soft-delete in apps/api/src/modules/product/product.service.ts
- [x] T093 [US1] Complete ProductController with all endpoints in apps/api/src/modules/product/product.controller.ts
- [ ] T094 [US1] Implement product import from Excel in apps/api/src/modules/product/product-import.service.ts

### Frontend Implementation for User Story 1

- [x] T095 [P] [US1] Create product types in apps/web/src/features/product/types/product.types.ts
- [x] T096 [P] [US1] Create product schemas with Zod in apps/web/src/features/product/schemas/product.schema.ts
- [x] T097 [US1] Create product API hooks in apps/web/src/features/product/api/product.api.ts
- [x] T098 [US1] Create useProducts hook with filtering in apps/web/src/features/product/hooks/useProducts.ts
- [x] T099 [P] [US1] Create ProductList component in apps/web/src/features/product/components/ProductList.tsx
- [x] T100 [P] [US1] Create ProductForm component in apps/web/src/features/product/components/ProductForm.tsx
- [x] T101 [P] [US1] Create ProductCard component in apps/web/src/features/product/components/ProductCard.tsx
- [x] T102 [P] [US1] Create ProductSearch component in apps/web/src/features/product/components/ProductSearch.tsx
- [x] T103 [US1] Create products list page in apps/web/src/app/(dashboard)/products/page.tsx
- [x] T104 [US1] Create product detail page in apps/web/src/app/(dashboard)/products/[id]/page.tsx
- [x] T105 [US1] Create new product page in apps/web/src/app/(dashboard)/products/new/page.tsx
- [x] T106 [US1] Create edit product page in apps/web/src/app/(dashboard)/products/[id]/edit/page.tsx

**Checkpoint**: Product management fully functional

---

## Phase 5: User Story 2 - Real-time Inventory Tracking (Priority: P1)

**Goal**: View current stock levels, movement history, and export data

**Independent Test**: View inventory dashboard, filter products, export to CSV/Excel

### Tests for User Story 2 (TDD)

- [ ] T107 [P] [US2] Create test for stock calculation in apps/api/test/inventory/stock-calc.spec.ts
- [ ] T108 [P] [US2] Create test for movement history in apps/api/test/inventory/movement.spec.ts
- [ ] T109 [P] [US2] Create E2E test for inventory listing in apps/api/test/inventory/inventory.e2e-spec.ts

### Backend Implementation for User Story 2

- [x] T110 [P] [US2] Create StockMovement entity in apps/api/src/modules/inventory/domain/entities/stock-movement.entity.ts
- [x] T111 [US2] Create InventoryRepository interface in apps/api/src/modules/inventory/domain/repositories/inventory.repository.interface.ts
- [x] T112 [US2] Implement InventoryRepository with Prisma in apps/api/src/modules/inventory/infrastructure/inventory.repository.ts
- [x] T113 [US2] Create InventoryDtos in apps/api/src/modules/inventory/application/dtos/
- [x] T114 [US2] Implement StockCalculatorService for stock calculations in apps/api/src/modules/inventory/stock-calculator.service.ts
- [x] T115 [US2] Implement InventoryService with stock levels, movements in apps/api/src/modules/inventory/inventory.service.ts
- [x] T116 [US2] Complete InventoryController with all endpoints in apps/api/src/modules/inventory/inventory.controller.ts
- [ ] T117 [US2] Implement inventory export to CSV/Excel in apps/api/src/modules/inventory/inventory-export.service.ts

### Frontend Implementation for User Story 2

- [x] T118 [P] [US2] Create inventory types in apps/web/src/features/inventory/types/inventory.types.ts
- [x] T119 [US2] Create inventory API hooks in apps/web/src/features/inventory/api/inventory.api.ts
- [ ] T120 [US2] Create useInventory hook in apps/web/src/features/inventory/hooks/useInventory.ts
- [x] T121 [P] [US2] Create InventoryTable component in apps/web/src/features/inventory/components/InventoryTable.tsx
- [ ] T122 [P] [US2] Create MovementHistory component in apps/web/src/features/inventory/components/MovementHistory.tsx
- [ ] T123 [P] [US2] Create InventoryFilters component in apps/web/src/features/inventory/components/InventoryFilters.tsx
- [x] T124 [US2] Create inventory list page in apps/web/src/app/(dashboard)/inventory/page.tsx
- [x] T125 [US2] Create product movements page in apps/web/src/app/(dashboard)/inventory/[productId]/movements/page.tsx

**Checkpoint**: Inventory tracking fully functional

---

## Phase 6: User Story 3 - Goods Receipt (Priority: P1)

**Goal**: Record incoming goods with supplier info, multiple lines, approval workflow

**Independent Test**: Create receipt, add lines, submit, approve, verify stock increases

### Tests for User Story 3 (TDD)

- [ ] T126 [P] [US3] Create test for receipt total calculation in apps/api/test/goods-receipt/calculation.spec.ts
- [ ] T127 [P] [US3] Create test for approval workflow in apps/api/test/goods-receipt/workflow.spec.ts
- [ ] T128 [P] [US3] Create test for stock increase on approval in apps/api/test/goods-receipt/stock-update.spec.ts
- [ ] T129 [P] [US3] Create E2E test for complete receipt flow in apps/api/test/goods-receipt/receipt.e2e-spec.ts

### Backend Implementation for User Story 3

- [x] T130 [P] [US3] Create GoodsReceipt entity in apps/api/src/modules/goods-receipt/domain/entities/goods-receipt.entity.ts
- [x] T131 [P] [US3] Create GoodsReceiptItem entity in apps/api/src/modules/goods-receipt/domain/entities/goods-receipt-item.entity.ts
- [x] T132 [US3] Create GoodsReceiptRepository in apps/api/src/modules/goods-receipt/infrastructure/goods-receipt.repository.ts
- [x] T133 [US3] Create GoodsReceiptDtos in apps/api/src/modules/goods-receipt/application/dtos/
- [x] T134 [US3] Implement GoodsReceiptService with workflow in apps/api/src/modules/goods-receipt/goods-receipt.service.ts
- [x] T135 [US3] Complete GoodsReceiptController in apps/api/src/modules/goods-receipt/goods-receipt.controller.ts

### Frontend Implementation for User Story 3

- [ ] T136 [P] [US3] Create goods receipt types in apps/web/src/features/goods-receipt/types/receipt.types.ts
- [ ] T137 [P] [US3] Create goods receipt schemas in apps/web/src/features/goods-receipt/schemas/receipt.schema.ts
- [ ] T138 [US3] Create goods receipt API hooks in apps/web/src/features/goods-receipt/api/receipt.api.ts
- [ ] T139 [P] [US3] Create ReceiptForm component in apps/web/src/features/goods-receipt/components/ReceiptForm.tsx
- [ ] T140 [P] [US3] Create ReceiptItemList component in apps/web/src/features/goods-receipt/components/ReceiptItemList.tsx
- [ ] T141 [P] [US3] Create ReceiptList component in apps/web/src/features/goods-receipt/components/ReceiptList.tsx
- [ ] T142 [US3] Create receipts list page in apps/web/src/app/(dashboard)/receipts/page.tsx
- [ ] T143 [US3] Create new receipt page in apps/web/src/app/(dashboard)/receipts/new/page.tsx
- [ ] T144 [US3] Create receipt detail page in apps/web/src/app/(dashboard)/receipts/[id]/page.tsx

**Checkpoint**: Goods receipt fully functional

---

## Phase 7: User Story 4 - Goods Issue (Priority: P1)

**Goal**: Record outgoing goods with issue type, prevent negative stock, approval workflow

**Independent Test**: Create issue, add lines, submit, approve, verify stock decreases

### Tests for User Story 4 (TDD)

- [ ] T145 [P] [US4] Create test for insufficient stock validation in apps/api/test/goods-issue/stock-check.spec.ts
- [ ] T146 [P] [US4] Create test for issue workflow in apps/api/test/goods-issue/workflow.spec.ts
- [ ] T147 [P] [US4] Create test for stock decrease on approval in apps/api/test/goods-issue/stock-update.spec.ts
- [ ] T148 [P] [US4] Create E2E test for complete issue flow in apps/api/test/goods-issue/issue.e2e-spec.ts

### Backend Implementation for User Story 4

- [x] T149 [P] [US4] Create GoodsIssue entity in apps/api/src/modules/goods-issue/domain/entities/goods-issue.entity.ts
- [x] T150 [P] [US4] Create GoodsIssueItem entity in apps/api/src/modules/goods-issue/domain/entities/goods-issue-item.entity.ts
- [x] T151 [US4] Create GoodsIssueRepository in apps/api/src/modules/goods-issue/infrastructure/goods-issue.repository.ts
- [x] T152 [US4] Create GoodsIssueDtos in apps/api/src/modules/goods-issue/application/dtos/
- [x] T153 [US4] Implement StockValidatorService for negative stock prevention in apps/api/src/modules/inventory/stock-validator.service.ts
- [x] T154 [US4] Implement GoodsIssueService with workflow in apps/api/src/modules/goods-issue/goods-issue.service.ts
- [x] T155 [US4] Complete GoodsIssueController in apps/api/src/modules/goods-issue/goods-issue.controller.ts

### Frontend Implementation for User Story 4

- [ ] T156 [P] [US4] Create goods issue types in apps/web/src/features/goods-issue/types/issue.types.ts
- [ ] T157 [P] [US4] Create goods issue schemas in apps/web/src/features/goods-issue/schemas/issue.schema.ts
- [ ] T158 [US4] Create goods issue API hooks in apps/web/src/features/goods-issue/api/issue.api.ts
- [ ] T159 [P] [US4] Create IssueForm component in apps/web/src/features/goods-issue/components/IssueForm.tsx
- [ ] T160 [P] [US4] Create IssueItemList component in apps/web/src/features/goods-issue/components/IssueItemList.tsx
- [ ] T161 [P] [US4] Create IssueList component in apps/web/src/features/goods-issue/components/IssueList.tsx
- [ ] T162 [US4] Create issues list page in apps/web/src/app/(dashboard)/issues/page.tsx
- [ ] T163 [US4] Create new issue page in apps/web/src/app/(dashboard)/issues/new/page.tsx
- [ ] T164 [US4] Create issue detail page in apps/web/src/app/(dashboard)/issues/[id]/page.tsx

**Checkpoint**: Goods issue fully functional

---

## Phase 8: User Story 5 - Stock Adjustment (Priority: P2)

**Goal**: Adjust stock quantities with before/after values and documented reasons

**Independent Test**: Create adjustment, approve, verify stock reflects adjustment

### Tests for User Story 5 (TDD)

- [ ] T165 [P] [US5] Create test for adjustment calculation in apps/api/test/stock-adjustment/calculation.spec.ts
- [ ] T166 [P] [US5] Create E2E test for adjustment flow in apps/api/test/stock-adjustment/adjustment.e2e-spec.ts

### Backend Implementation for User Story 5

- [x] T167 [P] [US5] Create StockAdjustment entity in apps/api/src/modules/stock-adjustment/domain/entities/stock-adjustment.entity.ts
- [x] T168 [P] [US5] Create StockAdjustmentItem entity in apps/api/src/modules/stock-adjustment/domain/entities/stock-adjustment-item.entity.ts
- [x] T169 [US5] Create StockAdjustmentRepository in apps/api/src/modules/stock-adjustment/infrastructure/stock-adjustment.repository.ts
- [x] T170 [US5] Create StockAdjustmentDtos in apps/api/src/modules/stock-adjustment/application/dtos/
- [x] T171 [US5] Implement StockAdjustmentService in apps/api/src/modules/stock-adjustment/stock-adjustment.service.ts
- [x] T172 [US5] Complete StockAdjustmentController in apps/api/src/modules/stock-adjustment/stock-adjustment.controller.ts

### Frontend Implementation for User Story 5

- [x] T173 [P] [US5] Create adjustment types in apps/web/src/features/stock-adjustment/types/adjustment.types.ts
- [x] T174 [US5] Create adjustment API hooks in apps/web/src/features/stock-adjustment/api/adjustment.api.ts
- [x] T175 [P] [US5] Create AdjustmentForm component in apps/web/src/features/stock-adjustment/components/AdjustmentForm.tsx
- [x] T176 [P] [US5] Create AdjustmentList component in apps/web/src/features/stock-adjustment/components/AdjustmentList.tsx
- [x] T177 [US5] Create adjustments list page in apps/web/src/app/(dashboard)/adjustments/page.tsx
- [x] T178 [US5] Create new adjustment page in apps/web/src/app/(dashboard)/adjustments/new/page.tsx

**Checkpoint**: Stock adjustment fully functional

---

## Phase 9: User Story 6 - Basic Reports (Priority: P2)

**Goal**: Generate stock and movement reports with filtering and export to PDF/Excel

**Independent Test**: Generate stock report, filter by category/date, export to PDF/Excel

### Tests for User Story 6 (TDD)

- [ ] T179 [P] [US6] Create test for stock report generation in apps/api/test/report/stock-report.spec.ts
- [ ] T180 [P] [US6] Create test for movement report generation in apps/api/test/report/movement-report.spec.ts

### Backend Implementation for User Story 6

- [x] T181 [US6] Create ReportDtos in apps/api/src/modules/report/application/dtos/
- [x] T182 [US6] Implement ReportService with stock/movement reports in apps/api/src/modules/report/report.service.ts
- [x] T183 [US6] Implement PDF export in apps/api/src/modules/report/export/pdf-export.service.ts
- [x] T184 [US6] Implement Excel export in apps/api/src/modules/report/export/excel-export.service.ts
- [x] T185 [US6] Complete ReportController in apps/api/src/modules/report/report.controller.ts

### Frontend Implementation for User Story 6

- [x] T186 [P] [US6] Create report types in apps/web/src/features/report/types/report.types.ts
- [x] T187 [US6] Create report API hooks in apps/web/src/features/report/api/report.api.ts
- [ ] T188 [P] [US6] Create StockReport component in apps/web/src/features/report/components/StockReport.tsx
- [ ] T189 [P] [US6] Create MovementReport component in apps/web/src/features/report/components/MovementReport.tsx
- [ ] T190 [P] [US6] Create ReportFilters component in apps/web/src/features/report/components/ReportFilters.tsx
- [x] T191 [US6] Create reports page in apps/web/src/app/(dashboard)/reports/page.tsx

**Checkpoint**: Reports fully functional

---

## Phase 10: User Story 8 - Alerts & Notifications (Priority: P2)

**Goal**: Send low stock and zero stock alerts, in-app notifications

**Independent Test**: Set min_stock, issue stock below threshold, verify alert triggered

### Tests for User Story 8 (TDD)

- [ ] T192 [P] [US8] Create test for low stock alert in apps/api/test/notification/low-stock.spec.ts
- [ ] T193 [P] [US8] Create test for zero stock alert in apps/api/test/notification/zero-stock.spec.ts

### Backend Implementation for User Story 8

- [x] T194 [P] [US8] Create Notification entity in apps/api/src/modules/notification/domain/entities/notification.entity.ts
- [x] T195 [US8] Create NotificationRepository in apps/api/src/modules/notification/infrastructure/notification.repository.ts
- [x] T196 [US8] Create NotificationDtos in apps/api/src/modules/notification/application/dtos/
- [x] T197 [US8] Implement AlertService for stock threshold checking in apps/api/src/modules/notification/alert.service.ts
- [x] T198 [US8] Implement NotificationService in apps/api/src/modules/notification/notification.service.ts
- [ ] T199 [US8] Create BullMQ job for daily stock alerts in apps/api/src/modules/notification/jobs/stock-alert.job.ts
- [x] T200 [US8] Complete NotificationController in apps/api/src/modules/notification/notification.controller.ts

### Frontend Implementation for User Story 8

- [x] T201 [P] [US8] Create notification types in apps/web/src/features/notification/types/notification.types.ts
- [x] T202 [US8] Create notification API hooks in apps/web/src/features/notification/api/notification.api.ts
- [x] T203 [P] [US8] Create NotificationBell component in apps/web/src/features/notification/components/NotificationBell.tsx
- [ ] T204 [P] [US8] Create NotificationList component in apps/web/src/features/notification/components/NotificationList.tsx
- [x] T205 [US8] Create notifications page in apps/web/src/app/(dashboard)/notifications/page.tsx

**Checkpoint**: Alerts & notifications fully functional

---

## Phase 11: Dashboard Layout & Polish

**Purpose**: Complete dashboard layout, UI components, and cross-cutting concerns

- [x] T206 [P] Create DashboardLayout component in apps/web/src/components/layouts/DashboardLayout.tsx
- [x] T207 [P] Create Sidebar component in apps/web/src/components/layouts/Sidebar.tsx
- [x] T208 [P] Create Header component in apps/web/src/components/layouts/Header.tsx
- [x] T209 [P] Create dashboard layout route in apps/web/src/app/(dashboard)/layout.tsx
- [x] T210 [P] Create settings page in apps/web/src/app/(dashboard)/settings/page.tsx
- [ ] T211 [P] Create Button component in apps/web/src/components/ui/button.tsx
- [ ] T212 [P] Create Input component in apps/web/src/components/ui/input.tsx
- [ ] T213 [P] Create Select component in apps/web/src/components/ui/select.tsx
- [ ] T214 [P] Create Table component in apps/web/src/components/ui/table.tsx
- [ ] T215 [P] Create Dialog component in apps/web/src/components/ui/dialog.tsx
- [ ] T216 [P] Create Toast component in apps/web/src/components/ui/toast.tsx
- [ ] T217 [P] Create Card component in apps/web/src/components/ui/card.tsx
- [ ] T218 [P] Create Badge component in apps/web/src/components/ui/badge.tsx
- [ ] T219 [P] Create DataTable component with TanStack Table in apps/web/src/components/common/DataTable.tsx
- [ ] T220 [P] Create Loading component in apps/web/src/components/common/Loading.tsx
- [ ] T221 [P] Create ErrorBoundary component in apps/web/src/components/common/ErrorBoundary.tsx

---

## Phase 12: E2E Tests & Integration

**Purpose**: Full workflow E2E tests with Playwright

- [ ] T222 Create e2e/playwright.config.ts
- [ ] T223 [P] Create E2E test for complete receipt workflow in e2e/tests/workflow/complete-receipt-workflow.spec.ts
- [ ] T224 [P] Create E2E test for complete issue workflow in e2e/tests/workflow/complete-issue-workflow.spec.ts
- [ ] T225 [P] Create E2E test for stock adjustment in e2e/tests/workflow/stock-adjustment-workflow.spec.ts
- [ ] T226 [P] Create E2E test for approval workflow in e2e/tests/workflow/approval-workflow.spec.ts
- [ ] T227 [P] Create E2E test for low stock alert in e2e/tests/workflow/low-stock-alert.spec.ts
- [ ] T228 [P] Create E2E test for concurrent operations in e2e/tests/workflow/concurrent-operations.spec.ts

---

## Phase 13: CI/CD & Documentation

**Purpose**: GitHub Actions, Docker, and final documentation

- [ ] T229 Create .github/workflows/ci.yml for testing and linting
- [ ] T230 [P] Create .github/workflows/deploy.yml for deployment
- [ ] T231 [P] Create Dockerfile for backend in apps/api/Dockerfile
- [ ] T232 [P] Create Dockerfile for frontend in apps/web/Dockerfile
- [ ] T233 Create docker-compose.yml for local development
- [ ] T234 [P] Create API documentation with Swagger decorators update
- [ ] T235 [P] Update README.md with setup instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 7 (Phase 3)**: Depends on Foundational - Authentication required first
- **User Stories 1-4 (Phases 4-7)**: Depend on User Story 7 (authentication)
- **User Stories 5-6-8 (Phases 8-10)**: Depend on User Story 1 (products) and User Story 2 (inventory)
- **Dashboard & Polish (Phase 11)**: Can run in parallel with user stories
- **E2E Tests (Phase 12)**: Depends on all user stories being complete
- **CI/CD (Phase 13)**: Depends on E2E tests

### User Story Dependencies

```
                    ┌─────────────┐
                    │   Setup     │
                    │  (Phase 1)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │Foundation   │
                    │  (Phase 2)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   US7       │
                    │Auth & Users │
                    │  (Phase 3)  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼─────┐     ┌────▼────┐
    │   US1   │      │    US2    │     │   US7   │
    │Product  │      │ Inventory │     │  User   │
    │(Phase 4)│      │ (Phase 5) │     │ Mgmt    │
    └────┬────┘      └─────┬─────┘     └─────────┘
         │                 │
    ┌────▼────┐      ┌─────▼─────┐
    │   US3   │      │    US4    │
    │ Receipt │      │   Issue   │
    │(Phase 6)│      │ (Phase 7) │
    └─────────┘      └───────────┘
         │                 │
         └────────┬────────┘
                  │
         ┌────────┼────────┐
         │        │        │
    ┌────▼───┐ ┌──▼───┐ ┌──▼───┐
    │  US5   │ │ US6  │ │ US8  │
    │Adjust  │ │Report│ │Alert │
    └────────┘ └──────┘ └──────┘
```

### Parallel Opportunities

- **Phase 1**: T002-T009 can run in parallel
- **Phase 2**: All T011-T014, T019-T020, T025-T029, T031-T036, T037-T046, T048-T053 can run in parallel
- **Within User Stories**: Tests [P], Entities [P], Frontend components [P] can run in parallel
- **Dashboard (Phase 11)**: Can run in parallel with user story implementation
- **E2E Tests (Phase 12)**: All tests can run in parallel once features are complete

---

## Parallel Example: User Story 1 (Product Management)

```bash
# Phase 4A - All tests in parallel (TDD first):
Task: T082 - Test for SKU uniqueness
Task: T083 - Test for hierarchical categories
Task: T084 - Test for unit conversions
Task: T085 - E2E test for product CRUD

# Phase 4B - All entities in parallel:
Task: T086 - Category entity
Task: T087 - Unit entity
Task: T088 - Product entity

# Phase 4C - Sequential implementation:
Task: T089 → T090 → T091 → T092 → T093 → T094

# Phase 4D - Frontend types/schemas in parallel:
Task: T095 - Product types
Task: T096 - Product schemas

# Phase 4E - Frontend components in parallel:
Task: T099 - ProductList component
Task: T100 - ProductForm component
Task: T101 - ProductCard component
Task: T102 - ProductSearch component
```

---

## Implementation Strategy

### MVP First (User Stories 7, 1, 2, 3, 4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 7 (Authentication - REQUIRED)
4. Complete Phase 4-7: User Stories 1-4 (Core functionality)
5. **STOP and VALIDATE**: Test core workflows independently
6. Deploy MVP demo

### Incremental Delivery

1. Setup + Foundation → Infrastructure ready
2. Add US7 → Auth working → Deploy
3. Add US1 → Products working → Deploy
4. Add US2 → Inventory tracking → Deploy
5. Add US3 → Goods receipts → Deploy
6. Add US4 → Goods issues → Deploy (MVP Complete!)
7. Add US5 → Adjustments → Deploy
8. Add US6 → Reports → Deploy
9. Add US8 → Notifications → Deploy (Full MVP!)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD: Write tests first, verify they FAIL, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Target 70%+ test coverage for all modules
