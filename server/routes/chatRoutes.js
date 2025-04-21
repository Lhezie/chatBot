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
    const input = message.trim();
    const session = req.session;

    session.deviceId = sessionId;
    if (!session.currentOrder) session.currentOrder = [];

    // 1. Show menu
    if (input === "1") {
      const menu = await MenuItem.find();
      session.menu = menu;

      const menuList = menu
        .map((item, i) => `${i + 1} - ${item.name} - ₦${item.price}`)
        .join("\n");

      return res.json({ reply: `Menu:\n${menuList}\nSelect item number to add.` });
    }

    // 2. View current order (97)
    if (input === "97") {
      if (!session.currentOrder.length) {
        return res.json({ reply: "🕳️ No current order." });
      }
      const list = session.currentOrder
        .map((item, i) => `${i + 1}. ${item.name} - ₦${item.price}`)
        .join("\n");
      return res.json({ reply: ` Current Order:\n${list}` });
    }

    // 3. Checkout and Paystack link (99)
    if (input === "99") {
      if (!session.currentOrder.length) {
        return res.json({ reply: "No order to place.\nType 1 to start a new order." });
      }

      const total = session.currentOrder.reduce((sum, item) => sum + item.price, 0);

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

      return res.json({
        reply: `Order placed!\nTotal: ₦${total}\nClick below to pay:\n${paymentUrl}`,
      });
    }

    // 4. View order history (98)
    if (input === "98") {
      const orders = await Order.find({ sessionId: session.deviceId });
      const history = orders.map((o, i) => `${i + 1}. ₦${o.total} - ${o.status}`).join("\n");
      return res.json({ reply: `Order History:\n${history || "No orders yet."}` });
    }

    // 5. Cancel current order (0)
    if (input === "0") {
      session.currentOrder = [];
      return res.json({ reply: "Your order has been cancelled." });
    }

    // 6. Add item to order (if input is a number)
    if (!isNaN(input)) {
      if (!session.menu || session.menu.length === 0) {
        const menu = await MenuItem.find();
        session.menu = menu;
      }

      const index = parseInt(input, 10) - 1;
      const item = session.menu[index];

      if (item) {
        session.currentOrder.push(item);
        return res.json({
          reply: `${item.name} added to your order.\nType another number or 99 to checkout.`,
        });
      } else {
        return res.json({ reply: "Invalid menu option. Type 1 to see the menu again." });
      }
    }

    // 7. Fallback
    return res.json({ reply: OPTIONS });

  } catch (error) {
    console.error("Chat route error:", error.message);
    return res.status(500).send("Something went wrong in the chat route.");
  }
});

export default router;
