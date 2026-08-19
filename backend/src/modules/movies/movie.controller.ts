import { Request, Response } from "express";
import { createMovie as createMovieService } from "./movie.service";
import { HTTP_STATUS } from "../../constants/http-status-codes";

export async function createMovie(req: Request, res: Response) {
  const movie = await createMovieService(req.body);
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Movie created successfully",
    data: movie,
  });
}
