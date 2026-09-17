import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { Prisma, ShowSeatStatus } from "../../../generated/prisma/client";
import crypto from "node:crypto";

type ShowSeatForReservation = {
  id: string;
  showId: string;
  status: ShowSeatStatus;
  price: Prisma.Decimal;
  reservedUntil: Date | null;
};

export async function reserveSeats(
  userId: string,
  showId: string,
  showSeatIds: string[],
) {
  return prisma.$transaction(async (tx) => {
    //lock the seats
    const showSeats = await tx.$queryRaw<ShowSeatForReservation[]>`
        Select id, "showId", status, price, "reservedUntil"
        From "ShowSeat"
        Where "showId" = ${showId}
            and id in (${Prisma.join(showSeatIds)})
        For Update
    `;

    if (showSeats.length !== showSeatIds.length) {
      throw new AppError(
        "One or more seats are invalid",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const now = new Date();

    for (const seat of showSeats) {
      const canReserve =
        seat.status === "AVAILABLE" ||
        (seat.status === "RESERVED" &&
          seat.reservedUntil !== null &&
          seat.reservedUntil <= now);

      if (!canReserve) {
        throw new AppError(
          "One or more seats are unavailable",
          HTTP_STATUS.CONFLICT,
        );
      }
    }

    const reservedUntil = new Date(now.getTime() + 10 * 60 * 1000);

    //assign a zero amount to decimal field
    let totalAmount = new Prisma.Decimal(0);

    for (const seat of showSeats) {
      totalAmount = totalAmount.add(seat.price);
    }

    await tx.showSeat.updateMany({
      where: {
        id: {
          in: showSeatIds,
        },
        showId,
      },
      data: {
        status: "RESERVED",
        reservedUntil,
      },
    });

    const bookingReference = `BK-${crypto.randomBytes(6).toString("hex").toUpperCase()}`; //each byte becomes 2 hexadecimal

    const booking = await tx.booking.create({
      data: {
        bookingReference,
        userId,
        showId,
        status: "PENDING",
        totalAmount,
      },
    });

    const bookingSeats = showSeatIds.map((showSeatId) => ({
      bookingId: booking.id,
      showSeatId,
    }));

    await tx.bookingSeat.createMany({
      data: bookingSeats,
    });
    return booking;
  });
}
