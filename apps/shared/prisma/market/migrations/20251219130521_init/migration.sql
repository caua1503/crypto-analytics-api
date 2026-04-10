-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL');

-- CreateEnum
CREATE TYPE "CriterionCategory" AS ENUM ('SENTIMENT', 'TECHNICAL', 'MACRO');

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "priceUsd" DECIMAL(18,8) NOT NULL,
    "volume24hUsd" DECIMAL(24,2) NOT NULL,
    "marketCapUsd" DECIMAL(24,2),
    "btcDominance" DECIMAL(5,2),
    "fearGreed" INTEGER,
    "source" TEXT NOT NULL,
    "cachedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisEngineVersion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisEngineVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Criterion" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "CriterionCategory" NOT NULL,

    CONSTRAINT "Criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriterionWeight" (
    "id" SERIAL NOT NULL,
    "engineVersionId" INTEGER NOT NULL,
    "criterionId" INTEGER NOT NULL,
    "importanceWeight" DECIMAL(5,2) NOT NULL,
    "scoreMin" INTEGER NOT NULL,
    "scoreMax" INTEGER NOT NULL,

    CONSTRAINT "CriterionWeight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "sentimentScore" DECIMAL(5,2) NOT NULL,
    "technicalScore" DECIMAL(5,2) NOT NULL,
    "macroScore" DECIMAL(5,2) NOT NULL,
    "finalScore" DECIMAL(5,2) NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "engineVersionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_key" ON "Asset"("symbol");

-- CreateIndex
CREATE INDEX "MarketSnapshot_assetId_createdAt_idx" ON "MarketSnapshot"("assetId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Criterion_code_key" ON "Criterion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CriterionWeight_engineVersionId_criterionId_key" ON "CriterionWeight"("engineVersionId", "criterionId");

-- CreateIndex
CREATE INDEX "Analysis_assetId_createdAt_idx" ON "Analysis"("assetId", "createdAt");

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterionWeight" ADD CONSTRAINT "CriterionWeight_engineVersionId_fkey" FOREIGN KEY ("engineVersionId") REFERENCES "AnalysisEngineVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterionWeight" ADD CONSTRAINT "CriterionWeight_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "Criterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "MarketSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_engineVersionId_fkey" FOREIGN KEY ("engineVersionId") REFERENCES "AnalysisEngineVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
