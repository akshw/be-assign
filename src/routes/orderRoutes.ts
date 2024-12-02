import express from "express";
import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";

const router = express.Router();
const prisma = new PrismaClient();

// Create order
router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Error creating order" });
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

// Get orders by user ID
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
