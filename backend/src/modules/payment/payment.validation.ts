import { z } from "zod";
import { PaymentMethod } from "../../../generated/prisma/enums";

export const initiatePaymentSchema = z.object({
  paymentMethod: z.enum(PaymentMethod),
});

export const initiatePaymentParamsSchema = z.object({
  bookingId: z.uuid(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, "Invalid payment signature"),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type InitiatePaymentParams = z.infer<typeof initiatePaymentParamsSchema>;
