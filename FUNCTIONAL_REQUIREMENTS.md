# UnifiedPOS - Functional Requirements Document

**Version:** 1.0  
**Last Updated:** January 2026  
**Document Type:** Technology-Agnostic Functional Specification

---

## 1. Executive Summary

UnifiedPOS is a desktop Point of Sale (POS) application designed for multi-service businesses, specifically laundry and dry cleaning shops. The system supports order management, payment processing, customer management, inventory tracking, and reporting.

---

## 2. System Overview

### 2.1 Core Modules
1. **Authentication** - User login and access control
2. **Point of Sale (POS)** - Order creation and checkout
3. **Order Management** - Order tracking and fulfillment
4. **Customer Management** - Customer database and history
5. **Inventory Management** - Product/service catalog
6. **Settings** - Category and business configuration
7. **Reports** - Business analytics and reporting
8. **Dashboard** - Overview metrics

### 2.2 User Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| Admin | Full system access | All modules, settings, user management |
| Cashier | Limited access | POS, Orders, basic operations |

---

## 3. Module Specifications

### 3.1 Authentication Module

#### 3.1.1 Login
- **Input Fields:** Username, Password
- **Validation:** Credentials checked against encrypted password storage
- **Session:** Maintain user session until logout
- **Default Admin:** System creates default admin account on first run
  - Username: `admin`
  - Password: `admin123`

#### 3.1.2 Logout
- Clear session and return to login screen
- Available from sidebar navigation

---

### 3.2 Point of Sale (POS) Module

#### 3.2.1 Layout
- **Left Panel:** Product/Service selection grid
- **Right Panel:** Current order cart

#### 3.2.2 Customer Selection (Optional)
- Button to attach customer to order
- Modal with two tabs:
  1. **Search Existing:** Search by name/phone (min 1 character)
  2. **Add New:** Form with name, phone, email, notes
- Display selected customer with badge, option to clear

#### 3.2.3 Category Navigation
- Tab-based category switching
- Each category has:
  - Name (e.g., "Laundry", "Dry Cleaning")
  - Prefix for ticket numbers (e.g., "L", "D")
  - Color code for visual identification
- Categories displayed as colored tabs

#### 3.2.4 Product Grid
- Display products filtered by selected category
- Each product card shows:
  - Product name
  - Price
- Click to add to cart

#### 3.2.5 Product Variants (Optional)
- Products may have configurable options (e.g., Size: S/M/L)
- When clicked, show variant selection modal
- Each unique variant combination creates a new line item

#### 3.2.6 Shopping Cart
**Display:**
- Items grouped by category with category headers
- Each item shows: Name, Unit Price × Quantity, Subtotal
- Quantity controls: Increment (+), Decrement (−)
- Remove button (×)
- Running total at bottom

**Payment Section:**
- Payment amount input field (default: full amount)
- Payment method buttons: Cash, QR Code, Card
- Change/Balance preview:
  - If payment > total: Show "Change Due"
  - If payment < total: Show "Balance Remaining"

**Confirmation Flow:**
1. Click "Proceed to Payment"
2. Confirmation panel shows:
   - Order Total
   - Payment Amount and Method
   - Change to Give / Remaining Balance
   - Warning to verify payment received
3. "Back" button to modify
4. "Confirm & Complete" to finalize

#### 3.2.7 Order Completion
- Generate unique ticket number: `{PREFIX}-{YYMMDD}-{SEQ}`
  - Example: `L-260123-001`
- Display success modal with:
  - Ticket number (large, prominent)
  - Order summary
  - Payment details
  - "New Order" button to reset

---

### 3.3 Order Management Module

#### 3.3.1 Order List View
- Display all orders in table format
- Columns: Ticket #, Customer, Total, Paid, Status, Date
- Filtering options:
  - Status: All, Pending, Processing, Ready, Completed
  - Search by ticket number or customer name
  - Date range picker
- Sortable by date (newest first default)
- Click row to view details

#### 3.3.2 Order Detail View
**Header:**
- Ticket number
- Order status badge
- Customer info (if attached)
- Created date/time

**Items Section:**
- List all order items grouped by category
- Show: Item name, Quantity, Unit Price, Subtotal
- Variant details if applicable

**Payment Section:**
- Payment summary: Total, Paid, Balance
- Payment history table
- Add Payment form (if balance due):
  - Amount input with quick buttons (Full, Half)
  - Method selection
  - Confirmation step

**Status Update:**
- Dropdown to change order status
- Statuses: Pending → Processing → Ready → Completed

**Actions:**
- View Receipt button
- Delete Order (Admin only, requires password confirmation)

#### 3.3.3 Receipt Preview
**Format:** Thermal receipt style (80mm width)

**Header Section:**
- Business name
- Address
- Phone number

**Ticket Box:**
- Prominent ticket number display

**Customer Info:**
- Name and phone (if attached)
- Date/time

**Items Section (Grouped by Category):**
| Column | Width |
|--------|-------|
| Item Name | 50% |
| Qty | 10% |
| Price | 20% |
| Amount | 20% |

Each category section includes:
- Category header
- Items under that category
- Category subtotal

**Totals:**
- Grand Total
- Amount Paid (green)
- Balance Due (red, if applicable)

**Status Box:**
- Payment status with color coding:
  - Paid: Green
  - Partial: Orange
  - Unpaid: Red

**Footer:**
- "Thank you for your business!"
- Collection policy (e.g., "Items must be collected within 30 days")

**Actions:**
- Print Receipt button
- Close button

#### 3.3.4 Order Deletion
- Admin-only feature
- Requires admin password confirmation
- Restores stock for tracked inventory items
- Cascades to delete related payments and order items

---

### 3.4 Customer Management

#### 3.4.1 Customer Data Model
| Field | Type | Required |
|-------|------|----------|
| ID | Auto-increment | Yes |
| Name | Text | Yes |
| Phone | Text (Unique) | Yes |
| Email | Text | No |
| Address | Text | No |
| Notes | Text | No |
| Created At | Timestamp | Auto |

#### 3.4.2 Customer Search
- Search by name or phone number
- Case-insensitive matching
- Minimum 1 character to search
- Returns matching customers with order count

#### 3.4.3 Customer Link to Order
- Customer ID stored with order
- Customer name/phone denormalized for display

---

### 3.5 Inventory Management Module

#### 3.5.1 Product List
- Display products in table or grid
- Columns: Name, Category, Price, Stock (if tracked)
- Filter by category
- Search by name

#### 3.5.2 Add/Edit Product
**Required Fields:**
- Name
- Category (dropdown)
- Price

**Optional Fields:**
- Description
- Stock tracking (toggle)
  - If enabled: Current quantity, Low stock alert threshold
- Variants (configurable options)

#### 3.5.3 Product Variants
- Add multiple variant types per product
- Each variant has:
  - Name (e.g., "Size", "Color")
  - Options (comma-separated, e.g., "S,M,L,XL")
  - Required flag

#### 3.5.4 Stock Management
- Track quantity for enabled products
- Automatically decrement on order completion
- Restore stock on order deletion
- Low stock alerts on dashboard

---

### 3.6 Settings Module

#### 3.6.1 Category Management
**List View:**
- Display all categories
- Show: Name, Prefix, Color, Product count

**Add Category:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | Yes | Display name |
| Prefix | Text (Max 3 chars) | Yes | For ticket numbers |
| Color | Color picker | No | 10 preset colors |

**Edit Category:**
- Same fields as Add
- Cannot edit prefix if products exist (data integrity)

**Delete Category:**
- Only allowed if no products linked
- Show product count warning

#### 3.6.2 Default Categories (Seeded on First Run)

**Laundry (Prefix: L, Color: Blue)**
| Service | Default Price |
|---------|---------------|
| Wash | 8.00 |
| Dry | 8.00 |
| Wash & Dry | 15.00 |
| Detergent | 2.00 |
| Softener | 2.00 |
| Pre-Wash | 3.00 |
| Drop-Off Service | 5.00 |
| Iron: Clothes (per pc) | 3.00 |
| Iron: Bedsheets | 5.00 |
| Iron: Pillow Cases/Cushion Covers | 2.00 |
| Gents: Trousers | 6.00 |
| Gents: Shirts | 5.00 |
| Gents: Jeans | 6.00 |
| Gents: Shorts | 4.00 |
| Ladies: Blouse | 5.00 |
| Ladies: Skirts | 5.00 |
| Ladies: Dress | 8.00 |
| Ladies: Trousers | 6.00 |
| Comforter/Bedspread | 25.00 |
| Bedsheets | 8.00 |
| Pillow Cases/Bolster | 3.00 |
| Curtains (per panel) | 10.00 |
| Curtains (per kg) | 15.00 |
| Blanket | 15.00 |

**Dry Cleaning (Prefix: D, Color: Green)**
| Item | Default Price |
|------|---------------|
| Blouse | 10.00 |
| Skirt | 10.00 |
| Dress | 18.00 |
| Blazer | 20.00 |
| Evening Gown | 45.00 |
| Baju Kurung | 15.00 |
| Baju Melayu | 15.00 |
| Sheep Skin/Sarong | 35.00 |
| Neck Tie/Soft Toy | 8.00 |
| Saree/Wedding Gown | 80.00 |
| Bedsheet (DC) | 12.00 |
| Pillow Case (DC) | 5.00 |
| Curtain (per Sq Ft) | 2.00 |
| Blanket (DC) | 20.00 |
| Bedspread | 25.00 |
| Cushion Covers | 8.00 |
| Vest/Jacket | 18.00 |
| Overcoat/Hand Bag | 30.00 |
| Sweater | 12.00 |
| Sport Shirt | 10.00 |
| Bush Jacket | 18.00 |
| Coat | 25.00 |
| Trousers (DC) | 12.00 |
| Shirt | 8.00 |

---

### 3.7 Dashboard Module

#### 3.7.1 Summary Cards
- **Today's Revenue** - Sum of payments received today
- **Pending Orders** - Count of orders with status "Pending"
- **Ready for Pickup** - Count of orders with status "Ready"
- **Total Orders** - Count of all orders (or today's orders)

#### 3.7.2 Charts (Optional)
- Revenue trend (last 7 days)
- Orders by status (pie chart)
- Category breakdown

---

### 3.8 Reports Module

#### 3.8.1 Report Period Selection
**Preset Options:**
- Today
- Yesterday
- This Week
- Last Week
- This Month
- Last Month
- Custom Range (date pickers)

#### 3.8.2 Report Sections

**Executive Summary:**
- Total Revenue
- Total Orders
- Average Order Value
- Unique Customers

**Payment Methods Breakdown:**
| Method | Count | Amount | Percentage |
|--------|-------|--------|------------|
| Cash | X | $X.XX | X% |
| Card | X | $X.XX | X% |
| QR | X | $X.XX | X% |

**Category Sales:**
| Category | Items Sold | Revenue | % of Total |
|----------|------------|---------|------------|
| Laundry | X | $X.XX | X% |
| Dry Cleaning | X | $X.XX | X% |

**Top Products:**
- List top 10 products by quantity sold
- Show: Rank, Product Name, Quantity, Revenue

**Order Status Distribution:**
- Pending: X orders
- Processing: X orders
- Ready: X orders
- Completed: X orders

**Daily Breakdown (for multi-day periods):**
| Date | Orders | Revenue |
|------|--------|---------|
| DD/MM/YYYY | X | $X.XX |

**Transaction Details:**
- List of all orders in period
- Columns: Ticket #, Date, Customer, Items, Total, Status

#### 3.8.3 Export Options
- Print Report (browser print dialog)
- Print-optimized CSS (hide UI controls)

---

## 4. Data Models

### 4.1 User
```
User {
  id: Integer (PK)
  username: String (Unique)
  passwordHash: String (Encrypted)
  role: Enum [admin, cashier]
  createdAt: Timestamp
}
```

### 4.2 Category
```
Category {
  id: Integer (PK)
  name: String
  prefix: String (Unique, max 3 chars)
  colorCode: String (Hex color)
}
```

### 4.3 Product
```
Product {
  id: Integer (PK)
  categoryId: Integer (FK → Category)
  name: String
  description: String (Optional)
  price: Decimal
  isStockTracked: Boolean
  stockQuantity: Integer
  lowStockAlert: Integer
  isActive: Boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 4.4 Variant
```
Variant {
  id: Integer (PK)
  productId: Integer (FK → Product)
  name: String
  options: String (JSON or comma-separated)
  isRequired: Boolean
}
```

### 4.5 Customer
```
Customer {
  id: Integer (PK)
  name: String
  phone: String (Unique)
  email: String (Optional)
  address: String (Optional)
  notes: String (Optional)
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 4.6 Order
```
Order {
  id: Integer (PK)
  ticketNumber: String (Unique)
  customerId: Integer (FK → Customer, Optional)
  customerName: String (Denormalized)
  customerPhone: String (Denormalized)
  totalAmount: Decimal
  paidAmount: Decimal
  paymentStatus: Enum [unpaid, partial, paid]
  orderStatus: Enum [pending, processing, ready, completed]
  notes: String (Optional)
  createdAt: Timestamp
  updatedAt: Timestamp
  completedAt: Timestamp (Optional)
}
```

### 4.7 OrderItem
```
OrderItem {
  id: Integer (PK)
  orderId: Integer (FK → Order)
  productId: Integer (FK → Product)
  productName: String (Denormalized)
  quantity: Integer
  unitPrice: Decimal
  subtotal: Decimal
  variantDetails: String (JSON, Optional)
}
```

### 4.8 Payment
```
Payment {
  id: Integer (PK)
  orderId: Integer (FK → Order)
  amount: Decimal
  paymentMethod: Enum [cash, qr, credit]
  referenceNumber: String (Optional)
  createdAt: Timestamp
}
```

---

## 5. Business Rules

### 5.1 Ticket Number Generation
- Format: `{CATEGORY_PREFIX}-{YYMMDD}-{SEQUENCE}`
- Sequence resets daily within each category
- Example: First laundry order on Jan 23, 2026 = `L-260123-001`

### 5.2 Payment Status Logic
| Condition | Status |
|-----------|--------|
| paidAmount = 0 | Unpaid |
| 0 < paidAmount < totalAmount | Partial |
| paidAmount >= totalAmount | Paid |

### 5.3 Order Status Flow
```
Pending → Processing → Ready → Completed
```
- Any status can transition to any other (flexible workflow)

### 5.4 Stock Management
- Stock only tracked for products with `isStockTracked = true`
- Decrement on order creation
- Restore on order deletion
- Low stock alert when quantity ≤ threshold

### 5.5 Category Deletion Protection
- Cannot delete category with linked products
- Must first delete or reassign all products

---

## 6. User Interface Guidelines

### 6.1 Navigation
- Sidebar navigation with icons and labels
- Navigation items:
  1. Point of Sale
  2. Orders
  3. Inventory
  4. Dashboard
  5. Reports
  6. Settings
- User info and logout at bottom

### 6.2 Common UI Patterns
- **Modal dialogs** for forms and confirmations
- **Status badges** with color coding
- **Toast notifications** for success/error feedback
- **Loading states** during async operations
- **Empty states** with helpful messages

### 6.3 Responsive Behavior
- Designed for desktop (minimum 1200px width)
- Side-by-side layouts for POS (products + cart)
- Tables with horizontal scroll if needed

---

## 7. Appendix

### 7.1 Glossary
| Term | Definition |
|------|------------|
| Ticket Number | Unique order identifier |
| Category | Product/service grouping (e.g., Laundry) |
| Variant | Configurable product option |
| DC | Dry Cleaning |

### 7.2 Currency
- Default currency: Malaysian Ringgit (RM)
- Decimal precision: 2 places

### 7.3 Date/Time Format
- Display: DD/MM/YYYY HH:mm
- Storage: ISO 8601

---

*End of Functional Requirements Document*
