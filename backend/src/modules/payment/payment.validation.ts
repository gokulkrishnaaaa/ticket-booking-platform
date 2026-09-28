import { z } from "zod";
import { PaymentMethod } from "../../../generated/prisma/enums";

export const initiatePaymentSchema = z.object({
  paymentMethod: z.enum(PaymentMethod),
});

export const initiatePaymentParamsSchema = z.object({
  bookingId: z.uuid(),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
export type InitiatePaymentParams = z.infer<typeof initiatePaymentParamsSchema>;
