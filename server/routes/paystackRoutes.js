import express from "express";
import axios from "axios";
import Order from "../models/Order.js";

const router = express.Router();

// callback
router.get("/callback", async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).send("Missing reference");
  }

  try {
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    const data = verifyRes.data.data;
    const orderId = data.metadata?.orderId;

    if (data.status === "success" && orderId) {
      // Update order in DB
      await Order.findByIdAndUpdate(orderId, {
        paid: true,
        status: "Paid",
      });

      console.log(`Payment successful for Order ID: ${orderId}`);
      return res.redirect(`${process.env.FRONTEND_BASE_URL}/payment-success`);
    } else {
      console.warn(" Payment not successful or missing order ID");
      return res.redirect(`${process.env.FRONTEND_BASE_URL}/payment-failed`);
    }
  } catch (err) {
    console.error("Paystack verify error:", err.response?.data || err.message);
    return res
      .status(500)
      .send("Something went wrong verifying the payment.");
  }
});

export default router;
