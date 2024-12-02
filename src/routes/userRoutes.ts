import express from "express";
import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
});

router.get("/:id", (async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { orders: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
}) as RequestHandler);

router.put("/:id", async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        phoneNumber,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

export default router;
