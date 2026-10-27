import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import {
  BookingStatus,
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  ShowSeatStatus,
  TicketStatus,
} from "../../../generated/prisma/enums";
import razorpay from "../../lib/razorpay";
import { env } from "../../config/env";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { VerifyPaymentInput } from "./payment.validation";
import { Prisma } from "../../../generated/prisma/client";

const ORDER_CREATION_LEASE_MS = 60_000;

export async function initiatePayment(
  userId: string,
  bookingId: string,
  paymentMethod: PaymentMethod,
) {
  const now = new Date();
  const leaseExpiredBefore = new Date(now.getTime() - ORDER_CREATION_LEASE_MS);

  const { payment, bookingReference, shouldCreateOrder } =
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id
        FROM "Booking"
        WHERE id = ${bookingId}
        AND "userId" = ${userId}
        FOR UPDATE
    `;

      const booking = await tx.booking.findFirst({
        where: {
          userId,
          id: bookingId,
        },
        include: {
          bookingSeats: {
            include: {
              showSeat: {
                select: {
                  showId: true,
                  seatId: true,
                  status: true,
                  price: true,
                  reservedUntil: true,
                },
              },
            },
          },
        },
      });

      if (!booking || booking.status !== "PENDING") {
        throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);
      }

      for (const bookingSeat of booking.bookingSeats) {
        const seat = bookingSeat.showSeat;

        if (
          seat.status !== "RESERVED" ||
          seat.reservedUntil === null ||
          seat.reservedUntil <= now
        ) {
          throw new AppError(
            "Reservation has expired or is no longer valid",
            HTTP_STATUS.CONFLICT,
          );
        }
      }

      const existingPayment = await tx.payment.findFirst({
        where: {
          bookingId,
          status: "PENDING",
        },
      });

      if (existingPayment) {
        // Existing order: no need to create another one.
        if (existingPayment.gatewayOrderId) {
          return {
            payment: existingPayment,
            bookingReference: booking.bookingReference,
            shouldCreateOrder: false,
          };
        }

        // A recent order-creation attempt is still active.
        if (
          existingPayment.orderCreationInProgress &&
          existingPayment.orderCreationStartedAt &&
          existingPayment.orderCreationStartedAt > leaseExpiredBefore
        ) {
          throw new AppError(
            "Payment order creation is already in progress",
            HTTP_STATUS.CONFLICT,
          );
        }

        // Recover a stale attempt by claiming a new lease.
        const recoveredPayment = await tx.payment.update({
          where: {
            id: existingPayment.id,
          },
          data: {
            orderCreationInProgress: true,
            orderCreationStartedAt: now,
          },
        });

        return {
          payment: recoveredPayment,
          bookingReference: booking.bookingReference,
          shouldCreateOrder: true,
        };
      }

      // No pending payment exists: create one.
      const payment = await tx.payment.create({
        data: {
          bookingId,
          gateway: PaymentGateway.RAZORPAY,
          paymentMethod,
          amount: booking.totalAmount,
          status: "PENDING",
          orderCreationInProgress: true,
          orderCreationStartedAt: now,
        },
      });

      return {
        payment,
        bookingReference: booking.bookingReference,
        shouldCreateOrder: true,
      };
    });

  // If the payment already has an order, reuse it.
  if (!shouldCreateOrder && payment.gatewayOrderId) {
    return {
      payment,
      checkout: {
        keyId: env.razorpayKeyId,
        orderId: payment.gatewayOrderId,
        amount: payment.amount.mul(100).toNumber(),
        currency: "INR",
      },
    };
  }

  try {
    const order = await razorpay.orders.create({
      amount: payment.amount.mul(100).toNumber(),
      currency: "INR",
      receipt: bookingReference,
    });

    const updatePayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        gatewayOrderId: order.id,
        orderCreationInProgress: false,
        orderCreationStartedAt: null,
      },
    });

    return {
      payment: updatePayment,
      checkout: {
        keyId: env.razorpayKeyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    };
  } catch (error) {
    throw error;
  }
}

export async function verifyPayment(
  userId: string,
  bookingId: string,
  data: VerifyPaymentInput,
) {
  const payment = await prisma.payment.findFirst({
    where: {
      bookingId,
      gatewayOrderId: data.razorpay_order_id,
      booking: {
        userId,
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND);
  }

  // Generate the expected Razorpay signature.
  const expectedSignature = createHmac("sha256", env.razorpayKeySecret)
    .update(`${payment.gatewayOrderId}|${data.razorpay_payment_id}`)
    .digest("hex");

  // Compare signatures safely.
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(data.razorpay_signature, "hex");

  const isSignatureValid =
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer);

  if (!isSignatureValid) {
    throw new AppError("Invalid payment signature", HTTP_STATUS.BAD_REQUEST);
  }

  const razorpayPayment = await razorpay.payments.fetch(
    data.razorpay_payment_id,
  );

  if (razorpayPayment.order_id !== payment.gatewayOrderId) {
    throw new AppError(
      "Payment does not belong to this order",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (razorpayPayment.amount !== payment.amount.mul(100).toNumber()) {
    throw new AppError(
      "Payment amount does not match",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (razorpayPayment.currency !== "INR") {
    throw new AppError("Invalid payment currency", HTTP_STATUS.BAD_REQUEST);
  }

  if (razorpayPayment.status !== "captured") {
    throw new AppError("Payment has not been captured", HTTP_STATUS.CONFLICT);
  }

  const bookingResult = await confirmBookingAfterPayment(
    userId,
    bookingId,
    payment.id,
    razorpayPayment.id,
    data.razorpay_order_id,
  );

  return {
    verified: true,
    orderId: payment.gatewayOrderId,
    paymentId: razorpayPayment.id,
    status: razorpayPayment.status,
    booking: bookingResult,
  };
}

export async function confirmBookingAfterPayment(
  userId: string,
  bookingId: string,
  paymentId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
) {
  return prisma.$transaction(async (tx) => {
    // 1. Lock the booking row.
    const lockedBookings = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "Booking"
      WHERE id = ${bookingId}
        AND "userId" = ${userId}
      FOR UPDATE
    `;

    if (lockedBookings.length === 0) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND);
    }

    // 2. Lock the payment row to serialize verification attempts.
    const lockedPayments = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM "Payment"
      WHERE id = ${paymentId}
        AND "bookingId" = ${bookingId}
      FOR UPDATE
    `;

    if (lockedPayments.length === 0) {
      throw new AppError("Payment not found", HTTP_STATUS.NOT_FOUND);
    }

    // Read fresh state after acquiring the locks.
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        bookingSeats: true,
      },
    });

    const payment = await tx.payment.findUniqueOrThrow({
      where: { id: paymentId },
    });

    if (payment.gatewayOrderId !== razorpayOrderId) {
      throw new AppError("Payment order does not match", HTTP_STATUS.CONFLICT);
    }

    // 3. Handle retries without issuing duplicate tickets.
    if (
      booking.status === BookingStatus.CONFIRMED &&
      payment.status === PaymentStatus.SUCCESS &&
      payment.transactionId === razorpayPaymentId
    ) {
      const tickets = await tx.ticket.findMany({
        where: { bookingId },
        select: {
          id: true,
          ticketNumber: true,
          showSeatId: true,
          status: true,
        },
      });

      // Validate ticket count before returning existing tickets.
      if (tickets.length !== booking.bookingSeats.length) {
        throw new AppError(
          "Booking is confirmed but ticket records are incomplete",
          HTTP_STATUS.CONFLICT,
        );
      }

      return {
        confirmed: true,
        bookingId,
        tickets,
      };
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new AppError("Booking is no longer pending", HTTP_STATUS.CONFLICT);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError("Payment is no longer pending", HTTP_STATUS.CONFLICT);
    }

    if (
      !payment.gatewayOrderId ||
      payment.amount.comparedTo(booking.totalAmount) !== 0
    ) {
      throw new AppError(
        "Payment details do not match the booking",
        HTTP_STATUS.CONFLICT,
      );
    }

    const seatIds = booking.bookingSeats.map(
      (bookingSeat) => bookingSeat.showSeatId,
    );

    if (seatIds.length === 0) {
      throw new AppError("Booking has no seats", HTTP_STATUS.CONFLICT);
    }

    // 4. Lock seats in a consistent order.
    const lockedSeats = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "ShowSeat"
        WHERE id IN (${Prisma.join(seatIds)})
        ORDER BY id
        FOR UPDATE
      `;

    if (lockedSeats.length !== seatIds.length) {
      throw new AppError(
        "One or more reserved seats could not be found",
        HTTP_STATUS.CONFLICT,
      );
    }

    // Re-read seat status and expiry after acquiring the locks.
    const seats = await tx.showSeat.findMany({
      where: {
        id: { in: seatIds },
      },
    });

    const now = new Date();

    const seatsAreValid =
      seats.length === seatIds.length &&
      seats.every(
        (seat) =>
          seat.status === ShowSeatStatus.RESERVED &&
          seat.reservedUntil !== null &&
          seat.reservedUntil > now,
      );

    if (!seatsAreValid) {
      throw new AppError(
        "Reservation has expired or is no longer valid",
        HTTP_STATUS.CONFLICT,
      );
    }

    // 5. Transition all seats from RESERVED to BOOKED.
    const updatedSeats = await tx.showSeat.updateMany({
      where: {
        id: { in: seatIds },
        status: ShowSeatStatus.RESERVED,
        reservedUntil: { gt: now },
      },
      data: {
        status: ShowSeatStatus.BOOKED,
        reservedUntil: null,
      },
    });

    if (updatedSeats.count !== seatIds.length) {
      throw new AppError(
        "Could not confirm all reserved seats",
        HTTP_STATUS.CONFLICT,
      );
    }

    // 6. Record the successful payment.
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.SUCCESS,
        transactionId: razorpayPaymentId,
      },
    });

    // 7. Confirm the booking.
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CONFIRMED,
      },
    });

    // 8. Issue one ticket per seat.
    await tx.ticket.createMany({
      data: seatIds.map((showSeatId) => ({
        ticketNumber: randomUUID(),
        bookingId,
        showSeatId,
        status: TicketStatus.ISSUED,
      })),
    });

    const tickets = await tx.ticket.findMany({
      where: { bookingId },
      select: {
        id: true,
        ticketNumber: true,
        showSeatId: true,
        status: true,
      },
    });

    return {
      confirmed: true,
      bookingId,
      tickets,
    };
  });
}
