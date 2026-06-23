"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("./generated/prisma/client");
console.log(process.env.DATABASE_URL ? 'DATABASE_URL loaded' : 'DATABASE_URL missing');
const app = (0, express_1.default)();
const PORT = 5000;
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Backend running");
});
// GET endpoint to fetch all products
app.get("/api/products", async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// POST endpoint to add a new product or multiple products
app.post("/api/products", async (req, res) => {
    try {
        const body = req.body;
        if (Array.isArray(body)) {
            if (body.length === 0) {
                res.status(400).json({ error: "Products array cannot be empty" });
                return;
            }
            for (const item of body) {
                if (!item.name || !item.hsn || item.price === undefined || item.gstPercent === undefined || item.stock === undefined || !item.uom || !item.category) {
                    res.status(400).json({ error: "Each product must include name, hsn, price, gstPercent, stock, uom, and category" });
                    return;
                }
            }
            const created = await prisma.product.createMany({
                data: body.map((p) => ({
                    name: p.name,
                    hsn: p.hsn,
                    price: p.price,
                    gstPercent: p.gstPercent,
                    stock: p.stock,
                    uom: p.uom,
                    category: p.category,
                    defaultWeight: p.defaultWeight !== undefined ? p.defaultWeight : null,
                })),
            });
            res.status(201).json({ message: `Successfully created ${created.count} products`, count: created.count });
            return;
        }
        else {
            const { name, hsn, price, gstPercent, stock, uom, category, defaultWeight } = body;
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
        }
    }
    catch (error) {
        console.error("Error adding product(s):", error);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
});
// // Alias for convenience
// app.get("/products", async (req, res) => {
//   try {
//     const products = await prisma.product.findMany();
//     res.json(products);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map