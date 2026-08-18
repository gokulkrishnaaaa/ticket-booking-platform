import { z } from "zod";
import { ScreenType } from "../../../generated/prisma/enums";

export const createScreenSchema = z.object({
  name: z.string().trim().min(2),
  screenType: z.enum(ScreenType),
});
export const screenParamsSchema = z.object({
  theaterId: z.string().min(1),
});

export type CreateScreenInput = z.infer<typeof createScreenSchema>;
export type ScreenParams = z.infer<typeof screenParamsSchema>;
