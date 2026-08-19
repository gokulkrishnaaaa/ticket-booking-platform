import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string(),
  languages: z.array(z.string().min(1).trim()).min(1),
  duration: z.int().positive(),
  genres: z.array(z.string().trim().min(1)).min(1),
  posterUrl: z.string().url().optional(),
  releaseDate: z.iso.date(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
