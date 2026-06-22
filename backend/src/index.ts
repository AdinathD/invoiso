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