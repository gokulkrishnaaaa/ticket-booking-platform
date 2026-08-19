import prisma from "../../lib/prisma";
import { CreateMovieInput } from "./movie.validation";

export async function createMovie(data: CreateMovieInput) {
  const movie = await prisma.movie.create({
    data: {
      title: data.title,
      description: data.description,
      languages: data.languages,
      duration: data.duration,
      genres: data.genres,
      posterUrl: data.posterUrl,
      releaseDate: new Date(`${data.releaseDate}T00:00:00.000Z`),
    },
    select: {
      id: true,
      title: true,
      description: true,
      languages: true,
      duration: true,
      genres: true,
      posterUrl: true,
      releaseDate: true,
    },
  });
  return movie;
}
