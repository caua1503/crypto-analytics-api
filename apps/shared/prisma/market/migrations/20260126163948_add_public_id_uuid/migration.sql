/*
  Warnings:

  - A unique constraint covering the columns `[public_Id]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - The required column `public_Id` was added to the `Asset` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Asset"
ADD COLUMN "public_Id" UUID;

UPDATE "Asset"
SET "public_Id" = gen_random_uuid()
WHERE "public_Id" IS NULL;

ALTER TABLE "Asset"
ALTER COLUMN "public_Id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Asset_public_Id_key" ON "Asset"("public_Id");
