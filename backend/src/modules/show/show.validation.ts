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

export const getShowsQuerySchema = z.object({
  movieId: z.string().min(1).optional(),
  date: z.iso.date().optional(),
  city: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const showSeatParamsSchema = z.object({
  showId: z.uuid(),
});

export type CreateShowInput = z.infer<typeof createShowSchema>;
export type ShowParams = z.infer<typeof showParamsSchema>;
export type GetShowsQueryInput = z.infer<typeof getShowsQuerySchema>;
export type ShowSeatParams = z.infer<typeof showSeatParamsSchema>;