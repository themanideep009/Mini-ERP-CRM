# Mini ERP + CRM Operations Portal

A complete, production-quality, full-stack **Mini ERP + CRM Operations Portal** designed for wholesale and distribution enterprises. Built with **Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, React, and TypeScript**, this portal connects sales, warehouse, and accounting workflows with real-time inventory management, CRM lead tracking, and snapshot-based Sales Challans.

---

## 1. Project Overview
In wholesale and distribution businesses, sales executives, warehouse managers, and finance teams require a unified operations platform. The **Mini ERP + CRM Operations Portal** addresses this by providing:
- **CRM Module**: Lead and customer management, follow-up scheduling, GST validation, and customer classification (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`).
- **Product & Inventory Catalog**: Stock tracking, warehouse bin location indexing, minimum threshold alerts, and audit-ready Stock Movement logs (`IN` / `OUT`).
- **Sales Challan Workflow**: Multi-item draft creation, automated sequential numbering (`CH-YYYY-XXXX`), historical pricing snapshot retention, and atomic database transaction checks to guarantee zero negative stock.
- **Role-Based Operational Dashboard**: Persona-tailored executive KPIs, customer distribution metrics, low-stock warnings, and quick-action shortcuts.

---

## 2. Business Problem & Solution

### Business Pain Points:
1. **Overselling & Negative Stock**: Sales representatives booking orders without real-time inventory verification, leading to unfulfillable orders and customer dissatisfaction.
2. **Price Fluctuation Inaccuracies**: Products changing unit price after order issuance, distorting historical revenue audits.
3. **Siloed Communication**: Sales teams out of sync with warehouse stock arrivals and dispatch logs.

### Technical & Architecture Solution:
- **Prisma `$transaction` Atomicity**: Confirming a Sales Challan locks stock verification, deducts quantities, records `OUT` movement logs, and saves price snapshots in a single atomic transaction. If stock is insufficient for even 1 item, the entire transaction rolls back cleanly.
- **Snapshot Pricing Integrity**: Every `ChallanItem` preserves `productNameSnapshot`, `skuSnapshot`, and `unitPriceSnapshot` at creation time, preserving immutable accounting history.
- **Role-Based Security Guards**: Express middleware (`requireRole`) and React route guards (`ProtectedRoute`) restrict operational capabilities strictly to authorized employee roles (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`).

---

## 3. Features & Modules

### 👤 Authentication & Role Management
- JWT token authentication with bcrypt password hashing.
- Role-based authorization: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.
- Quick 1-Click Demo Account Login buttons on login page for effortless interview demonstrations.

### 👥 Customer CRM Module
- Search and filter by Customer Name, Business Name, GST, Status (`LEAD`, `ACTIVE`, `INACTIVE`), or Type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`).
- Follow-up date scheduling and notes history.
- Full Customer Order History linking all issued Sales Challans.

### 🏷️ Product Catalog & Inventory Ledger
- Product tracking with SKU, category, unit price, current stock, minimum stock alert, and warehouse bin location.
- Low-stock visual alerts when `currentStock <= minimumStock`.
- Stock Movement Ledger: Audit history of every stock `IN` (replenishment) and `OUT` (dispatch/write-off) with user attribution and timestamping.
- Manual Stock Adjustment Modal with negative stock safety guards.

### 📄 Sales Challan Module
- Step-by-step Challan Creator: Pick customer, add multiple products with live unit price lookup, subtotal calculation, and stock availability warning.
- Status Lifecycle: `DRAFT` ➔ `CONFIRMED` ➔ `CANCELLED`.
- Stock Deduction Logic: `DRAFT` does not deduct stock. `CONFIRMED` executes atomic transaction to deduct stock and create `OUT` movement logs. `CANCELLED` restores stock and creates `IN` movement logs.
- Print / Save to PDF formatted invoice layout.

### 📊 Dashboard & Metrics
- Key metrics: Total Customers, Product SKUs, Available Stock Units, Low Stock Warnings, Total/Confirmed/Draft Challans, Total Inventory Valuation.
- Recent Challans feed, Stock movement log, and Customer Status distribution.

---

## 4. Tech Stack

### Backend:
- **Runtime**: Node.js v20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma ORM v5
- **Authentication**: JWT (`jsonwebtoken`) & Password Hashing (`bcryptjs`)
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS

### Frontend:
- **Framework**: React 18 with TypeScript & Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with interceptors
- **Styling**: Vanilla CSS (Modern Industrial Palette with CSS Variables, Flex/Grid Utilities, Responsive Design)

### DevOps & Infrastructure:
- **Containerization**: Docker & Docker Compose
- **Database Tooling**: Prisma Client & Studio
- **API Documentation**: Postman Collection

---

## 5. System Architecture & Entity Relationships

```
                     +---------------------+
                     |     User (RBAC)     |
                     | ADMIN/SALES/WH/ACC  |
                     +----------+----------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
   +-------------------+                 +-------------------+
   |     Customer      |                 |   StockMovement   |
   | (LEAD/ACTIVE/...) |                 | (IN / OUT Audit)  |
   +---------+---------+                 +---------+---------+
             |                                     |
             v                                     v
   +-------------------+                 +-------------------+
   |   SalesChallan    |                 |      Product      |
   | (DRAFT/CONFIRMED) |                 | (Stock & Location)|
   +---------+---------+                 +---------+---------+
             |                                     |
             +------------------+------------------+
                                |
                                v
                      +-------------------+
                      |    ChallanItem    |
                      | (Snapshots & Qty) |
                      +-------------------+
```

---

## 6. Database Design

### Prisma Schema (`backend/prisma/schema.prisma`):

```prisma
enum Role {
  ADMIN
  SALES
  WAREHOUSE
  ACCOUNTS
}

enum CustomerType {
  RETAIL
  WHOLESALE
  DISTRIBUTOR
}

enum CustomerStatus {
  LEAD
  ACTIVE
  INACTIVE
}

enum MovementType {
  IN
  OUT
}

enum ChallanStatus {
  DRAFT
  CONFIRMED
  CANCELLED
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  challans  SalesChallan[]
  movements StockMovement[]
}

model Customer {
  id           String         @id @default(uuid())
  customerName String
  mobile       String
  email        String
  businessName String
  gstNumber    String
  customerType CustomerType
  address      String
  status       CustomerStatus @default(LEAD)
  followUpDate DateTime?
  notes        String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  challans     SalesChallan[]
}

model Product {
  id                String         @id @default(uuid())
  productName       String
  sku               String         @unique
  category          String
  unitPrice         Float
  currentStock      Int            @default(0)
  minimumStock      Int            @default(0)
  warehouseLocation String
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  movements         StockMovement[]
  challanItems      ChallanItem[]
}

model StockMovement {
  id              String       @id @default(uuid())
  productId       String
  product         Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantityChanged Int
  movementType    MovementType
  reason          String
  createdBy       String?
  creator         User?        @relation(fields: [createdBy], references: [id])
  createdAt       DateTime     @default(now())
}

model SalesChallan {
  id            String        @id @default(uuid())
  challanNumber String        @unique
  customerId    String
  customer      Customer      @relation(fields: [customerId], references: [id])
  totalQuantity Int
  status        ChallanStatus @default(DRAFT)
  createdBy     String
  creator       User          @relation(fields: [createdBy], references: [id])
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  items         ChallanItem[]
}

model ChallanItem {
  id                  String       @id @default(uuid())
  challanId           String
  challan             SalesChallan @relation(fields: [challanId], references: [id], onDelete: Cascade)
  productId           String
  product             Product      @relation(fields: [productId], references: [id])
  productNameSnapshot String
  skuSnapshot         String
  unitPriceSnapshot   Float
  quantity            Int
  subtotal            Float
}
```

---

## 7. Folder Structure

```
mini-erp-crm/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── customerController.ts
│   │   │   ├── productController.ts
│   │   │   ├── stockMovementController.ts
│   │   │   ├── challanController.ts
│   │   │   └── dashboardController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validate.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── customerRoutes.ts
│   │   │   ├── productRoutes.ts
│   │   │   ├── stockMovementRoutes.ts
│   │   │   ├── challanRoutes.ts
│   │   │   └── dashboardRoutes.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── customerService.ts
│   │   │   ├── productService.ts
│   │   │   ├── challanService.ts
│   │   │   └── dashboardService.ts
│   │   ├── validators/
│   │   │   ├── authValidator.ts
│   │   │   ├── customerValidator.ts
│   │   │   ├── productValidator.ts
│   │   │   ├── stockMovementValidator.ts
│   │   │   └── challanValidator.ts
│   │   ├── utils/
│   │   │   └── responses.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Challans.tsx
│   │   │   ├── ChallanCreate.tsx
│   │   │   └── ChallanDetail.tsx
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 8. Authentication & Security

- **JWT Tokens**: Embedded with `userId`, `email`, and `role`. Signed with `JWT_SECRET` and expires in `7d`.
- **Password Security**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Helmet Security Headers**: Protection against XSS, clickjacking, and mime-sniffing.
- **CORS Configuration**: Configured to restrict origins to trusted `FRONTEND_URL`.
- **SQL Injection Prevention**: Prepared queries handled transparently via Prisma ORM.

---

## 9. Role Permissions Matrix

| Module / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **View Customers** | ✅ | ✅ | ❌ | ✅ |
| **Create / Edit Customer** | ✅ | ✅ | ❌ | ❌ |
| **Delete Customer** | ✅ | ❌ | ❌ | ❌ |
| **View Products & Stock** | ✅ | ✅ | ✅ | ✅ |
| **Add / Edit Products** | ✅ | ❌ | ✅ | ❌ |
| **Delete Product** | ✅ | ❌ | ❌ | ❌ |
| **Manual Stock IN / OUT** | ✅ | ❌ | ✅ | ❌ |
| **View Inventory Ledger** | ✅ | ❌ | ✅ | ✅ |
| **Create Sales Challan (DRAFT)** | ✅ | ✅ | ❌ | ❌ |
| **Confirm Challan (Deduct Stock)** | ✅ | ✅ | ✅ | ❌ |
| **Cancel Challan (Restore Stock)** | ✅ | ✅ | ❌ | ❌ |

---

## 10. API Endpoints Reference

### 🔒 Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login & JWT generation
- `GET /api/auth/me` - Get current logged in user profile

### 👥 Customer CRM
- `GET /api/customers` - List customers (Supports `search`, `status`, `customerType`, `page`, `limit`)
- `GET /api/customers/:id` - Customer profile details & challan history
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer details
- `DELETE /api/customers/:id` - Delete customer (Admin only)

### 🏷️ Product Catalog
- `GET /api/products` - List products (Supports `search`, `category`, `lowStock`, `page`, `limit`)
- `GET /api/products/:id` - Product profile & movement logs
- `POST /api/products` - Create product SKU
- `PUT /api/products/:id` - Update product details
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/:id/stock-movements` - Stock movements for product

### 🏭 Stock Movements
- `GET /api/stock-movements` - Inventory ledger list
- `POST /api/stock-movements` - Record manual stock IN or OUT

### 📜 Sales Challans
- `GET /api/challans` - List sales challans (Supports `status`, `page`, `limit`)
- `GET /api/challans/:id` - Sales challan details & snapshot items
- `POST /api/challans` - Create DRAFT sales challan
- `PUT /api/challans/:id` - Update DRAFT sales challan
- `POST /api/challans/:id/confirm` - Confirm challan (Executes stock verification & deduction transaction)
- `POST /api/challans/:id/cancel` - Cancel confirmed challan (Restores inventory stock)

### 📊 Dashboard
- `GET /api/dashboard` - Get executive metrics, low stock warnings, and recent logs

---

## 11. Environment Variables

### Backend (`backend/.env`):
```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/minierpcrm?schema=public
JWT_SECRET=minierpcrmsupersecretkey1234567890
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 12. Local Setup & Installation

### Prerequisites:
- Node.js (v18 or v20+)
- npm (v9+)
- PostgreSQL (Local or Cloud instance like Neon / Supabase)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/mini-erp-crm.git
cd mini-erp-crm
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 13. Database Setup & Prisma Migration

Make sure PostgreSQL is running and update `DATABASE_URL` in `backend/.env`.

Run database schema push and initial seed from `backend`:

```bash
cd backend
npx prisma db push
npm run db:seed
```

---

## 14. Demo Login Credentials

All accounts use password: `password123`

| Role | Email | Name | Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | System Admin | Full Access Across All Modules |
| **SALES** | `sales@example.com` | Sales Executive | CRM, Customer Follow-ups, Create/Confirm Challans |
| **WAREHOUSE** | `warehouse@example.com` | Warehouse Operator | Products Catalog, Stock IN/OUT, Inventory Ledger |
| **ACCOUNTS** | `accounts@example.com` | Accounts Officer | Read-only Audits, Customer Lists, Financial Summaries |

---

## 15. Running the Application

### Running Backend Server:
```bash
cd backend
npm run dev
```
Backend will start on `http://localhost:5000` (Health check: `http://localhost:5000/health`).

### Running Frontend Application:
```bash
cd frontend
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 16. Postman Usage & Testing

1. Open Postman and import `postman/Mini-ERP-CRM.postman_collection.json`.
2. Run `🔒 Authentication -> Login (Admin)` request.
3. The JWT token is automatically captured into collection variables and applied to all subsequent requests.
4. Test Customer creation, Product catalog listing, Stock IN/OUT, and Sales Challan `DRAFT` ➔ `CONFIRMED` transition.

---

## 17. Docker Setup (Docker Compose)

To spin up PostgreSQL, Node TypeScript Backend, and React Frontend in Docker containers:

```bash
docker-compose up --build
```

Access services:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **PostgreSQL Database**: `localhost:5432`

To stop containers:
```bash
docker-compose down -v
```

---

## 18. Complete End-to-End Business Flow Test

Follow this flow to demonstrate the core value of the application:

```
  1. LOGIN (admin@example.com / password123)
        ↓
  2. DASHBOARD (Review KPIs, Low Stock Warnings, Stock Ledger)
        ↓
  3. CUSTOMERS (Create customer 'Apex Retailers', set status to 'ACTIVE')
        ↓
  4. PRODUCTS (Check stock for 'Dynamic Speaker' - Current Stock: 95)
        ↓
  5. CREATE SALES CHALLAN (Select 'Apex Retailers', add 5 units of 'Dynamic Speaker')
        ↓
  6. SAVE DRAFT (Verify challan status is DRAFT; verify product stock is STILL 95)
        ↓
  7. CONFIRM CHALLAN (Click 'Confirm Challan & Deduct Stock')
        ↓
  8. VERIFY (Stock automatically drops from 95 → 90, status becomes CONFIRMED, OUT stock log created!)
```

---

## 19. Deployment Instructions

### Frontend (Vercel / Netlify):
1. Import `frontend` directory.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-api.render.com/api`

### Backend (Render / Railway):
1. Import `backend` directory.
2. Environment: Node 20
3. Build command: `npm install && npx prisma generate && npm run build`
4. Start command: `npx prisma db push && npx tsx prisma/seed.ts && npm start`
5. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`).

---

## 20. Known Limitations & Future Enhancements

### Known Limitations:
- Single warehouse location indexing per product SKU.
- Standard tax calculation (GST display) included without custom multi-state IGST/CGST tax logic split.

### Future Enhancements:
- Multi-warehouse transfer logs.
- PDF generation download server-side with Puppeteer.
- Automated email notification triggers for customer follow-up dates.

---
**Mini ERP + CRM Operations Portal** — Built for Scalable Wholesale & Distribution Operations.
