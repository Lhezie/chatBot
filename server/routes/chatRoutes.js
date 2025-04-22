import express from "express";
import axios from "axios";
import MenuItem from "../models/MenuItem.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const OPTIONS = `Welcome to LeezieBite Bot!
Please select an option:
1 - Place an order
99 - Checkout order
98 - See order history
97 - See current order
0 - Cancel order`;

router.post("/", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const input = message.trim();
    const session = req.session;
    session.deviceId = sessionId;
    if (!session.currentOrder) session.currentOrder = [];

    // 1) Show menu
    if (input === "1") {
      const menu = await MenuItem.find();
      session.menu = menu;
      const menuList = menu
        .map((item, i) => `${i + 1} - ${item.name} - ₦${item.price}`)
        .join("\n");
      return res.json({
        reply: `Menu:\n${menuList}\nSelect item number to add.`,
      });
    }

    // 97) Current cart
    if (input === "97") {
      if (!session.currentOrder.length)
        return res.json({ reply: "🕳️ No current order." });
      const list = session.currentOrder
        .map((it, i) => `${i + 1}. ${it.name} - ₦${it.price}`)
        .join("\n");
      return res.json({ reply: `Current Order:\n${list}` });
    }

    // 99) Checkout → Paystack
    if (input === "99") {
      if (!session.currentOrder.length) {
        return res.json({
          reply: "No order to place.\nType 1 to start a new order.",
          total: 0,
        });
      }

      const total = session.currentOrder.reduce((sum, it) => sum + it.price, 0);

      // Initialize Paystack with full cart in metadata
      const paystackRes = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: `${session.deviceId}@guest.com`,
          amount: total * 100,
          metadata: {
            sessionId,
            items: session.currentOrder,
            total,
          },
          callback_url: `${process.env.BASE_URL}/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      const paymentUrl = paystackRes.data.data.authorization_url;
      return res.json({
        reply: `Order placed!\nTotal: ₦${total}\nClick below to pay:\n${paymentUrl}`,
        total,
      });
    }

    // 98) Order history — fetch only PAID orders
    if (input === "98") {
      // Import Order dynamically to avoid circular
      const Order = (await import("../models/Order.js")).default;
      const orders = await Order.find({ sessionId, paid: true });
      if (!orders.length) {
        return res.json({ reply: "Order History:\nNo completed orders." });
      }
      const history = orders
        .map((o, i) => {
          const names = o.items.map((it) => it.name).join(", ");
          return `${i + 1}. ${names} - ₦${o.total}`;
        })
        .join("\n");
      return res.json({ reply: `Order History:\n${history}` });
    }

    // 0) Cancel
    if (input === "0") {
      session.currentOrder = [];
      return res.json({ reply: "Your order has been cancelled." });
    }

    // Numeric → add to cart
    if (!isNaN(input)) {
      if (!session.menu?.length) session.menu = await MenuItem.find();
      const idx = parseInt(input, 10) - 1;
      const item = session.menu[idx];
      if (item) {
        session.currentOrder.push(item);
        return res.json({
          reply: `${item.name} added to your order.\nType another number or 99 to checkout.`,
        });
      } else {
        return res.json({
          reply: "Invalid menu option. Type 1 to see the menu again.",
        });
      }
    }

    // Fallback
    return res.json({ reply: OPTIONS });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).send("Something went wrong in the chat route.");
  }
});

export default router;
