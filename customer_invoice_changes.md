# Customer and Invoice Changes Documentation

This document describes the detailed changes and functionality implemented to support the `Customer` database model, its relationship with invoices, and real-time frontend integration.

---

## 1. Database Schema Changes (`schema.prisma`)

We introduced the `Customer` model and connected it to the existing `Invoice` model.

### New `Customer` Model
A new model holding detailed customer profile data matching your required structure:
```prisma
model Customer {
  id          String   @id @default(uuid())

  name        String
  mobileNo    String?

  remarks     String?
  balance     String?

  pan         String?
  gstType     String?
  gstin       String?

  city        String?
  state       String?
  country     String?

  billTo      String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  invoices    Invoice[]
}
```

### Updated `Invoice` Model
Added relationship fields to map invoices to customers. If a customer is deleted, `onDelete: SetNull` ensures their historical invoices are preserved with `customerId` set to `null`:
```prisma
model Invoice {
  // ... existing fields ...
  customerId     String?
  customer       Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  // ... existing fields ...
}
```

---

## 2. Backend API Changes (`index.ts`)

### Customer CRUD Endpoints
Implemented REST APIs to handle customer records:
- **`GET /api/customers`**:
  - Fetches all customers (ordered alphabetically by name).
  - Supports query parameter matching, e.g., `/api/customers?name=John` for case-insensitive keyword searching.
- **`GET /api/customers/:id`**:
  - Fetches details of a specific customer including their full list of invoices.
- **`POST /api/customers`**:
  - Creates a new customer record.
- **`PUT /api/customers/:id`**:
  - Updates customer details.
- **`DELETE /api/customers/:id`**:
  - Deletes a customer.

### Smart Invoice Insertion (`POST /api/invoices`)
The endpoint transaction has been updated to support automatic customer profile management:
```typescript
const result = await prisma.$transaction(async (tx) => {
  let finalCustomerId = masterForm.customerId || null;

  if (finalCustomerId) {
    // 1. If customer exists, automatically update their records to keep profile details in sync
    await tx.customer.update({
      where: { id: finalCustomerId },
      data: {
        name: masterForm.name,
        mobileNo: masterForm.mobileNo || null,
        remarks: masterForm.remarks || null,
        balance: masterForm.balance || null,
        pan: masterForm.pan || null,
        gstType: masterForm.gstType || null,
        gstin: masterForm.gst || null,
        city: masterForm.city || null,
        state: masterForm.state || null,
        country: masterForm.country || null,
        billTo: masterForm.billTo || null,
      }
    });
  } else {
    // 2. If customer is new, automatically insert them in the db first and link the generated ID
    const customer = await tx.customer.create({
      data: {
        name: masterForm.name,
        mobileNo: masterForm.mobileNo || null,
        remarks: masterForm.remarks || null,
        balance: masterForm.balance || null,
        pan: masterForm.pan || null,
        gstType: masterForm.gstType || null,
        gstin: masterForm.gst || null,
        city: masterForm.city || null,
        state: masterForm.state || null,
        country: masterForm.country || null,
        billTo: masterForm.billTo || null,
      }
    });
    finalCustomerId = customer.id;
  }

  // 3. Create the Invoice linking finalCustomerId
  const invoice = await tx.invoice.create({
    data: {
      ...
      customerId: finalCustomerId,
      ...
    }
  });
  return invoice;
});
```

---

## 3. Frontend Integration

### API Service Helper (`customersApi.ts`)
Created [customersApi.ts](file:///c:/Adinath/invoiso-demoui/my-app/frontend/src/apiUtils/customersApi.ts) to interface with the customer backend routes.

### Auto-Complete Dropdown (`sidebar.tsx`)
- **Search-As-You-Type**: Typing in the customer **Name** input triggers an async lookup of matching customer names from the database.
- **Interactive UI**: A popup dropdown displays list search results. Selecting a customer from the dropdown:
  - Auto-fills the remaining inputs (`mobileNo`, `remarks`, `balance`, `pan`, `gstType`, `gstin`, `city`, `state`, `country`, and `billTo`).
  - Sets the `customerId` state.
- **Manual Overwrite**: If you start typing over a selected name or clear it, the `customerId` is automatically set back to `""` (indicating a new customer registration upon save).
