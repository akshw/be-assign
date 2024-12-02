import express, { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Create product
router.post("/", async (req, res) => {
  try {
    const { name, category, price, stockQuantity } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        category,
        price,
        stockQuantity,
      },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error creating product" });
  }
});

// Get product by ID
router.get("/:id", (async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
}) as RequestHandler);

// Update product
router.put("/:id", async (req, res) => {
  try {
    const { name, category, price, stockQuantity } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        price,
        stockQuantity,
      },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error updating product" });
  }
});

// Get total stock quantity
router.get("/stats/total-stock", async (req, res) => {
  try {
    const totalStock = await prisma.product.aggregate({
      _sum: {
        stockQuantity: true,
      },
    });
    res.json({ totalStock: totalStock._sum.stockQuantity || 0 });
  } catch (error) {
    res.status(500).json({ error: "Error calculating total stock" });
  }
});

export default router;
