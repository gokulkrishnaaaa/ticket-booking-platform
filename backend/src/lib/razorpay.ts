import Razorpay from "razorpay";
import { env } from "../config/env";

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

export default razorpay;
