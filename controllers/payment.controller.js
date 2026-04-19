import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

console.log("KEY:", process.env.RAZORPAY_KEY);
console.log("SECRET:", process.env.RAZORPAY_SECRET);

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
  
    const options = {
      amount: 2900,
      currency: "INR"
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    console.log("RAZORPAY ERROR:", err);  // 🔥 ADD THIS
    res.status(500).json({ error: err.message });
  }
};

// VERIFY
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

 const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + 30); // 30 days plan

await User.findByIdAndUpdate(req.user, {
  isPremium: true,
  premiumExpiry: expiryDate,
  paymentAmount: 29
});

      return res.json({ success: true });
    }

    res.status(400).json({ error: "Invalid signature" });

  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
};