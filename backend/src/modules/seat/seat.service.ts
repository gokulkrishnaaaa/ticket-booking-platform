import prisma from "../../lib/prisma";
import { CreateSeatInput } from "./seat.validation";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";

export async function createSeat(
  userId: string,
  screenId: string,
  data: CreateSeatInput,
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
  });

  if (!screen) {
    throw new AppError("Screen not found", HTTP_STATUS.NOT_FOUND);
  }

  const seat = await prisma.seat.create({
    data: {
      screenId,
      row: data.row,
      number: data.number,
      seatType: data.seatType,
    },
    select: {
      id: true,
      screenId: true,
      row: true,
      number: true,
      seatType: true,
    },
  });
  return seat;
}
