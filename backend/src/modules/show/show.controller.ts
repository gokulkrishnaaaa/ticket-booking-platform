import { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import {
  createShow as createShowService,
  listShows as listShowsService,
  listShowSeats as listShowSeatsService,
} from "./show.service";
import {
  ShowParams,
  GetShowsQueryInput,
  ShowSeatParams,
} from "./show.validation";

export async function createShow(req: Request<ShowParams>, res: Response) {
  const show = await createShowService(
    req.user!.id,
    req.params.screenId,
    req.body,
  );

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Show created successfully",
    data: show,
  });
}

export async function listShows(req: Request, res: Response) {
  //need to change this in future
  const query = res.locals.validatedQuery as GetShowsQueryInput;

  const result = await listShowsService(query);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result.shows,
    pagination: {
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
    },
  });
}

export async function listShowSeats(
  req: Request<ShowSeatParams>,
  res: Response,
) {
  const showSeats = await listShowSeatsService(req.params.showId);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: showSeats,
  });
}
