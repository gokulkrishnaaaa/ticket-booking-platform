-- CreateTable
CREATE TABLE "TheaterChain" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheaterChain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TheaterChain_userId_key" ON "TheaterChain"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TheaterChain_companyName_key" ON "TheaterChain"("companyName");

-- AddForeignKey
ALTER TABLE "TheaterChain" ADD CONSTRAINT "TheaterChain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
