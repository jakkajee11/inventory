# Product Requirements Document (PRD)
## Inventory Management System
### ระบบจัดการคลังสินค้าสำหรับธุรกิจ SME

---

## สารบัญ

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users & Personas](#3-target-users--personas)
4. [Functional Requirements (MVP)](#4-functional-requirements-mvp)
5. [Data Model](#5-data-model)
6. [Business Rules](#6-business-rules)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Architecture Overview](#8-architecture-overview)
9. [User Interface Guidelines](#9-user-interface-guidelines)
10. [Roadmap & Phases](#10-roadmap--phases)
11. [Out of Scope](#11-out-of-scope)
12. [Appendix](#12-appendix)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment & Operations](#14-deployment--operations)

---

## 1. Executive Summary

### 1.1 ภาพรวมระบบ

**Inventory Management System (IMS)** เป็นระบบจัดการคลังสินค้าแบบครบวงจร ออกแบบมาสำหรับธุรกิจ SME ทุกประเภท ไม่ว่าจะเป็น Retail, Wholesale, Manufacturing หรือ E-commerce โดยระบบมีความสามารถในการปรับขนาด (Scalable) และขยายฟีเจอร์ได้ (Extensible) รองรับการทำงานหลายสาขาและหลายคลังสินค้า

### 1.2 Business Case

| ประเด็น | รายละเอียด |
|---------|------------|
| **ปัญหาที่พบ** | ธุรกิจ SME ส่วนใหญ่ยังใช้ Excel หรือการบันทึกด้วยมือในการจัดการสินค้า ทำให้เกิดข้อผิดพลาด สินค้าขาด และข้อมูลไม่ Real-time |
| **โอกาส** | ตลาด SME ในประเทศไทยมีขนาดใหญ่ และมีแนวโน้ม Digital Transformation สูง โดยเฉพาะหลัง COVID-19 |
| **คุณค่าที่มอบ** | ลดต้นทุนการจัดการสินค้า 30-50%, ลดเวลาในการตรวจสอบสต็อก 70%, เพิ่มความแม่นยำของข้อมูล 95%+ |
| **Target Launch** | MVP ภายใน 3 เดือน, Phase 2 ภายใน 6 เดือน |

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> "เป็นระบบจัดการคลังสินค้าที่ง่ายที่สุด แม่นยำที่สุด และเข้าถึงได้สำหรับธุรกิจ SME ทุกขนาด ให้เจ้าของธุรกิจสามารถตรวจสอบและจัดการสินค้าได้จากที่ไหนก็ได้ ตอนไหนก็ได้"

### 2.2 Goals & Objectives

| Goal | Objective | KPI |
|------|-----------|-----|
| **ความแม่นยำของข้อมูล** | ลดความคลาดเคลื่อนของสต็อก | ความแม่นยำ ≥ 99% |
| **ประสิทธิภาพการทำงาน** | ลดเวลาในการดำเนินการต่างๆ | ลดเวลา 60%+ |
| **การเข้าถึง** | รองรับหลาย Platform | Web + Mobile Apps |
| **Scalability** | รองรับการขยายธุรกิจ | ไม่จำกัดสาขา/คลัง |
| **User Adoption** | ให้ผู้ใช้สามารถใช้งานได้ง่าย | Training Time < 2 ชม. |

### 2.3 Success Metrics

#### MVP Phase (3 เดือนแรก)

- [ ] ผู้ใช้งาน Active 100+ ราย
- [ ] สินค้าในระบบ 10,000+ SKU
- [ ] ธุรกรรมต่อวัน 1,000+ รายการ
- [ ] User Satisfaction Score ≥ 4.0/5.0
- [ ] System Uptime ≥ 99.5%

---

## 3. Target Users & Personas

### 3.1 User Personas

#### Persona 1: เจ้าของร้านค้าปลีก (Retail Owner)

| รายละเอียด | ข้อมูล |
|------------|--------|
| **ชื่อ** | คุณสมศักดิ์ |
| **อายุ** | 35-45 ปี |
| **ธุรกิจ** | ร้านขายของชำ / Minimart |
| **สาขา** | 1-3 สาขา |
| **ความต้องการ** | ตรวจสอบสต็อกจากที่ไหนก็ได้, แจ้งเตือนสินค้าใกล้หมด, ดูรายงานยอดขาย |
| **Pain Points** | สินค้าหายบ่อย, ไม่รู้ว่าของเหลือเท่าไหร่, สั่งซื้อซ้ำซ้อน |
| **Tech Skill** | ปานกลาง (ใช้ Smartphone, Line ได้คล่อง) |

#### Persona 2: ผู้จัดการคลังสินค้า (Warehouse Manager)

| รายละเอียด | ข้อมูล |
|------------|--------|
| **ชื่อ** | คุณวรรณา |
| **อายุ** | 28-40 ปี |
| **ธุรกิจ** | บริษัทค้าส่ง |
| **ความต้องการ** | รับ-เบิกสินค้าแบบ Paperless, ติดตามการเคลื่อนไหว, จัดการพนักงาน |
| **Pain Points** | เอกสารหาย, ตรวจนับสต็อกใช้เวลานาน, การสื่อสารกับทีมช้า |
| **Tech Skill** | สูง (ใช้คอมพิวเตอร์และ Mobile ได้ดี) |

#### Persona 3: พนักงานคลังสินค้า (Warehouse Staff)

| รายละเอียด | ข้อมูล |
|------------|--------|
| **ชื่อ** | นายบุญมา |
| **อายุ** | 22-35 ปี |
**หน้าที่** | รับ-จ่ายสินค้า, ตรวจนับสต็อก, จัดเรียงสินค้า |
| **ความต้องการ** | ใช้งานง่าย, สแกนบาร์โค้ดได้, ไม่ต้องพิมพ์เยอะ |
| **Pain Points** | ระบบซับซ้อนเกินไป, ต้องจดจำขั้นตอนเยอะ |
| **Tech Skill** | ต่ำ-ปานกลาง (ใช้ Smartphone ได้) |

#### Persona 4: E-commerce Entrepreneur

| รายละเอียด | ข้อมูล |
|------------|--------|
| **ชื่อ** | คุณเจน |
| **อายุ** | 25-35 ปี |
| **ธุรกิจ** | ขายออนไลน์หลายช่องทาง (Shopee, Lazada, TikTok Shop) |
| **ความต้องการ** | จัดการสต็อกรวมศูนย์, Sync กับ Marketplace, แจ้งเตือนสต็อกต่ำ |
| **Pain Points** | สต็อกไม่ตรงกันทุกช่องทาง, Overselling, ต้องอัพเดททีละช่องทาง |
| **Tech Skill** | สูง (เข้าใจระบบ E-commerce ดี) |

### 3.2 User Stories (MVP)

#### US-001: Product Management
```
As a ผู้จัดการคลังสินค้า
I want to เพิ่ม/แก้ไข/ลบข้อมูลสินค้า
So that สามารถจัดการ Catalog สินค้าได้อย่างถูกต้อง

Acceptance Criteria:
- เพิ่มสินค้าใหม่ได้ พร้อมรูปภาพ, SKU, ราคา, หมวดหมู่
- แก้ไขข้อมูลสินค้าได้ พร้อม Audit Log
- ลบสินค้าได้ (Soft Delete) โดยไม่กระทบประวัติ
- ค้นหาสินค้าได้จากชื่อ, SKU, Barcode
```

#### US-002: Real-time Inventory Tracking
```
As a เจ้าของธุรกิจ
I want to ดูยอดสต็อกปัจจุบันแบบ Real-time
So that ตัดสินใจสั่งซื้อสินค้าได้ถูกต้อง

Acceptance Criteria:
- ดูยอดสต็อกปัจจุบันของทุกสินค้า
- ดูประวัติการเคลื่อนไหวของแต่ละสินค้า
- กรองข้อมูลตามวันที่, ประเภทการเคลื่อนไหว
- Export ข้อมูลเป็น Excel/CSV
```

#### US-003: Goods Receipt
```
As a พนักงานคลังสินค้า
I want to บันทึกการรับสินค้าเข้า
So that สต็อกเพิ่มขึ้นและมีหลักฐานการรับ

Acceptance Criteria:
- สร้างใบรับสินค้า พร้อมระบุ Supplier
- เพิ่มรายการสินค้าหลายรายการใน 1 ใบรับ
- แนบรูปภาพ/เอกสารประกอบได้
- อนุมัติโดยผู้มีสิทธิ์ก่อนอัพเดทสต็อก
```

#### US-004: Goods Issue
```
As a พนักงานคลังสินค้า
I want to บันทึกการเบิก/จ่ายสินค้า
So that สต็อกลดลงและมีหลักฐานการจ่าย

Acceptance Criteria:
- สร้างใบเบิกสินค้า พร้อมระบุเหตุผล
- เพิ่มรายการสินค้าหลายรายการใน 1 ใบเบิก
- ระบุผู้รับ/ปลายทางได้
- อนุมัติโดยผู้มีสิทธิ์ก่อนอัพเดทสต็อก
```

#### US-005: Basic Reports
```
As a เจ้าของธุรกิจ
I want to ดูรายงานสรุปสินค้าและการเคลื่อนไหว
So that วิเคราะห์และวางแผนการจัดการสินค้า

Acceptance Criteria:
- รายงานสต็อกคงเหลือ (สรุป/รายละเอียด)
- รายงานการเคลื่อนไหวสินค้า (รับเข้า/จ่ายออก)
- กรองตามวันที่, หมวดหมู่, สินค้า
- Export เป็น PDF/Excel
```

#### US-006: User Management
```
As a ผู้ดูแลระบบ
I want to จัดการผู้ใช้งานและสิทธิ์
So that ควบคุมการเข้าถึงระบบได้อย่างปลอดภัย

Acceptance Criteria:
- เพิ่ม/แก้ไข/ลบผู้ใช้งานได้
- กำหนด Role และ Permission ได้
- ดูประวัติการ Login และการใช้งาน
- Reset Password ได้
```

---

## 4. Functional Requirements (MVP)

### 4.1 FR-001: Product Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001-01 | สร้าง/แก้ไข/ลบ (Soft Delete) สินค้าได้ | P1 |
| FR-001-02 | ระบุข้อมูลสินค้า: ชื่อ, รายละเอียด, SKU, Barcode, หมวดหมู่, หน่วยนับ, ราคาทุน, ราคาขาย | P1 |
| FR-001-03 | อัพโหลดรูปภาพสินค้าได้ (สูงสุด 5 รูป) | P2 |
| FR-001-04 | จัดการหมวดหมู่สินค้าแบบ Multi-level (Tree) | P1 |
| FR-001-05 | จัดการหน่วยนับสินค้าและ Conversion Factor | P2 |
| FR-001-06 | ค้นหา/กรองสินค้าได้จากหลายฟิลด์ | P1 |
| FR-001-07 | Import/Export ข้อมูลสินค้าจาก Excel | P2 |

### 4.2 FR-002: Real-time Inventory Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002-01 | แสดงยอดสต็อกปัจจุบันของแต่ละสินค้า | P1 |
| FR-002-02 | แสดงประวัติการเคลื่อนไหว (Stock Movement) | P1 |
| FR-002-03 | แสดงสถานะสินค้า (พร้อมขาย, หมด, ระงับ) | P1 |
| FR-002-04 | กรองข้อมูลตามวันที่, ประเภท, สินค้า | P1 |
| FR-002-05 | แสดงมูลค่าสินค้าคงเหลือ (Inventory Valuation) | P2 |
| FR-002-06 | รองรับ FIFO/LIFO/Average Cost | P3 |

### 4.3 FR-003: Goods Receipt (รับสินค้าเข้า)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003-01 | สร้างใบรับสินค้า (Goods Receipt Note) | P1 |
| FR-003-02 | ระบุ Supplier และข้อมูลการสั่งซื้อ (PO No.) | P1 |
| FR-003-03 | เพิ่มรายการสินค้าหลายรายการใน 1 เอกสาร | P1 |
| FR-003-04 | ระบุจำนวน, ราคาต่อหน่วย, หมายเหตุ | P1 |
| FR-003-05 | แนบรูปภาพ/เอกสารประกอบได้ | P2 |
| FR-003-06 | Workflow อนุมัติก่อนอัพเดทสต็อก | P2 |
| FR-003-07 | พิมพ์ใบรับสินค้าได้ | P2 |

### 4.4 FR-004: Goods Issue (เบิก/จ่ายสินค้า)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004-01 | สร้างใบเบิกสินค้า (Goods Issue Note) | P1 |
| FR-004-02 | ระบุเหตุผลการเบิก (ขาย, เสีย, ใช้ภายใน, อื่นๆ) | P1 |
| FR-004-03 | เพิ่มรายการสินค้าหลายรายการใน 1 เอกสาร | P1 |
| FR-004-04 | ระบุจำนวน, หมายเหตุ, ผู้รับ | P1 |
| FR-004-05 | ตรวจสอบสต็อกก่อนเบิก (ไม่ให้ติดลบ) | P1 |
| FR-004-06 | แนบรูปภาพ/เอกสารประกอบได้ | P2 |
| FR-004-07 | Workflow อนุมัติก่อนอัพเดทสต็อก | P2 |
| FR-004-08 | พิมพ์ใบเบิกสินค้าได้ | P2 |

### 4.5 FR-005: Basic Reports

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005-01 | รายงานสต็อกคงเหลือ (Stock Report) | P1 |
| FR-005-02 | รายงานการเคลื่อนไหวสินค้า (Movement Report) | P1 |
| FR-005-03 | รายงานสินค้ารับเข้า (Receipt Report) | P1 |
| FR-005-04 | รายงานสินค้าจ่ายออก (Issue Report) | P1 |
| FR-005-05 | กรองตามวันที่, หมวดหมู่, สินค้า, ผู้ทำรายการ | P1 |
| FR-005-06 | Export เป็น PDF/Excel | P1 |
| FR-005-07 | Dashboard Summary (Cards/Charts) | P2 |

### 4.6 FR-006: User Management & Authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006-01 | ลงทะเบียน/ล็อกอินด้วย Email/Password | P1 |
| FR-006-02 | ล็อกอินด้วย Social (Google, Line) | P2 |
| FR-006-03 | จัดการผู้ใช้งาน (CRUD) | P1 |
| FR-006-04 | กำหนด Role (Admin, Manager, Staff, Viewer) | P1 |
| FR-006-05 | กำหนด Permission ระดับ Feature | P2 |
| FR-006-06 | Audit Log การทำรายการทุกครั้ง | P1 |
| FR-006-07 | Password Reset | P1 |
| FR-006-08 | Session Management | P1 |

### 4.7 FR-007: Alert & Notification System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007-01 | แจ้งเตือนสินค้าต่ำกว่า Min Stock | P1 |
| FR-007-02 | แจ้งเตือนสินค้าหมด (Zero Stock) | P1 |
| FR-007-03 | แจ้งเตือนเอกสารรออนุมัติ (Admin/Manager) | P2 |
| FR-007-04 | ช่องทางแจ้งเตือน: In-app Notification | P1 |
| FR-007-05 | ช่องทางแจ้งเตือน: Email | P2 |
| FR-007-06 | ช่องทางแจ้งเตือน: Line Notify | P3 |
| FR-007-07 | ตั้งค่า Threshold การแจ้งเตือนได้ | P2 |
| FR-007-08 | ประวัติการแจ้งเตือน (Notification History) | P2 |

### 4.8 FR-008: Stock Adjustment

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008-01 | สร้างใบปรับปรุงสต็อก (Stock Adjustment) | P1 |
| FR-008-02 | ระบุเหตุผลการปรับ (นับสต็อก, เสียหาย, คืนสินค้า, อื่นๆ) | P1 |
| FR-008-03 | ปรับเพิ่ม/ลดจำนวนสต็อกได้ | P1 |
| FR-008-04 | ระบุจำนวนใหม่ (Absolute) หรือผลต่าง (Delta) | P1 |
| FR-008-05 | แนบรูปภาพ/เอกสารประกอบได้ | P2 |
| FR-008-06 | Workflow อนุมัติก่อนอัพเดทสต็อก | P2 |
| FR-008-07 | บันทึกยอดก่อน/หลังปรับใน StockMovement | P1 |

### 4.9 FR-009: Stock Calculation Logic

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-009-01 | คำนวณยอดสต็อกปัจจุบันจากผลรวม StockMovement | P1 |
| FR-009-02 | ป้องกัน Negative Stock (ไม่ให้ติดลบ) | P1 |
| FR-009-03 | ใช้ Database Transaction สำหรับการเคลื่อนไหวสินค้า | P1 |
| FR-009-04 | Optimistic Locking ป้องกัน Concurrent Update | P1 |
| FR-009-05 | Re-calculate Stock เมื่อยกเลิกเอกสารที่อนุมัติแล้ว | P1 |
| FR-009-06 | Cost Calculation: Average Cost (เฉลี่ยถัว) | P2 |

---

## 5. Data Model

### 5.1 Entity Relationship Diagram (Overview)

```
                              ┌─────────────┐
                              │   Company   │
                              └─────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
  ┌─────────────┐            ┌─────────────┐            ┌─────────────┐
  │   Product   │            │   User      │            │  Warehouse  │
  └─────────────┘            └─────────────┘            └─────────────┘
         │                           │                           │
    ┌────┴────┐                      │                           │
    │         │                      │                           │
    ▼         ▼                      ▼                           │
┌────────┐ ┌────────┐         ┌─────────────┐                    │
│Category│ │  Unit  │         │    Role     │                    │
└────────┘ └────────┘         └─────────────┘                    │
    │                              │                              │
    └──────────────────────────────┼──────────────────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ StockMovement   │
                          └─────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
  │  GoodsReceipt   │      │   GoodsIssue    │      │StockAdjustment  │
  └─────────────────┘      └─────────────────┘      └─────────────────┘
         │                         │                         │
         ▼                         ▼                         ▼
  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
  │GoodsReceiptItem │      │ GoodsIssueItem  │      │AdjItem          │
  └─────────────────┘      └─────────────────┘      └─────────────────┘
         │                         │
         └────────────┬────────────┘
                      │
                      ▼
              ┌─────────────┐
              │  Supplier   │
              └─────────────┘

              ┌─────────────┐
              │Notification │
              └─────────────┘
```

### 5.2 Core Entities

#### 5.2.1 Product (สินค้า)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| sku | String(50) | Stock Keeping Unit (Unique) | Yes |
| barcode | String(50) | Barcode/EAN | No |
| name | String(255) | ชื่อสินค้า | Yes |
| description | Text | รายละเอียด | No |
| category_id | UUID | FK → Category | Yes |
| unit_id | UUID | FK → Unit | Yes |
| cost_price | Decimal(10,2) | ราคาทุน | Yes |
| selling_price | Decimal(10,2) | ราคาขาย | Yes |
| min_stock | Integer | จำนวนขั้นต่ำ | No |
| max_stock | Integer | จำนวนสูงสุด | No |
| weight | Decimal(10,3) | น้ำหนัก (kg) | No |
| dimensions | JSON | ขนาด (L×W×H) | No |
| is_active | Boolean | สถานะใช้งาน | Yes |
| images | JSON | URL รูปภาพ | No |
| created_at | Timestamp | วันที่สร้าง | Yes |
| updated_at | Timestamp | วันที่แก้ไข | Yes |
| deleted_at | Timestamp | Soft Delete | No |

#### 5.2.2 Category (หมวดหมู่)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| name | String(100) | ชื่อหมวดหมู่ | Yes |
| parent_id | UUID | FK → Category (Self) | No |
| description | Text | รายละเอียด | No |
| sort_order | Integer | ลำดับแสดง | No |
| is_active | Boolean | สถานะใช้งาน | Yes |

#### 5.2.3 Unit (หน่วยนับ)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| name | String(50) | ชื่อหน่วย (ชิ้น, กล่อง, แพ็ค) | Yes |
| abbreviation | String(10) | ตัวย่อ (pcs, box, pk) | Yes |
| base_unit_id | UUID | FK → Unit (หน่วยฐาน) | No |
| conversion_factor | Decimal(10,3) | ตัวคูณแปลง | No |

#### 5.2.4 StockMovement (การเคลื่อนไหวสินค้า)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| product_id | UUID | FK → Product | Yes |
| movement_type | Enum | IN, OUT, ADJUST | Yes |
| reference_type | Enum | RECEIPT, ISSUE, ADJUSTMENT | Yes |
| reference_id | UUID | FK → Receipt/Issue/Adjustment | Yes |
| quantity | Decimal(10,3) | จำนวน (+ เพิ่ม, - ลด) | Yes |
| unit_cost | Decimal(10,2) | ราคาต่อหน่วย | Yes |
| balance_after | Decimal(10,3) | ยอดคงเหลือหลังทำรายการ | Yes |
| warehouse_id | UUID | FK → Warehouse | No |
| notes | Text | หมายเหตุ | No |
| created_by | UUID | FK → User | Yes |
| created_at | Timestamp | วันที่ทำรายการ | Yes |

#### 5.2.5 GoodsReceipt (ใบรับสินค้า)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| receipt_number | String(20) | เลขที่ใบรับ (Auto-gen) | Yes |
| supplier_name | String(255) | ชื่อ Supplier | No |
| supplier_ref | String(50) | เลขที่อ้างอิง Supplier | No |
| receipt_date | Date | วันที่รับ | Yes |
| status | Enum | DRAFT, PENDING, APPROVED, CANCELLED | Yes |
| total_amount | Decimal(12,2) | มูลค่ารวม | Yes |
| notes | Text | หมายเหตุ | No |
| attachments | JSON | ไฟล์แนบ | No |
| created_by | UUID | FK → User | Yes |
| approved_by | UUID | FK → User | No |
| approved_at | Timestamp | วันที่อนุมัติ | No |
| created_at | Timestamp | วันที่สร้าง | Yes |

#### 5.2.6 GoodsReceiptItem (รายการใบรับสินค้า)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| receipt_id | UUID | FK → GoodsReceipt | Yes |
| product_id | UUID | FK → Product | Yes |
| quantity | Decimal(10,3) | จำนวน | Yes |
| unit_cost | Decimal(10,2) | ราคาต่อหน่วย | Yes |
| total_cost | Decimal(12,2) | มูลค่ารวม | Yes |
| notes | Text | หมายเหตุ | No |

#### 5.2.7 GoodsIssue (ใบเบิกสินค้า)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| issue_number | String(20) | เลขที่ใบเบิก (Auto-gen) | Yes |
| issue_type | Enum | SALE, DAMAGE, INTERNAL, OTHER | Yes |
| recipient_name | String(255) | ชื่อผู้รับ | No |
| issue_date | Date | วันที่เบิก | Yes |
| status | Enum | DRAFT, PENDING, APPROVED, CANCELLED | Yes |
| notes | Text | หมายเหตุ | No |
| attachments | JSON | ไฟล์แนบ | No |
| created_by | UUID | FK → User | Yes |
| approved_by | UUID | FK → User | No |
| approved_at | Timestamp | วันที่อนุมัติ | No |
| created_at | Timestamp | วันที่สร้าง | Yes |

#### 5.2.8 GoodsIssueItem (รายการใบเบิกสินค้า)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| issue_id | UUID | FK → GoodsIssue | Yes |
| product_id | UUID | FK → Product | Yes |
| quantity | Decimal(10,3) | จำนวน | Yes |
| unit_cost | Decimal(10,2) | ราคาต่อหน่วย (FIFO/Avg) | Yes |
| total_cost | Decimal(12,2) | มูลค่ารวม | Yes |
| notes | Text | หมายเหตุ | No |

#### 5.2.9 User (ผู้ใช้งาน)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| email | String(255) | Email (Unique) | Yes |
| password_hash | String(255) | Encrypted Password | Yes |
| name | String(255) | ชื่อ-นามสกุล | Yes |
| phone | String(20) | เบอร์โทรศัพท์ | No |
| role_id | UUID | FK → Role | Yes |
| warehouse_id | UUID | FK → Warehouse (Default) | No |
| is_active | Boolean | สถานะใช้งาน | Yes |
| last_login_at | Timestamp | ล็อกอินล่าสุด | No |
| created_at | Timestamp | วันที่สร้าง | Yes |
| updated_at | Timestamp | วันที่แก้ไข | Yes |

#### 5.2.10 Role (บทบาท)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| name | String(50) | ชื่อ Role | Yes |
| description | Text | รายละเอียด | No |
| is_system | Boolean | เป็น System Role หรือไม่ | Yes |

**Default Roles:**
- **Admin**: Full Access
- **Manager**: จัดการสินค้า, รับ-เบิก, ดูรายงาน
- **Staff**: รับ-เบิกสินค้า
- **Viewer**: ดูข้อมูลได้อย่างเดียว

#### 5.2.11 Permission (สิทธิ์)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| role_id | UUID | FK → Role | Yes |
| module | String(50) | ชื่อ Module | Yes |
| action | String(50) | CREATE, READ, UPDATE, DELETE, APPROVE | Yes |
| is_granted | Boolean | ให้สิทธิ์หรือไม่ | Yes |

#### 5.2.12 Warehouse (คลังสินค้า)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| code | String(20) | รหัสคลัง (Unique) | Yes |
| name | String(100) | ชื่อคลังสินค้า | Yes |
| description | Text | รายละเอียด | No |
| address | Text | ที่อยู่ | No |
| phone | String(20) | เบอร์โทรศัพท์ | No |
| is_active | Boolean | สถานะใช้งาน | Yes |
| is_default | Boolean | เป็นคลังหลักหรือไม่ | Yes |
| created_at | Timestamp | วันที่สร้าง | Yes |
| updated_at | Timestamp | วันที่แก้ไข | Yes |

**หมายเหตุ:** MVP มี Default Warehouse 1 คลัง รองรับหลายคลังใน Phase 2

#### 5.2.13 Supplier (ผู้จัดส่ง)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| code | String(20) | รหัส Supplier (Unique) | Yes |
| name | String(255) | ชื่อ Supplier | Yes |
| contact_name | String(100) | ชื่อผู้ติดต่อ | No |
| phone | String(20) | เบอร์โทรศัพท์ | No |
| email | String(255) | Email | No |
| address | Text | ที่อยู่ | No |
| tax_id | String(13) | เลขประจำตัวผู้เสียภาษี | No |
| payment_terms | Integer | เงื่อนไขชำระเงิน (วัน) | No |
| notes | Text | หมายเหตุ | No |
| is_active | Boolean | สถานะใช้งาน | Yes |
| created_at | Timestamp | วันที่สร้าง | Yes |
| updated_at | Timestamp | วันที่แก้ไข | Yes |

**หมายเหตุ:** MVP ระบุชื่อ Supplier แบบ Text ได้ จัดการ Supplier Entity เต็มรูปแบบใน Phase 2

#### 5.2.14 StockAdjustment (ใบปรับปรุงสต็อก)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| adjustment_number | String(20) | เลขที่ใบปรับ (Auto-gen) | Yes |
| adjustment_type | Enum | COUNT, DAMAGE, RETURN, OTHER | Yes |
| adjustment_date | Date | วันที่ปรับ | Yes |
| status | Enum | DRAFT, PENDING, APPROVED, CANCELLED | Yes |
| notes | Text | หมายเหตุ | No |
| attachments | JSON | ไฟล์แนบ | No |
| created_by | UUID | FK → User | Yes |
| approved_by | UUID | FK → User | No |
| approved_at | Timestamp | วันที่อนุมัติ | No |
| created_at | Timestamp | วันที่สร้าง | Yes |

#### 5.2.15 StockAdjustmentItem (รายการใบปรับปรุงสต็อก)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| adjustment_id | UUID | FK → StockAdjustment | Yes |
| product_id | UUID | FK → Product | Yes |
| quantity_before | Decimal(10,3) | จำนวนก่อนปรับ | Yes |
| quantity_after | Decimal(10,3) | จำนวนหลังปรับ | Yes |
| quantity_diff | Decimal(10,3) | ผลต่าง (+/-) | Yes |
| unit_cost | Decimal(10,2) | ราคาต่อหน่วย | Yes |
| notes | Text | หมายเหตุ | No |

#### 5.2.16 Notification (การแจ้งเตือน)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| user_id | UUID | FK → User | Yes |
| type | Enum | LOW_STOCK, ZERO_STOCK, PENDING_APPROVAL, SYSTEM | Yes |
| title | String(255) | หัวข้อ | Yes |
| message | Text | ข้อความ | Yes |
| data | JSON | ข้อมูลเพิ่มเติม (product_id, etc.) | No |
| is_read | Boolean | อ่านแล้วหรือยัง | Yes |
| read_at | Timestamp | วันที่อ่าน | No |
| sent_via | Enum | IN_APP, EMAIL, LINE | Yes |
| sent_at | Timestamp | วันที่ส่ง | Yes |
| created_at | Timestamp | วันที่สร้าง | Yes |

#### 5.2.17 Company (บริษัท)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| name | String(255) | ชื่อบริษัท | Yes |
| tax_id | String(13) | เลขประจำตัวผู้เสียภาษี | No |
| address | Text | ที่อยู่ | No |
| phone | String(20) | เบอร์โทรศัพท์ | No |
| email | String(255) | Email | No |
| currency | String(3) | สกุลเงิน (THB, USD) | Yes |
| timezone | String(50) | Timezone (Asia/Bangkok) | Yes |
| logo_url | String(500) | URL โลโก้ | No |
| settings | JSON | การตั้งค่าระบบ | Yes |
| created_at | Timestamp | วันที่สร้าง | Yes |
| updated_at | Timestamp | วันที่แก้ไข | Yes |

#### 5.2.18 AuditLog (ประวัติการใช้งาน)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| user_id | UUID | FK → User | Yes |
| action | Enum | CREATE, UPDATE, DELETE, APPROVE, LOGIN, EXPORT | Yes |
| entity_type | String(50) | ประเภท Entity | Yes |
| entity_id | UUID | ID ของ Entity | Yes |
| old_value | JSON | ค่าเดิม | No |
| new_value | JSON | ค่าใหม่ | No |
| ip_address | String(45) | IP Address | No |
| user_agent | String(500) | User Agent | No |
| created_at | Timestamp | วันที่ทำรายการ | Yes |

#### 5.2.19 SystemSetting (การตั้งค่าระบบ)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary Key | Yes |
| company_id | UUID | FK → Company | Yes |
| key | String(100) | ชื่อ Setting (Unique per company) | Yes |
| value | JSON | ค่า Setting | Yes |
| description | Text | คำอธิบาย | No |
| updated_by | UUID | FK → User | No |
| updated_at | Timestamp | วันที่แก้ไข | Yes |

**Default Settings:**
| Key | Default Value | Description |
|-----|---------------|-------------|
| auto_approve_threshold | 5000 | มูลค่าต่ำกว่านี้อนุมัติอัตโนมัติ |
| low_stock_alert_enabled | true | เปิดการแจ้งเตือนสต็อกต่ำ |
| notification_email | true | ส่งแจ้งเตือนทาง Email |
| session_timeout_hours | 24 | อายุ Session (ชม.) |

---

## 6. Business Rules

### 6.1 Stock Management Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SM-01 | **Negative Stock Prevention** | ระบบไม่อนุญาตให้สต็อกติดลบ ต้องตรวจสอบก่อนทำรายการเบิก |
| BR-SM-02 | **Stock Calculation** | ยอดสต็อกปัจจุบัน = SUM(quantity) จาก StockMovement ที่ status = APPROVED |
| BR-SM-03 | **Cost Calculation** | ใช้ Weighted Average Cost = (มูลค่าสินค้าเดิม + มูลค่าสินค้าใหม่) / จำนวนรวม |

#### 6.1.1 ตัวอย่างการคำนวณ Weighted Average Cost

```
สินค้า A มีสต็อกและการรับเข้าดังนี้:

┌─────────────────┬──────────┬──────────┬────────────┐
│ รายการ          │ จำนวน    │ ราคา/หน่วย│ มูลค่ารวม  │
├─────────────────┼──────────┼──────────┼────────────┤
│ สต็อกเดิม       │ 100 ชิ้น │ ฿10      │ ฿1,000     │
│ รับเข้าใหม่     │ 50 ชิ้น  │ ฿15      │ ฿750       │
├─────────────────┼──────────┼──────────┼────────────┤
│ รวม             │ 150 ชิ้น │          │ ฿1,750     │
└─────────────────┴──────────┴──────────┴────────────┘

Weighted Average Cost = ฿1,750 / 150 = ฿11.67/ชิ้น

เมื่อเบิกสินค้า 30 ชิ้น:
- ต้นทุนสินค้าที่เบิก = 30 × ฿11.67 = ฿350.10
- มูลค่าสต็อกคงเหลือ = 120 × ฿11.67 = ฿1,400.40
- จำนวนสต็อกคงเหลือ = 120 ชิ้น
```
| BR-SM-04 | **Movement Sequence** | StockMovement ต้องบันทึกตามลำดับเวลา ไม่สามารถ backdate ได้ |
| BR-SM-05 | **Balance Recording** | balance_after ใน StockMovement ต้องคำนวณจาก balance ก่อนหน้า + quantity |

### 6.2 Document Status Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-DOC-01 | **Status Flow** | DRAFT → PENDING → APPROVED หรือ CANCELLED |
| BR-DOC-02 | **Draft Edit** | เอกสารสถานะ DRAFT แก้ไขได้ทุกฟิลด์ |
| BR-DOC-03 | **Pending Lock** | เอกสารสถานะ PENDING ไม่สามารถแก้ไขได้ |
| BR-DOC-04 | **Approved Immutable** | เอกสารสถานะ APPROVED ไม่สามารถแก้ไขหรือลบได้ |
| BR-DOC-05 | **Cancellation** | เอกสาร APPROVED สามารถ CANCEL ได้ แต่ต้องทำ Reversal |
| BR-DOC-06 | **Reversal** | การยกเลิกเอกสาร APPROVED ต้องสร้าง StockMovement ย้อนกลับ |

### 6.3 Approval Workflow Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-APR-01 | **Auto-Approve Threshold** | เอกสารมูลค่าต่ำกว่า ฿5,000 อนุมัติอัตโนมัติได้ (configurable) |
| BR-APR-02 | **Approver Role** | เฉพาะ Admin และ Manager เท่านั้นที่สามารถอนุมัติได้ |
| BR-APR-03 | **Self-Approval** | ผู้สร้างเอกสารไม่สามารถอนุมัติเอกสารตัวเองได้ |
| BR-APR-04 | **Approval Sequence** | อนุมัติเอกสาร → สร้าง StockMovement → อัพเดทสต็อก |

### 6.4 Low Stock Alert Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ALT-01 | **Alert Trigger** | แจ้งเตือนเมื่อสต็อก ≤ min_stock |
| BR-ALT-02 | **Zero Stock Alert** | แจ้งเตือนทันทีเมื่อสต็อก = 0 |
| BR-ALT-03 | **Alert Frequency** | ส่งแจ้งเตือน 1 ครั้งต่อสินค้าต่อวัน (ไม่ spam) |
| BR-ALT-04 | **Alert Recipients** | ส่งให้ Admin, Manager และผู้ที่ตั้งค่ารับแจ้งเตือน |

### 6.5 Product Management Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-PRD-01 | **SKU Uniqueness** | SKU ต้องไม่ซ้ำในระบบ |
| BR-PRD-02 | **Barcode Optional** | Barcode ไม่บังคับ แต่ถ้ามีต้องไม่ซ้ำ |
| BR-PRD-03 | **Soft Delete** | การลบสินค้าเป็น Soft Delete (ตั้ง deleted_at) |
| BR-PRD-04 | **Delete Constraint** | สินค้าที่มีประวัติการเคลื่อนไหวไม่สามารถลบได้ (แม้ Soft Delete) |
| BR-PRD-05 | **Inactive Product** | สินค้าที่ inactive ไม่แสดงในรายการเลือก แต่คงประวัติไว้ |

### 6.6 User & Permission Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-USR-01 | **Email Uniqueness** | Email ต้องไม่ซ้ำในระบบ |
| BR-USR-02 | **Default Role** | ผู้ใช้ใหม่ได้ Role = Viewer by default |
| BR-USR-03 | **Admin Protection** | Admin สุดท้ายในระบบไม่สามารถลบหรือลดสิทธิ์ได้ |
| BR-USR-04 | **Session Timeout** | Session หมดอายุใน 24 ชม. ต้อง re-login |
| BR-USR-05 | **Password History** | ไม่สามารถใช้รหัสผ่าน 5 ครั้งล่าสุดซ้ำได้ |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P01 | Page Load Time | < 3 วินาที (3G) |
| NFR-P02 | API Response Time | < 500ms (P95) |
| NFR-P03 | Report Generation | < 10 วินาที |
| NFR-P04 | Concurrent Users | รองรับ 100+ concurrent |
| NFR-P05 | Database Query | < 100ms (Indexed queries) |

### 7.2 Security

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-S01 | Authentication | JWT Token + Refresh Token |
| NFR-S02 | Password Policy | Min 8 chars, Mixed case + Number |
| NFR-S03 | Data Encryption | HTTPS/TLS 1.3, AES-256 at rest |
| NFR-S04 | SQL Injection | Parameterized queries |
| NFR-S05 | XSS Prevention | Input sanitization, CSP |
| NFR-S06 | CSRF Protection | Token-based |
| NFR-S07 | Rate Limiting | 100 req/min per user |
| NFR-S08 | Audit Trail | Log ทุก action สำคัญ |
| NFR-S09 | Data Backup | Daily backup, 30 days retention |

### 7.3 Usability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-U01 | Responsive Design | รองรับ Desktop, Tablet, Mobile |
| NFR-U02 | Accessibility | WCAG 2.1 Level AA |
| NFR-U03 | Language | Thai + English |
| NFR-U04 | Error Messages | ข้อความชัดเจน, แนะนำวิธีแก้ |
| NFR-U05 | Help Documentation | User Guide, FAQ |
| NFR-U06 | Onboarding | Tutorial แนะนำระบบ |

### 7.4 Scalability

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-SC01 | Horizontal Scaling | รองรับ Multiple Instances |
| NFR-SC02 | Database Sharding | พร้อมสำหรับการแบ่ง DB |
| NFR-SC03 | CDN | Static assets ผ่าน CDN |
| NFR-SC04 | Caching | Redis for session, query cache |

### 7.5 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-R01 | System Uptime | 99.5%+ |
| NFR-R02 | Data Durability | 99.99% |
| NFR-R03 | Error Recovery | Auto-retry, Circuit breaker |
| NFR-R04 | Graceful Degradation | Fallback UI/API |

### 7.6 Data Migration

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-M01 | Excel Import | รองรับ Import จาก Excel (.xlsx, .csv) |
| NFR-M02 | Import Template | มี Template สำหรับ Import สินค้า, หมวดหมู่ |
| NFR-M03 | Data Validation | Validate ข้อมูลก่อน Import พร้อม Error Report |
| NFR-M04 | Batch Import | Import ได้สูงสุด 1,000 รายการ/ครั้ง |
| NFR-M05 | Import Preview | แสดง Preview ก่อน Confirm Import |
| NFR-M06 | Rollback Import | สามารถยกเลิก Import ที่ผิดพลาดได้ |

### 7.7 Disaster Recovery

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-DR01 | Recovery Time Objective (RTO) | < 4 ชั่วโมง |
| NFR-DR02 | Recovery Point Objective (RPO) | < 1 ชั่วโมง |
| NFR-DR03 | Backup Frequency | Full backup วันละ 1 ครั้ง, Incremental ทุก 6 ชม. |
| NFR-DR04 | Backup Retention | 30 วัน (Full), 7 วัน (Incremental) |
| NFR-DR05 | Backup Location | Cross-region backup (แยก region จาก production) |
| NFR-DR06 | DR Testing | ทดสอบ DR ทุก 3 เดือน |
| NFR-DR07 | Failover | Automatic failover สำหรับ Database |

### 7.8 PDPA Compliance (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล)

| ID | Requirement | Detail |
|----|-------------|--------|
| NFR-PD01 | Data Minimization | เก็บเฉพาะข้อมูลที่จำเป็นต่อการให้บริการ |
| NFR-PD02 | Consent Management | ขอความยินยอมก่อนเก็บข้อมูลส่วนบุคคล |
| NFR-PD03 | Data Access Right | ผู้ใช้สามารถขอดู/แก้ไข/ลบข้อมูลตัวเองได้ |
| NFR-PD04 | Data Portability | สามารถ Export ข้อมูลส่วนบุคคลได้ |
| NFR-PD05 | Data Retention | เก็บข้อมูลตามกำหนด ลบเมื่อหมดความจำเป็น |
| NFR-PD06 | Right to be Forgotten | รองรับการลบข้อมูลเมื่อผู้ใช้ขอ |
| NFR-PD07 | Privacy Notice | แสดงนโยบายความเป็นส่วนตัวชัดเจน |
| NFR-PD08 | Data Breach Notification | แจ้งผู้ใช้ภายใน 72 ชม. เมื่อเกิด Data Breach |
| NFR-PD09 | Access Log | บันทึกการเข้าถึงข้อมูลส่วนบุคคลทุกครั้ง |
| NFR-PD10 | Data Encryption | เข้ารหัสข้อมูลส่วนบุคคลที่ sensitive |

---

## 8. Architecture Overview

### 8.1 High-level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────┬─────────────────────┬─────────────────────┤
│   Web Application   │   Mobile App (iOS)  │ Mobile App (Android)│
│   (React/Next.js)   │   (React Native)    │   (React Native)    │
└─────────────────────┴─────────────────────┴─────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API Gateway                            │
│              (Rate Limiting, Auth, Load Balancing)              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
├─────────────┬─────────────┬─────────────┬─────────────────────┬─┤
│   Product   │  Inventory  │   Reports   │      User/Auth      │ │
│   Service   │   Service   │   Service   │       Service       │ │
└─────────────┴─────────────┴─────────────┴─────────────────────┴─┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Data Layer                             │
├─────────────────────┬─────────────────────┬─────────────────────┤
│  PostgreSQL (Main)  │   Redis (Cache)     │   S3 (Files)        │
└─────────────────────┴─────────────────────┴─────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       External Integrations                     │
├─────────────┬─────────────┬─────────────┬─────────────────────┬─┤
│   Shopee    │   Lazada    │  TikTok     │     POS/ERP         │ │
│    API      │    API      │   Shop API  │     Systems         │ │
└─────────────┴─────────────┴─────────────┴─────────────────────┴─┘
```

### 8.2 Technology Recommendations

#### Frontend

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Web Framework | Next.js 14+ | SSR, SEO-friendly, React ecosystem |
| State Management | Zustand / React Query | Lightweight, Server-state handling |
| UI Components | shadcn/ui + Tailwind CSS | Modern, Customizable, Accessible |
| Forms | React Hook Form + Zod | Performance, Validation |
| Mobile | React Native + Expo | Cross-platform, Code sharing |

#### Backend

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20+ / Bun | Performance, JavaScript ecosystem |
| Framework | NestJS / Hono | Modular, TypeScript-native |
| Database | PostgreSQL 16 | ACID, JSON support, Extensions |
| ORM | Prisma / Drizzle | Type-safe, Migrations |
| Cache | Redis | Session, Query cache, Pub/Sub |
| File Storage | AWS S3 / MinIO | Scalable, Cost-effective |
| Queue | BullMQ / Redis | Background jobs |

#### Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Cloud Provider | AWS / GCP / Azure | Scalability, Services |
| Container | Docker + Kubernetes | Portability, Orchestration |
| CI/CD | GitHub Actions | Integration, Automation |
| Monitoring | Datadog / Grafana | APM, Metrics, Logging |
| Error Tracking | Sentry | Error monitoring |

### 8.3 API Design Guidelines

#### RESTful API Standards

```
Base URL: https://api.inventory.com/v1

Resources:
- GET    /products           - List products
- POST   /products           - Create product
- GET    /products/:id       - Get product
- PUT    /products/:id       - Update product
- DELETE /products/:id       - Delete product

- GET    /inventory          - List inventory
- GET    /inventory/:id/movements - Get movements

- POST   /goods-receipts     - Create receipt
- POST   /goods-issues       - Create issue

- GET    /reports/stock      - Stock report
- GET    /reports/movements  - Movement report
```

#### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "quantity", "message": "Must be greater than 0" }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 8.4 Integration Points (Phase 2+)

| Integration | Purpose | Priority |
|-------------|---------|----------|
| Shopee API | Sync orders, inventory | P1 |
| Lazada API | Sync orders, inventory | P1 |
| TikTok Shop API | Sync orders, inventory | P1 |
| Barcode Scanner | Hardware integration | P1 |
| Thermal Printer | Print labels, receipts | P1 |
| Accounting Software | Export financial data | P2 |
| POS Systems | Real-time sync | P2 |

### 8.5 API Versioning Strategy

| Strategy | Description |
|----------|-------------|
| **URL Versioning** | `/api/v1/products`, `/api/v2/products` |
| **Backward Compatibility** | เวอร์ชันเก่ายังใช้งานได้อย่างน้อย 6 เดือน |
| **Deprecation Notice** | แจ้งเตือนล่วงหน้า 3 เดือนก่อนถอดออก |
| **Version Header** | `X-API-Version: 1.0.0` |

### 8.6 Background Jobs & Batch Processing

| Job Type | Description | Schedule |
|----------|-------------|----------|
| **Low Stock Check** | ตรวจสอบสินค้าต่ำ | Every 5 minutes |
| **Daily Summary** | สรุปยอดประจำวัน | Daily 00:05 |
| **Report Generation** | สร้างรายงานขนาดใหญ่ | On-demand (Queue) |
| **Data Cleanup** | ลบข้อมูลชั่วคราว | Daily 03:00 |
| **Backup** | สำรองข้อมูล | Daily 04:00 |

---

## 9. User Interface Guidelines

### 9.1 Design Principles

| Principle | Description |
|-----------|-------------|
| **Clean & Simple** | ลดสิ่งรบกวน, Focus ที่สิ่งสำคัญ |
| **Consistent** | ใช้ Pattern เดียวกันทั้งระบบ |
| **Mobile-First** | ออกแบบสำหรับ Mobile ก่อน |
| **Fast** | โหลดเร็ว, ใช้งานง่าย |
| **Thai-Friendly** | รองรับภาษาไทย, วันที่/เวลา, สกุลเงิน |

### 9.2 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #2563EB | Buttons, Links, Active states |
| Success | #10B981 | Success messages, In-stock |
| Warning | #F59E0B | Warnings, Low stock |
| Danger | #EF4444 | Errors, Out of stock |
| Neutral | #64748B | Text, Borders |
| Background | #F8FAFC | Page background |

### 9.3 Key Screens

#### 9.3.1 Dashboard (หน้าหลัก)

```
┌────────────────────────────────────────────────────────┐
│  📦 Inventory System              🔔  👤 สมศักดิ์ ▼     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 📊 สินค้า │  │ 📥 รับ   │  │ 📤 เบิก  │  │ ⚠️ ต่ำ │ │
│  │  1,234   │  │   45     │  │   32     │  │   12   │ │
│  │   SKU    │  │  วันนี้   │  │  วันนี้   │  │ สินค้า  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                        │
│  📈 การเคลื่อนไหว 7 วันล่าสุด                           │
│  ┌────────────────────────────────────────────────┐   │
│  │         📊 Chart Area                           │   │
│  │                                                │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  📋 รายการล่าสุด                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │ 📥 รับสินค้า #GR-2024-0123  -  2 นาทีที่แล้ว     │   │
│  │ 📤 เบิกสินค้า #GI-2024-0456   -  15 นาทีที่แล้ว  │   │
│  │ ✏️ แก้ไขสินค้า SKU-001       -  1 ชั่วโมงที่แล้ว │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 9.3.2 Product List (รายการสินค้า)

```
┌────────────────────────────────────────────────────────┐
│  📦 สินค้า                                             │
├────────────────────────────────────────────────────────┤
│  🔍 ค้นหาสินค้า...          [+ เพิ่มสินค้า]  [Import]  │
├────────────────────────────────────────────────────────┤
│  กรอง: [หมวดหมู่ ▼] [สถานะ ▼]    เรียง: [ชื่อ ▼]     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────┬───────────────┬─────────┬────────┬────────┐   │
│  │ 📷 │ ชื่อสินค้า     │ หมวดหมู่ │  สต็อก  │  ราคา  │   │
│  ├────┼───────────────┼─────────┼────────┼────────┤   │
│  │ 🖼️ │ น้ำดื่ม 600ml  │ เครื่องดื่ม │ 150   │ ฿7    │   │
│  │ 🖼️ │ ขนมปัง        │ ขนม      │ 80 ✅  │ ฿25   │   │
│  │ 🖼️ │ นมสด 1L       │ เครื่องดื่ม │ 12 ⚠️ │ ฿45   │   │
│  │ 🖼️ │ ไข่ไก่ (10)   │ อาหารสด  │ 0 ❌  │ ฿55   │   │
│  └────┴───────────────┴─────────┴────────┴────────┘   │
│                                                        │
│  ◀ 1 2 3 ... 10 ▶    แสดง 1-20 จาก 200 รายการ        │
└────────────────────────────────────────────────────────┘
```

#### 9.3.3 Goods Receipt Form (ฟอร์มรับสินค้า)

```
┌────────────────────────────────────────────────────────┐
│  📥 รับสินค้าเข้า                             [บันทึก] │
├────────────────────────────────────────────────────────┤
│                                                        │
│  เลขที่: GR-2024-0001          วันที่: [21/02/2024]   │
│                                                        │
│  Supplier: [ชื่อ Supplier ▼]  หรือ [เพิ่มใหม่]         │
│  เลขที่อ้างอิง: [________________________]             │
│                                                        │
│  ──────────────────────────────────────────────────── │
│                                                        │
│  รายการสินค้า                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │ SKU      │ ชื่อสินค้า     │ จำนวน │ ราคา │ รวม  │  │
│  ├──────────┼──────────────┼───────┼──────┼──────┤  │
│  │ SKU-001  │ น้ำดื่ม 600ml │  100  │ ฿5   │ ฿500 │  │
│  │ SKU-002  │ ขนมปัำง       │   50  │ ฿18  │ ฿900 │  │
│  │ [+ เพิ่มรายการ]                                  │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  มูลค่ารวม: ฿1,400                                    │
│                                                        │
│  หมายเหตุ:                                             │
│  ┌─────────────────────────────────────────────────┐  │
│  │                                                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  📎 แนบไฟล์: [เลือกไฟล์]                              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 9.4 Onboarding Flow

```
┌────────────────────────────────────────────────────────┐
│  🎉 ยินดีต้อนรับสู่ Inventory System                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ขั้นตอนที่ 1/4: ข้อมูลบริษัท                             │
│  ┌────────────────────────────────────────────────┐   │
│  │ ชื่อบริษัท: [________________________]          │   │
│  │ ประเภทธุรกิจ: [Retail ▼]                       │   │
│  │ สกุลเงิน: [THB ▼]                              │   │
│  │                                   [ถัดไป →]    │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ○ ○ ○ ○  (Progress Indicator)                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Onboarding Steps:**
1. ข้อมูลบริษัท (Company Info)
2. สร้างคลังหลัก (Default Warehouse)
3. Import/เพิ่มสินค้าเริ่มต้น
4. เชิญทีมงาน (Optional)

### 9.5 Keyboard Shortcuts (Power Users)

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Quick Search (ค้นหาสินค้า) |
| `Ctrl + N` | สร้างเอกสารใหม่ |
| `Ctrl + S` | บันทึก |
| `Ctrl + P` | พิมพ์ |
| `Ctrl + E` | Export |
| `Esc` | ปิด Modal/Dialog |
| `?` | แสดง Keyboard Shortcuts |

### 9.6 Dark Mode Support

| Mode | Background | Text | Primary |
|------|------------|------|---------|
| Light | #F8FAFC | #1E293B | #2563EB |
| Dark | #0F172A | #F1F5F9 | #3B82F6 |

---

## 10. Roadmap & Phases

### Phase 1: MVP (เดือนที่ 1-3)

**เป้าหมาย**: Core Features สำหรับใช้งานได้จริง

| Feature | เดือน 1 | เดือน 2 | เดือน 3 |
|---------|---------|---------|---------|
| Product Management | ✅ | | |
| Inventory Tracking | ✅ | | |
| Goods Receipt | | ✅ | |
| Goods Issue | | ✅ | |
| Basic Reports | | | ✅ |
| User Management | ✅ | ✅ | |
| Web Application | ✅ | ✅ | ✅ |

**Deliverables:**
- Web Application พร้อมใช้งาน
- API Documentation
- User Manual

### Phase 2: Extended Features (เดือนที่ 4-6)

**เป้าหมาย**: เพิ่มความสามารถและ Integration

| Feature | Priority |
|---------|----------|
| Multi-warehouse/Branch | P1 |
| Barcode/QR Scanning | P1 |
| Label Printing | P1 |
| Low Stock Alerts | P1 |
| Mobile App (iOS/Android) | P1 |
| Supplier Management | P2 |
| Purchase Order | P2 |
| Advanced Dashboard | P2 |

### Phase 3: Integrations (เดือนที่ 7-9)

**เป้าหมาย**: เชื่อมต่อกับระบบภายนอก

| Feature | Priority |
|---------|----------|
| Shopee Integration | P1 |
| Lazada Integration | P1 |
| TikTok Shop Integration | P1 |
| POS Integration | P2 |
| Accounting Export | P2 |

### Phase 4: Advanced Features (เดือนที่ 10-12)

**เป้าหมาย**: Analytics และ AI

| Feature | Priority |
|---------|----------|
| Advanced Analytics | P1 |
| Demand Forecasting | P2 |
| Serial/Batch Tracking | P2 |
| Expiry Date Management | P2 |
| Multi-currency | P3 |

---

## 11. Out of Scope

### 11.1 Features ที่ไม่รวมใน MVP และ Phase 2

| Feature | เหตุผลที่ไม่ทำ |
|---------|---------------|
| **POS System** | ต้องการ Hardware integration เฉพาะ ควรใช้ระบบ POS แยก |
| **Accounting Module** | ซับซ้อม ควร integrate กับ Accounting Software มีอยู่ |
| **HR/Payroll** | ไม่เกี่ยวข้องกับ Inventory Management |
| **CRM/Sales** | เป็นความสามารถที่แตกต่างกัน |
| **Manufacturing/Production** | SME ส่วนใหญ่ไม่มีกระบวนการผลิต |
| **Serial Number Tracking** | ซับซ้อนเกินไปสำหรับ MVP |
| **Batch/Lot Tracking** | ต้องการในอุตสาหกรรมเฉพาะ (อาหาร, ยา) |
| **Expiry Date Management** | ต้องการในอุตสาหกรรมเฉพาะ (อาหาร, ยา) |
| **Multi-currency** | SME ไทยส่วนใหญ่ใช้ THB เท่านั้น |
| **Advanced Forecasting/AI** | ต้องการข้อมูลประวัติมากพอ |

### 11.2 Integrations ที่ไม่รวมใน MVP

| Integration | เหตุผลที่ไม่ทำ |
|-------------|---------------|
| **Shopify/WooCommerce** | ตลาดไทยใช้น้อย |
| **FB/Instagram Shop** | API จำกัด ซับซ้อน |
| **Payment Gateway** | เป็นหน้าที่ของ POS/Checkout |
| **Logistics/Shipping** | ต้องการ integration หลายค่าย |
| **Banking API** | เป็นหน้าที่ของ Accounting |

### 11.3 Platform ที่ไม่รวมใน MVP

| Platform | เหตุผลที่ไม่ทำ |
|----------|---------------|
| **Desktop App** | Web และ Mobile เพียงพอ |
| **Windows Phone** | Market share ต่ำมาก |
| **Tablet-only App** | Responsive Web รองรับแล้ว |

---

## 13. Testing Strategy

### 13.1 Testing Pyramid

```
          ┌─────┐
          │ E2E │  (10%) - Cypress/Playwright
          ├─────┤
          │ Int │  (20%) - Integration Tests
          ├─────┤
          │Unit │  (70%) - Jest/Vitest
          └─────┘
```

### 13.2 Test Coverage Requirements

| ประเภท | Minimum Coverage | Target |
|--------|------------------|--------|
| Unit Tests | 70% | 85% |
| Integration Tests | 50% | 70% |
| E2E Tests | Critical Paths | All User Stories |

### 13.3 Critical Test Scenarios

| ID | Scenario | Priority |
|----|----------|----------|
| TC-001 | สร้างใบรับสินค้า → สต็อกเพิ่ม | P0 |
| TC-002 | สร้างใบเบิกสินค้า → สต็อกลด | P0 |
| TC-003 | เบิกเกินสต็อก → Error | P0 |
| TC-004 | อนุมัติเอกสาร → StockMovement ถูกสร้าง | P0 |
| TC-005 | ยกเลิกเอกสาร APPROVED → StockMovement ย้อนกลับ | P0 |
| TC-006 | Concurrent update → Optimistic Lock ทำงาน | P1 |
| TC-007 | สต็อกต่ำกว่า min_stock → แจ้งเตือน | P1 |
| TC-008 | ล็อกอินด้วยข้อมูลผิด → แสดง error | P1 |

### 13.4 Test Data Strategy

| Strategy | Description |
|----------|-------------|
| **Factories** | ใช้ Factory Pattern สร้าง test data |
| **Fixtures** | เก็บ static test data สำหรับ E2E |
| **Database Seed** | รัน migration + seed ก่อน test |
| **Isolation** | แต่ละ test ใช้ transaction rollback |

---

## 14. Deployment & Operations

### 14.1 Pre-deployment Checklist

| หมวด | รายการ | ตรวจสอบ |
|------|--------|---------|
| **Code** | All tests passed | ☐ |
| | Code review completed | ☐ |
| | No critical security vulnerabilities | ☐ |
| | Dependencies updated & audited | ☐ |
| **Database** | Migration scripts tested | ☐ |
| | Backup completed | ☐ |
| | Rollback plan documented | ☐ |
| **Config** | Environment variables set | ☐ |
| | Secrets rotated (if required) | ☐ |
| **Monitoring** | Health checks configured | ☐ |
| | Alerts configured | ☐ |
| | Log aggregation working | ☐ |

### 14.2 Post-deployment Checklist

| รายการ | ตรวจสอบ |
|--------|---------|
| Health check endpoint returns 200 | ☐ |
| Login works correctly | ☐ |
| Critical flow works (create receipt → stock increases) | ☐ |
| Error tracking shows no new errors | ☐ |
| Response time within SLA (<500ms) | ☐ |
| Database connections healthy | ☐ |

### 14.3 API Error Codes

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| VALIDATION_ERROR | 400 | ข้อมูลไม่ถูกต้อง | Field required |
| UNAUTHORIZED | 401 | ไม่ได้ล็อกอิน | Token expired |
| FORBIDDEN | 403 | ไม่มีสิทธิ์ | Role not allowed |
| NOT_FOUND | 404 | ไม่พบข้อมูล | Product not found |
| CONFLICT | 409 | ข้อมูลซ้ำ | SKU already exists |
| INSUFFICIENT_STOCK | 422 | สต็อกไม่เพียงพอ | Quantity > available |
| INVALID_STATUS | 422 | สถานะไม่ถูกต้อง | Cannot approve DRAFT |
| OPTIMISTIC_LOCK | 422 | ข้อมูลถูกแก้ไขโดยผู้อื่น | Version mismatch |
| RATE_LIMIT | 429 | เรียก API ถี่เกินไป | Too many requests |
| INTERNAL_ERROR | 500 | ระบบขัดข้อง | Unexpected error |

---

## 12. Appendix

### 12.1 Glossary

| คำศัพท์ | ความหมาย |
|---------|----------|
| SKU | Stock Keeping Unit - รหัสสินค้าเฉพาะ |
| FIFO | First In First Out - สินค้าเข้าก่อนออกก่อน |
| LIFO | Last In First Out - สินค้าเข้าทีหลังออกก่อน |
| Goods Receipt | ใบรับสินค้าเข้า |
| Goods Issue | ใบเบิก/จ่ายสินค้า |
| Stock Movement | การเคลื่อนไหวของสินค้า |
| Inventory Valuation | การประเมินมูลค่าสินค้าคงเหลือ |
| Reorder Point | จุดสั่งซื้อซ้ำ |
| Safety Stock | สต็อกสำรอง |

### 12.2 References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Shopee Open Platform](https://open.shopee.com/)
- [Lazada Open Platform](https://open.lazada.com/)

### 12.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-02-21 | Product Team | Initial Release |
| 1.1 | 2024-02-22 | Product Team | Added: Warehouse, Supplier, StockAdjustment, Notification entities; FR-007 (Alert), FR-008 (Adjustment), FR-009 (Stock Logic); Business Rules; Data Migration; Disaster Recovery; PDPA Compliance; Out of Scope; Onboarding; Keyboard Shortcuts; Dark Mode |
| 1.2 | 2024-02-23 | Product Team | Fixed section numbering; Added Company, AuditLog, SystemSetting entities; Added calculation examples, Testing Strategy (Section 13), Deployment & Operations (Section 14) |

---

## อนุมัติเอกสาร

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Tech Lead | | | |
| Stakeholder | | | |

---

*เอกสารนี้จัดทำขึ้นสำหรับโครงการ Inventory Management System*
*หากมีข้อสงสัยหรือต้องการแก้ไข กรุณาติดต่อทีม Product*
