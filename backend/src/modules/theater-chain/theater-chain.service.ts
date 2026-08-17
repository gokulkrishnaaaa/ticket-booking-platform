import { UserRole } from "../../../generated/prisma/enums";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { AppError } from "../../errors/AppError";
import prisma from "../../lib/prisma";
import { hashPassword } from "../../security/password";
import { RegisterTheaterChainInput } from "./theater-chain.validation";

export async function registerTheaterChain(data: RegisterTheaterChainInput) {
  const passwordHash = await hashPassword(data.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: UserRole.THEATER_CHAIN,
      },
    });

    const theaterChain = await tx.theaterChain.create({
      data: {
        userId: user.id,
        companyName: data.companyName,
        phoneNumber: data.phoneNumber,
        address: data.address,
      },
    });

    return {
      user,
      theaterChain,
    };
  });
}

export async function verifyTheaterChain(theaterChainId: string) {
  const theateChain = await prisma.theaterChain.findUnique({
    where: {
      id: theaterChainId,
    },
    select: {
      id: true,
      companyName: true,
      isVerified: true,
    },
  });

  if (!theateChain) {
    throw new AppError("Theater chain not found", HTTP_STATUS.NOT_FOUND);
  }

  if (theateChain.isVerified) {
    return theateChain;
  }

  return await prisma.theaterChain.update({
    where: {
      id: theateChain.id,
    },
    data: {
      isVerified: true,
    },
    select: {
      id: true,
      companyName: true,
      isVerified: true,
    },
  });
}
