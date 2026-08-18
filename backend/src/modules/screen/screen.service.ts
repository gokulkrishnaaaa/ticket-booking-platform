import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { CreateScreenInput } from "./screen.validation";

export async function createScreen(
  userId: string,
  theaterId: string,
  data: CreateScreenInput,
) {
  const theater = await prisma.theater.findFirst({
    where: {
      id: theaterId,
      isActive: true,
      theaterChain: {
        userId,
      },
    },
  });

  if (!theater) {
    throw new AppError("Theater not found", HTTP_STATUS.NOT_FOUND);
  }

  const screen = await prisma.screen.create({
    data: {
      name: data.name,
      theaterId,
      screenType: data.screenType,
    },
    select: {
      id: true,
      name: true,
      screenType: true,
      theaterId: true,
    },
  });
  return screen;
}
