import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { CreateTheaterInput } from "./theater.validation";

export async function createTheater(userId: string, data: CreateTheaterInput) {
  const theaterChain = await prisma.theaterChain.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      isVerified: true,
    },
  });

  if (!theaterChain) {
    throw new AppError("Theater chain not found", HTTP_STATUS.NOT_FOUND);
  }

  if (!theaterChain.isVerified) {
    throw new AppError("Theater chain is not verified", HTTP_STATUS.FORBIDDEN);
  }

  return prisma.theater.create({
    data: {
      theaterChainId: theaterChain.id,
      name: data.name,
      phoneNumber: data.phoneNumber,
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
    },
  });
}
