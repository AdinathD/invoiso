# Invoiso.ai API Documentation

Welcome to the API documentation for the **Invoiso.ai** backend. The server runs by default on port `5000` (e.g., `http://localhost:5000`).

---

## Table of Contents
1. [General](#general)
2. [Database Schema](#database-schema)
3. [Products API](#products-api)
4. [Invoices API](#invoices-api)
5. [Customers API](#customers-api)
6. [Analytics API](#analytics-api)

---

## General

### Health Check
Check if the backend server is running correctly.

* **URL:** `/`
* **Method:** `GET`
* **Response:**
  * **200 OK**: `"Backend running"`

---

## Products API

### 1. Get All Products
Retrieves a list of all products in the database.

* **URL:** `/api/products`
* **Method:** `GET`
* **Response:**
  * **200 OK**: Array of product objects.
  ```json
  [
    {
      "id": "prod-1",
      "name": "Basmati Rice",
      "hsn": "10063020",
      "price": 85.00,
      "gstPercent": 5.0,
      "stock": 150.00,
      "uom": "KG",
      "category": "Rice",
      "defaultWeight": 25.00,
      "createdAt": "2026-07-08T10:00:00.000Z",
      "updatedAt": "2026-07-08T10:00:00.000Z"
    }
  ]
  ```

### 2. Create Product
Adds a new product to the inventory database.

* **URL:** `/api/products`
* **Method:** `POST`
* **Request Body Schema:**
  ```json
  {
    "name": "Refined Sunflower Oil",
    "hsn": "15121910",
    "price": 135.00,
    "gstPercent": 12.0,
    "stock": 50,
    "uom": "LITRE",
    "category": "Oil",
    "defaultWeight": 15.00
  }
  ```
* **Response:**
  * **201 Created**: The newly created product object.
  * **400 Bad Request**: Missing required fields.

---

## Invoices API

### 1. Get Next Invoice Number
Computes and retrieves the next unique invoice sequence number (e.g., `NHW-2627-0001` or auto-increments the suffix of the latest invoice).

* **URL:** `/api/invoices/next-number`
* **Method:** `GET`
* **Response:**
  * **200 OK**:
  ```json
  {
    "nextInvoiceNo": "NHW-2627-0002"
  }
  ```

### 2. Get All Invoices
Retrieves a list of all invoices. Supports optional datewise filtering.

* **URL:** `/api/invoices`
* **Method:** `GET`
* **Query Parameters:**
  * `date` (optional): Filter invoices created on a specific date (Format: `YYYY-MM-DD`).
* **Response:**
  * **200 OK**: Array of invoices including nested items and customer data.

### 3. Create Invoice
Creates a new invoice and its associated invoice items inside a database transaction.
* **Customer Sync Behavior**: If a valid `customerId` is provided, the database updates that customer's parameters (e.g., `balance`, `mobileNo`, `gstin`). Otherwise, it auto-creates a new Customer record.

* **URL:** `/api/invoices`
* **Method:** `POST`
* **Request Body Schema:**
  ```json
  {
    "masterForm": {
      "customerId": "cust-uuid-1234",
      "name": "Walk-in Customer",
      "mobileNo": "9876543210",
      "remarks": "Credit client",
      "invoiceNo": "NHW-2627-0002",
      "invoiceDate": "2026-07-08",
      "balance": "5000",
      "pan": "ABCDE1234F",
      "gst": "07AAAAA1111A1Z1",
      "gstType": "CGST/SGST",
      "city": "New Delhi",
      "state": "Delhi",
      "country": "India",
      "billTo": "Plot 42, Sector-3, Industrial Area"
    },
    "items": [
      {
        "id": "prod-1",
        "srNo": 1,
        "name": "Basmati Rice",
        "hsn": "10063020",
        "quantity": 2,
        "uom": "KG",
        "price": 85.00,
        "netWt": 50.00,
        "rate": 80.95,
        "netRate": 80.95,
        "gstPercent": 5,
        "net": 170.00
      }
    ],
    "totals": {
      "taxableAmount": 161.90,
      "taxAmount": 8.10,
      "netTotal": 170.00
    },
    "hamali": 0,
    "freight": 0
  }
  ```
* **Response:**
  * **201 Created**: The newly created invoice metadata object.
  * **400 Bad Request**: Missing customer name, invoice number, or items.
  * **409 Conflict**: Invoice number already exists.

---

## Customers API

### 1. Get All Customers
Retrieves all customers in the database. Supports fuzzy name searching.

* **URL:** `/api/customers`
* **Method:** `GET`
* **Query Parameters:**
  * `name` (optional): Filter customers whose name contains this search query (case-insensitive).
* **Response:**
  * **200 OK**: Array of customers sorted by name.

### 2. Get Customer by ID
Retrieves details of a single customer along with their complete invoice history.

* **URL:** `/api/customers/:id`
* **Method:** `GET`
* **Response:**
  * **200 OK**: Customer details with nested invoices and invoice items.
  * **404 Not Found**: Customer not found.

### 3. Create Customer
Manually registers a new customer.

* **URL:** `/api/customers`
* **Method:** `POST`
* **Request Body Schema:**
  ```json
  {
    "name": "John Doe",
    "mobileNo": "9999988888",
    "remarks": "VIP Retail Customer",
    "balance": "0.00",
    "pan": "XYZPA1234Z",
    "gstType": "CGST/SGST",
    "gstin": "07BBBBB2222B2Z2",
    "city": "Gurugram",
    "state": "Haryana",
    "country": "India",
    "billTo": "Phase 5, DLF"
  }
  ```
* **Response:**
  * **201 Created**: The newly created customer object.
  * **400 Bad Request**: Name is required.

### 4. Update Customer
Updates details of an existing customer record.

* **URL:** `/api/customers/:id`
* **Method:** `PUT`
* **Request Body Schema:** Same as Create Customer.
* **Response:**
  * **200 OK**: Updated customer object.

### 5. Delete Customer
Deletes a customer by ID.

* **URL:** `/api/customers/:id`
* **Method:** `DELETE`
* **Response:**
  * **200 OK**: `{"message": "Customer deleted successfully"}`

---

## Analytics API

### 1. Sales Analytics
Retrieves sales summaries, sales trends, top customer revenue, and city/state location breakdowns.

* **URL:** `/api/analytics/sales`
* **Method:** `GET`
* **Query Parameters:**
  * `timeframe` (optional): Sets the analytics bucket. Options: `day` (last 30 days), `month` (last 12 months), `year` (last 5 years). Default: `day`.
* **Response:**
  * **200 OK**:
  ```json
  {
    "summary": {
      "totalRevenue": 250000.00,
      "totalTaxable": 235000.00,
      "totalTax": 15000.00,
      "totalInvoices": 120,
      "averageOrderValue": 2083.33
    },
    "salesTrend": [
      { "date": "2026-07-08", "revenue": 10500.00, "tax": 500.00, "count": 5 }
    ],
    "topCustomers": [
      { "id": "cust-uuid-1", "name": "Big Distributors", "mobile": "9811122233", "revenue": 85000.00, "count": 12 }
    ],
    "locations": {
      "states": [{ "name": "Delhi", "value": 85 }],
      "cities": [{ "name": "New Delhi", "value": 85 }]
    }
  }
  ```

### 2. Stock and Inventory Analytics
Retrieves information on stock counts, stock value, category stock distributions, low-stock alerts, and top-selling products.

* **URL:** `/api/analytics/stock`
* **Method:** `GET`
* **Response:**
  * **200 OK**:
  ```json
  {
    "summary": {
      "totalProducts": 45,
      "totalStockValue": 350000.00,
      "totalItemsCount": 4200.00,
      "outOfStockCount": 2,
      "lowStockCount": 6
    },
    "lowStockProducts": [
      { "id": "prod-4", "name": "Mustard Oil", "stock": 4, "price": 180.00, "category": "Oil" }
    ],
    "categoryDistribution": [
      { "category": "Rice", "value": 120000.00, "count": 12, "itemsCount": 1400.00 }
    ],
    "topProducts": [
      { "id": "prod-1", "name": "Basmati Rice", "quantitySold": 520.00, "revenue": 44200.00 }
    ]
  }
  ```

---

## Database Schema

The backend uses **Prisma** with a **PostgreSQL** database. Below is the relational model definitions configured in the schema:

### 1. Product Model
Stores inventory item details.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id`, `@default(uuid())` | Primary key |
| `name` | `String` | | Product title |
| `hsn` | `String` | | HSN code |
| `price` | `Decimal` | `db.Decimal(12, 2)` | Unit price |
| `gstPercent` | `Decimal` | `db.Decimal(5, 2)` | GST percentage |
| `stock` | `Decimal` | `db.Decimal(12, 3)` | Stock quantity remaining |
| `uom` | `String` | | Unit of measure (e.g., PCS, KG) |
| `defaultWeight` | `Decimal?` | `db.Decimal(12, 3)`, `Nullable` | Standard packing weight |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated timestamp |

### 2. Customer Model
Stores details of registered buyers.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id`, `@default(uuid())` | Primary key |
| `name` | `String` | | Billing Name |
| `mobileNo` | `String?` | `Nullable` | Contact number |
| `remarks` | `String?` | `Nullable` | Notes on client status |
| `balance` | `String?` | `Nullable` | Current ledger balance |
| `pan` | `String?` | `Nullable` | Permanent Account Number |
| `gstType` | `String?` | `Nullable` | Tax setup (e.g. CGST/SGST, IGST) |
| `gstin` | `String?` | `Nullable` | GST Identification Number |
| `city` | `String?` | `Nullable` | Billing city |
| `state` | `String?` | `Nullable` | Billing state |
| `country` | `String?` | `Nullable` | Billing country |
| `billTo` | `String?` | `Nullable` | Full billing street address |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated timestamp |
| `invoices` | `Invoice[]` | | List of invoices mapped to this customer |

### 3. Invoice Model
Stores invoice metadata.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id`, `@default(uuid())` | Primary key |
| `invoiceNo` | `String` | `@unique` | Unique invoice serial code |
| `invoiceDate` | `DateTime` | | Invoice billing date |
| `customerId` | `String?` | `Nullable` | Reference ID to Customer |
| `customerName` | `String` | | Customer name snapshot |
| `customerMobile` | `String?` | `Nullable` | Customer contact snapshot |
| `remarks` | `String?` | `Nullable` | Remarks snapshot |
| `balance` | `String?` | `Nullable` | Ledger balance snapshot |
| `pan` | `String?` | `Nullable` | PAN snapshot |
| `gstin` | `String?` | `Nullable` | GSTIN snapshot |
| `gstType` | `String?` | `Nullable` | GST type snapshot |
| `city` | `String?` | `Nullable` | Billing city snapshot |
| `state` | `String?` | `Nullable` | Billing state snapshot |
| `country` | `String?` | `Nullable` | Billing country snapshot |
| `billTo` | `String?` | `Nullable` | Street address snapshot |
| `hamali` | `Decimal` | `@default(0.00)`, `db.Decimal(12, 2)` | Loading/coolie charges |
| `freight` | `Decimal` | `@default(0.00)`, `db.Decimal(12, 2)` | Transportation/shipping charges |
| `taxableAmount` | `Decimal` | `db.Decimal(12, 2)` | Sum before tax |
| `taxAmount` | `Decimal` | `db.Decimal(12, 2)` | Total tax collected |
| `netTotal` | `Decimal` | `db.Decimal(12, 2)` | Net total payable amount |
| `items` | `InvoiceItem[]` | | Nested invoice items |
| `createdAt` | `DateTime` | `@default(now())` | Invoice timestamp |

### 4. InvoiceItem Model
Stores itemized product breakdowns for each invoice.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `id` | `String` | `@id`, `@default(uuid())` | Primary key |
| `invoiceId` | `String` | | Reference ID to parent Invoice |
| `productId` | `String?` | `Nullable` | Reference ID to source Product |
| `srNo` | `Int` | | Row sequence serial number |
| `name` | `String` | | Item name snapshot |
| `hsn` | `String` | | HSN snapshot |
| `quantity` | `Decimal` | `db.Decimal(12, 3)` | Quantity purchased |
| `uom` | `String` | | Unit of measurement |
| `price` | `Decimal` | `db.Decimal(12, 2)` | Unit price |
| `netWt` | `Decimal` | `db.Decimal(12, 3)` | Net weight of item batch |
| `rate` | `Decimal` | `db.Decimal(12, 2)` | Unit rate excluding tax |
| `netRate` | `Decimal` | `db.Decimal(12, 2)` | Rate including tax |
| `gstPercent` | `Decimal` | `db.Decimal(5, 2)` | GST percentage |
| `net` | `Decimal` | `db.Decimal(12, 2)` | Total item net value |

