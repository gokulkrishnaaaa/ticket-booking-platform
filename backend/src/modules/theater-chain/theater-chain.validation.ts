import { z } from "zod";

export const registerTheaterChainSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  companyName: z.string().trim().min(2),
  phoneNumber: z.string().trim().min(10),
  address: z.string().trim().min(5),
});

export type RegisterTheaterChainInput = z.infer<
  typeof registerTheaterChainSchema
>;
