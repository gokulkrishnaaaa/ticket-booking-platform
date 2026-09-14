import { z } from "zod";
import { SeatType } from "../../../generated/prisma/enums";

export const createShowSchema = z.object({
  movieId: z.string().min(1),
  language: z.string().min(1),
  startTime: z.iso.datetime({ offset: true }),
  prices: z.partialRecord(z.enum(SeatType), z.number().positive()),
});

export const showParamsSchema = z.object({
  screenId: z.string().min(1),
});

export type CreateShowInput = z.infer<typeof createShowSchema>;
export type ShowParams = z.infer<typeof showParamsSchema>;
