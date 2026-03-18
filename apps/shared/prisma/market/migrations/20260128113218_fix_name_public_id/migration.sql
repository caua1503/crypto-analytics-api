/*
  Warnings:

  - You are about to drop the column `public_Id` on the `Asset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[publicId]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - The required column `publicId` was added to the `Asset` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Asset_public_Id_key";

-- AlterTable
ALTER TABLE "Asset"
DROP COLUMN "public_Id";

ALTER TABLE "Asset"
ADD COLUMN "publicId" UUID;

UPDATE "Asset"
SET "publicId" = gen_random_uuid()
WHERE "publicId" IS NULL;

ALTER TABLE "Asset"
ALTER COLUMN "publicId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Asset_publicId_key" ON "Asset"("publicId");
