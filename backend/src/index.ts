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

// GET endpoint to fetch all invoices (with optional date query parameter for datewise filtering)
app.get("/api/invoices", async (req, res) => {
  try {
    const { date } = req.query;
    let whereClause = {};

    if (date) {
      const dateStr = String(date);
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        let startOfDay: Date;
        let endOfDay: Date;
        
        if (match) {
          const year = parseInt(match[1] || "0", 10);
          const month = parseInt(match[2] || "1", 10) - 1;
          const day = parseInt(match[3] || "1", 10);
          startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
          endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        } else {
          const year = parsedDate.getUTCFullYear();
          const month = parsedDate.getUTCMonth();
          const day = parsedDate.getUTCDate();
          startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
          endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        }

        whereClause = {
          invoiceDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        items: true,
        customer: true,
      },
      orderBy: {
        invoiceDate: "desc",
      },
    });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
      include: {
        invoices: {
          include: {
            items: true
          }
        }
      }
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

// GET endpoint for sales analytics
app.get("/api/analytics/sales", async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as string) || "day";

    const now = new Date();
    let startDate = new Date();
    if (timeframe === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    } else if (timeframe === "year") {
      startDate = new Date(now.getFullYear() - 4, 0, 1);
    } else {
      // Default: last 30 days
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: startDate,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        invoiceDate: "asc",
      },
    });

    let totalRevenue = 0;
    let totalTaxable = 0;
    let totalTax = 0;

    invoices.forEach((inv) => {
      totalRevenue += Number(inv.netTotal);
      totalTaxable += Number(inv.taxableAmount);
      totalTax += Number(inv.taxAmount);
    });

    const totalInvoices = invoices.length;
    const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

    // Sales over time bucketed by timeframe
    let salesTrend: Array<{ date: string; revenue: number; tax: number; count: number }> = [];

    if (timeframe === "month") {
      const monthlyMap: Record<string, { date: string; revenue: number; tax: number; count: number }> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const dateStr = `${year}-${month}`;
        monthlyMap[dateStr] = { date: dateStr, revenue: 0, tax: 0, count: 0 };
      }

      invoices.forEach((inv) => {
        const invDate = new Date(inv.invoiceDate);
        const year = invDate.getFullYear();
        const month = String(invDate.getMonth() + 1).padStart(2, "0");
        const dateStr = `${year}-${month}`;
        const entry = monthlyMap[dateStr];
        if (entry) {
          entry.revenue += Number(inv.netTotal);
          entry.tax += Number(inv.taxAmount);
          entry.count += 1;
        }
      });
      salesTrend = Object.values(monthlyMap).sort((a, b) => a.date.localeCompare(b.date));
    } else if (timeframe === "year") {
      const yearlyMap: Record<string, { date: string; revenue: number; tax: number; count: number }> = {};
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const dateStr = String(year);
        yearlyMap[dateStr] = { date: dateStr, revenue: 0, tax: 0, count: 0 };
      }

      invoices.forEach((inv) => {
        const invDate = new Date(inv.invoiceDate);
        const dateStr = String(invDate.getFullYear());
        const entry = yearlyMap[dateStr];
        if (entry) {
          entry.revenue += Number(inv.netTotal);
          entry.tax += Number(inv.taxAmount);
          entry.count += 1;
        }
      });
      salesTrend = Object.values(yearlyMap).sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // Default: day
      const dailyMap: Record<string, { date: string; revenue: number; tax: number; count: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0] || "";
        dailyMap[dateStr] = { date: dateStr, revenue: 0, tax: 0, count: 0 };
      }

      invoices.forEach((inv) => {
        const dateStr = new Date(inv.invoiceDate).toISOString().split("T")[0] || "";
        const entry = dailyMap[dateStr];
        if (entry) {
          entry.revenue += Number(inv.netTotal);
          entry.tax += Number(inv.taxAmount);
          entry.count += 1;
        }
      });
      salesTrend = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    }

    // Top Customers by revenue
    const customerMap: Record<string, { id: string; name: string; mobile: string; revenue: number; count: number }> = {};
    invoices.forEach((inv) => {
      const cId = inv.customerId || "anonymous";
      if (!customerMap[cId]) {
        customerMap[cId] = {
          id: cId,
          name: inv.customerName,
          mobile: inv.customerMobile || "N/A",
          revenue: 0,
          count: 0,
        };
      }
      customerMap[cId].revenue += Number(inv.netTotal);
      customerMap[cId].count += 1;
    });

    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Customer Locations breakdown (state and city)
    const stateMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};

    invoices.forEach((inv) => {
      const state = inv.state || "Unknown State";
      const city = inv.city || "Unknown City";
      stateMap[state] = (stateMap[state] || 0) + 1;
      cityMap[city] = (cityMap[city] || 0) + 1;
    });

    res.json({
      summary: {
        totalRevenue,
        totalTaxable,
        totalTax,
        totalInvoices,
        averageOrderValue,
      },
      salesTrend,
      topCustomers,
      locations: {
        states: Object.entries(stateMap).map(([name, value]) => ({ name, value })),
        cities: Object.entries(cityMap).map(([name, value]) => ({ name, value })),
      },
    });
  } catch (error) {
    console.error("Error generating sales analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET endpoint for stock/inventory analytics
app.get("/api/analytics/stock", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const invoiceItems = await prisma.invoiceItem.findMany();

    let totalStockValue = 0;
    let totalItemsCount = 0;
    let outOfStockCount = 0;
    const lowStockThreshold = 10;
    const lowStockProducts: any[] = [];

    products.forEach((prod) => {
      const stockVal = Number(prod.stock);
      const priceVal = Number(prod.price);
      totalStockValue += stockVal * priceVal;
      totalItemsCount += stockVal;

      if (stockVal <= 0) {
        outOfStockCount += 1;
      }
      if (stockVal < lowStockThreshold) {
        lowStockProducts.push({
          id: prod.id,
          name: prod.name,
          stock: stockVal,
          price: priceVal,
          category: prod.category,
        });
      }
    });

    // Stock by category
    const categoryMap: Record<string, { category: string; value: number; count: number; itemsCount: number }> = {};
    products.forEach((prod) => {
      const cat = prod.category || "Uncategorized";
      const stockVal = Number(prod.stock);
      const priceVal = Number(prod.price);

      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, value: 0, count: 0, itemsCount: 0 };
      }
      categoryMap[cat].value += stockVal * priceVal;
      categoryMap[cat].count += 1; // unique products in this category
      categoryMap[cat].itemsCount += stockVal; // total items in this category
    });

    // Top selling products (by aggregate quantity sold)
    const productSalesMap: Record<string, { id: string; name: string; quantitySold: number; revenue: number }> = {};
    invoiceItems.forEach((item) => {
      const pId = item.productId || "custom-item";
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = {
          id: pId,
          name: item.name,
          quantitySold: 0,
          revenue: 0,
        };
      }
      productSalesMap[pId].quantitySold += Number(item.quantity);
      productSalesMap[pId].revenue += Number(item.net);
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    res.json({
      summary: {
        totalProducts: products.length,
        totalStockValue,
        totalItemsCount,
        outOfStockCount,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts: lowStockProducts.sort((a, b) => a.stock - b.stock),
      categoryDistribution: Object.values(categoryMap),
      topProducts,
    });
  } catch (error) {
    console.error("Error generating stock analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});