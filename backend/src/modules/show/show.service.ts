import { HTTP_STATUS } from "../../constants/http-status-codes";
import { AppError } from "../../errors/AppError";
import prisma from "../../lib/prisma";
import { getIndiaDate } from "../../utils/date";
import { CreateShowInput } from "./show.validation";

const SHOW_TURNAROUND_MINUTES = 15;

export async function createShow(
  userId: string,
  screenId: string,
  data: CreateShowInput,
) {
  const screen = await prisma.screen.findFirst({
    where: {
      id: screenId,
      isActive: true,

      theater: {
        theaterChain: {
          userId,
        },
      },
    },
    select: {
      id: true,
      seats: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          seatType: true,
        },
      },
    },
  });

  if (!screen) {
    throw new AppError("Screen not found", HTTP_STATUS.NOT_FOUND);
  }

  if (screen.seats.length === 0) {
    throw new AppError(
      "Cannot create a show because the screen has no active seats",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const movie = await prisma.movie.findFirst({
    where: {
      id: data.movieId,
      isActive: true,
    },
    select: {
      id: true,
      languages: true,
      duration: true,
      releaseDate: true,
    },
  });

  if (!movie) {
    throw new AppError("Movie not found", HTTP_STATUS.NOT_FOUND);
  }

  if (!movie.languages.includes(data.language)) {
    throw new AppError(
      "Language is not available for this movie",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const startTime = new Date(data.startTime);
  const showDate = getIndiaDate(startTime);
  const releaseDate = getIndiaDate(movie.releaseDate);

  if (showDate < releaseDate) {
    throw new AppError(
      "Show cannot be scheduled before the movie release date",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  //convert startTime and movie duration to millisec and calculate the endTime
  const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);
  const turnaroundInMilliseconds = SHOW_TURNAROUND_MINUTES * 60 * 1000;
  const newEndWithTurnaround = new Date(
    endTime.getTime() + turnaroundInMilliseconds,
  );

  const newStartMinusTurnaround = new Date(
    startTime.getTime() - turnaroundInMilliseconds,
  );

  const conflictingShow = await prisma.show.findFirst({
    where: {
      screenId,
      isActive: true,

      startTime: {
        lt: newEndWithTurnaround,
      },

      endTime: {
        gt: newStartMinusTurnaround,
      },
    },
  });

  if (conflictingShow) {
    throw new AppError(
      "Show conflicts with an existing show on this screen",
      HTTP_STATUS.CONFLICT,
    );
  }

  const show = await prisma.$transaction(async (tx) => {
    const show = await tx.show.create({
      data: {
        movieId: movie.id,
        screenId: screen.id,
        language: data.language,
        startTime,
        endTime,
      },
    });

    const showSeats = screen.seats.map((seat) => {
      const price = data.prices[seat.seatType];

      if (price === undefined) {
        throw new AppError(
          `Price is required for ${seat.seatType} seats`,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      return {
        showId: show.id,
        seatId: seat.id,
        price,
      };
    });

    await tx.showSeat.createMany({
      data: showSeats,
    });

    return show;
  });

  return show;
}
