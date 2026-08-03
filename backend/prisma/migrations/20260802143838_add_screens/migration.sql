-- CreateEnum
CREATE TYPE "ScreenType" AS ENUM ('STANDARD', 'IMAX', 'DX4', 'DOLBY');

-- CreateTable
CREATE TABLE "Screen" (
    "id" TEXT NOT NULL,
    "theaterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "screenType" "ScreenType" NOT NULL DEFAULT 'STANDARD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Screen_theaterId_idx" ON "Screen"("theaterId");

-- CreateIndex
CREATE UNIQUE INDEX "Screen_theaterId_name_key" ON "Screen"("theaterId", "name");

-- AddForeignKey
ALTER TABLE "Screen" ADD CONSTRAINT "Screen_theaterId_fkey" FOREIGN KEY ("theaterId") REFERENCES "Theater"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
