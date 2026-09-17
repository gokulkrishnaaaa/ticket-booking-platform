import { z } from "zod";

export const reserveSeatsSchema = z.object({
  showSeatIds: z
    .array(z.uuid())
    .min(1)
    .max(10)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Duplicate seat IDs are not allowed",
    }),
});

export const reserveSeatsParamsSchema = z.object({
  showId: z.uuid(),
});

export type ReserveSeatsInput = z.infer<typeof reserveSeatsSchema>;
export type ReserveSeatsParams = z.infer<typeof reserveSeatsParamsSchema>;
