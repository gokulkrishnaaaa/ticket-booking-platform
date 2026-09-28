-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "orderCreationInProgress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orderCreationStartedAt" TIMESTAMP(3);
