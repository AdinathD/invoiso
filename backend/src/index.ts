import 'dotenv/config'
import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/client";

console.log(process.env.DATABASE_URL ? 'DATABASE_URL loaded' : 'DATABASE_URL missing')

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

// GET endpoint to fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST endpoint to add a new product
app.post("/api/products", async (req, res) => {
  try {
    const { name, hsn, price, gstPercent, stock, uom, category, defaultWeight } = req.body;

    if (!name || !hsn || price === undefined || gstPercent === undefined || stock === undefined || !uom || !category) {
      res.status(400).json({ error: "Missing required fields: name, hsn, price, gstPercent, stock, uom, category" });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        hsn,
        price,
        gstPercent,
        stock,
        uom,
        category,
        defaultWeight: defaultWeight !== undefined ? defaultWeight : null,
      },
    });

    res.status(201).json(product);
    return;
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

// GET endpoint to retrieve the next unique invoice number based on database records
app.get("/api/invoices/next-number", async (req, res) => {
  try {
    const latestInvoice = await prisma.invoice.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!latestInvoice) {
      res.json({ nextInvoiceNo: "NHW-2627-0001" });
      return;
    }

    const match = latestInvoice.invoiceNo.match(/^(.*-)(\d+)$/);
    if (match && match[1] && match[2]) {
      const prefix = match[1];
      const suffix = match[2];
      const nextNum = parseInt(suffix, 10) + 1;
      const nextInvoiceNo = `${prefix}${String(nextNum).padStart(suffix.length, '0')}`;
      res.json({ nextInvoiceNo });
      return;
    } else {
      res.json({ nextInvoiceNo: `${latestInvoice.invoiceNo}-${Date.now()}` });
      return;
    }
  } catch (error) {
    console.error("Error getting next invoice number:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
});

// POST endpoint to create an invoice and its items
app.post("/api/invoices", async (req, res) => {
  try {
    const { masterForm, items, totals, hamali, freight } = req.body;

    if (!masterForm?.name) {
      res.status(400).json({ error: "Customer Name is required." });
      return;
    }
    if (!masterForm?.invoiceNo) {
      res.status(400).json({ error: "Invoice Number is required." });
      return;
    }
    if (!items || !items.length) {
      res.status(400).json({ error: "Invoice must contain at least one item." });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      let finalCustomerId = masterForm.customerId || null;

      if (finalCustomerId) {
        // Update existing customer details to keep records in sync
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
        // Create new customer
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

      // 1. Create the Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo: masterForm.invoiceNo,
          invoiceDate: new Date(masterForm.invoiceDate),
          customerId: finalCustomerId,
          customerName: masterForm.name,
          customerMobile: masterForm.mobileNo || null,
          remarks: masterForm.remarks || null,
          balance: masterForm.balance || null,
          pan: masterForm.pan || null,
          gstin: masterForm.gst || null,
          gstType: masterForm.gstType || null,
          city: masterForm.city || null,
          state: masterForm.state || null,
          country: masterForm.country || null,
          billTo: masterForm.billTo || null,
          hamali: hamali || 0,
          freight: freight || 0,
          taxableAmount: totals.taxableAmount,
          taxAmount: totals.taxAmount,
          netTotal: totals.netTotal,
        },
      });

      // 2. Save Invoice Items
      await tx.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: invoice.id,
          productId: item.id && item.id.includes("-") ? item.id : null,
          srNo: item.srNo,
          name: item.name,
          hsn: item.hsn,
          quantity: item.quantity,
          uom: item.uom,
          price: item.price,
          netWt: item.netWt,
          rate: item.rate,
          netRate: item.netRate,
          gstPercent: item.gstPercent,
          net: item.net,
        })),
      });

      return invoice;
    });

    res.status(201).json(result);
    return;
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    if (error.code === "P2002") {
      res.status(409).json({ error: "Invoice number already exists." });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  }
});

// GET endpoint to fetch all customers
app.get("/api/customers", async (req, res) => {
  try {
    const { name } = req.query;
    const customers = await prisma.customer.findMany({
      ...(name ? {
        where: {
          name: {
            contains: String(name),
            mode: 'insensitive'
          }
        }
      } : {}),
      orderBy: { name: "asc" }
    });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint to retrieve a customer by ID with their invoices
app.get("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { invoices: true }
    });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST endpoint to add a new customer
app.post("/api/customers", async (req, res) => {
  try {
    const { name, mobileNo, remarks, balance, pan, gstType, gstin, city, state, country, billTo } = req.body;

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        mobileNo: mobileNo || null,
        remarks: remarks || null,
        balance: balance || null,
        pan: pan || null,
        gstType: gstType || null,
        gstin: gstin || null,
        city: city || null,
        state: state || null,
        country: country || null,
        billTo: billTo || null
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT endpoint to update an existing customer
app.put("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mobileNo, remarks, balance, pan, gstType, gstin, city, state, country, billTo } = req.body;

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        mobileNo: mobileNo || null,
        remarks: remarks || null,
        balance: balance || null,
        pan: pan || null,
        gstType: gstType || null,
        gstin: gstin || null,
        city: city || null,
        state: state || null,
        country: country || null,
        billTo: billTo || null
      }
    });

    res.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE endpoint to delete a customer
app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({
      where: { id }
    });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});