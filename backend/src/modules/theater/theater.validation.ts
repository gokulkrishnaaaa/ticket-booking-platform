import { z } from "zod";

export const createTheaterSchema = z.object({
  name: z.string().trim().min(2),
  phoneNumber: z.string().trim().min(10),
  street: z.string().trim().min(2),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  postalCode: z.string().trim().min(3),
  country: z.string().trim().min(2),
});

export type CreateTheaterInput = z.infer<typeof createTheaterSchema>;
