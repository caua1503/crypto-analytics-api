-- AlterTable
ALTER TABLE "MarketSnapshot" ADD COLUMN     "close" DECIMAL(18,8),
ADD COLUMN     "high" DECIMAL(18,8),
ADD COLUMN     "low" DECIMAL(18,8),
ADD COLUMN     "open" DECIMAL(18,8);
