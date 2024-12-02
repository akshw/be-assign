import express from "express";
import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";

const router = express.Router();
const prisma = new PrismaClient();

// Create order
router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check current stock
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.stockQuantity < quantity) {
        throw new Error("Insufficient stock");
      }

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: product.stockQuantity - quantity,
        },
      });

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });

      return { order, updatedProduct };
    });

    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Insufficient stock") {
      res.status(400).json({ error: "Insufficient stock available" });
    } else {
      res.status(500).json({ error: "Error creating order" });
    }
  }
});

// Get order by ID
router.get("/:id", (async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        product: true,
      },
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error fetching order" });
  }
}) as RequestHandler);

// Get orders from last 7 days
router.get("/stats/recent", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        user: true,
        product: true,
      },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching recent orders" });
  }
});

// Get orders by user ID along with product details to display to user on their orders page
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.params.userId,
      },
      include: {
        product: true,
      },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user orders" });
  }
});

// Get users who bought a specific product
router.get("/product/:productId/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        orders: {
          some: {
            productId: req.params.productId,
          },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

export default router;
