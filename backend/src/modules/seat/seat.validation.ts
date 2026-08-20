import { z } from "zod";
import { SeatType } from "../../../generated/prisma/enums";

export const createSeatSchema = z.object({
  row: z.string().trim().min(1),
  number: z.int().positive(),
  seatType: z.enum(SeatType).optional(),
});

export const seatParamsSchema = z.object({
  screenId: z.string().min(1),
});

export type CreateSeatInput = z.infer<typeof createSeatSchema>;
export type SeatParams = z.infer<typeof seatParamsSchema>;
