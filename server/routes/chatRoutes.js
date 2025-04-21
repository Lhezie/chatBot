import express from "express";
import axios from "axios";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
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
    const session = req.session;

    // Set deviceId only once to keep session consistent
    if (!session.deviceId) {
      session.deviceId = sessionId;
    }

    if (!session.currentOrder) session.currentOrder = [];

    const input = message.trim();

    // 1 - Show menu
    if (input === "1") {
      const menu = await MenuItem.find();
      session.menu = menu;

      const menuList = menu
        .map((item, i) => `${i + 1} - ${item.name} - ₦${item.price}`)
        .join("\n");

      return req.session.save(() =>
        res.json({
          reply: `Menu:\n${menuList}\nSelect item number to add.`,
        })
      );
    }

    // Add item to order
    if (!isNaN(input)) {
      if (!session.menu || session.menu.length === 0) {
        session.menu = await MenuItem.find();
      }

      const index = parseInt(input) - 1;
      const menu = session.menu;

      if (menu[index]) {
        session.currentOrder.push(menu[index]);

        return req.session.save(() =>
          res.json({
            reply: ` ${menu[index].name} added to your order.\nType another number or 99 to checkout.`,
          })
        );
      } else {
        return res.json({
          reply: "Invalid menu option. Type 1 to see the menu again.",
        });
      }
    }

    // 97 - Show current order
    if (input === "97") {
      if (!session.currentOrder || session.currentOrder.length === 0) {
        return res.json({ reply: "No current order." });
      }

      const list = session.currentOrder
        .map((item, i) => `${i + 1}. ${item.name} - ₦${item.price}`)
        .join("\n");

      return res.json({ reply: `Current Order:\n${list}` });
    }

    // 99 - Checkout
    if (input === "99") {
      if (!session.currentOrder || session.currentOrder.length === 0) {
        return res.json({
          reply: "No order to place. Type 1 to start a new order.",
        });
      }

      const total = session.currentOrder.reduce(
        (sum, item) => sum + item.price,
        0
      );

      const newOrder = await Order.create({
        sessionId: session.deviceId,
        items: session.currentOrder,
        total,
        paid: false,
        status: "Pending",
      });

      session.currentOrder = [];

      const paystackResponse = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: `${session.deviceId}@guest.com`,
          amount: total * 100,
          metadata: { orderId: newOrder._id.toString() },
          callback_url: `${process.env.BASE_URL}/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      const paymentUrl = paystackResponse.data.data.authorization_url;

      return req.session.save(() =>
        res.json({
          reply: `Order placed!\nTotal: ₦${total}\nClick below to pay:`,
          payUrl: paymentUrl,
          amount: total * 100,
        })
      );
    }

    // 98 - Order history
    if (input === "98") {
      const orders = await Order.find({ sessionId: session.deviceId });
      const history = orders
        .map((o, i) => `${i + 1}. ₦${o.total} - ${o.status}`)
        .join("\n");

      return res.json({
        reply: `Order History:\n${history || "No orders yet."}`,
      });
    }

    // 0 - Cancel order
    if (input === "0") {
      session.currentOrder = [];

      return req.session.save(() =>
        res.json({ reply: "Your order has been cancelled." })
      );
    }

    // Fallback
    return res.json({ reply: OPTIONS });
  } catch (error) {
    console.error("Chat route error:", error);
    return res.status(500).send("Something went wrong in the chat route.");
  }
});

export default router;
