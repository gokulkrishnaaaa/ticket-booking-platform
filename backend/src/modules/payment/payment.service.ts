import prisma from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { HTTP_STATUS } from "../../constants/http-status-codes";
import { PaymentMethod } from "../../../generated/prisma/enums";
import { PaymentGateway } from "../../../generated/prisma/enums";
import razorpay from "../../lib/razorpay";
import { env } from "../../config/env";

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
