-- CreateTable
CREATE TABLE "Theater" (
    "id" TEXT NOT NULL,
    "theaterChainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theater_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Theater_theaterChainId_idx" ON "Theater"("theaterChainId");

-- AddForeignKey
ALTER TABLE "Theater" ADD CONSTRAINT "Theater_theaterChainId_fkey" FOREIGN KEY ("theaterChainId") REFERENCES "TheaterChain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
