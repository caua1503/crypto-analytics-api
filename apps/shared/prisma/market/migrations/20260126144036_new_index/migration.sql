-- CreateIndex
CREATE INDEX "Analysis_snapshotId_idx" ON "Analysis"("snapshotId");

-- CreateIndex
CREATE INDEX "Analysis_engineVersionId_idx" ON "Analysis"("engineVersionId");

-- CreateIndex
CREATE INDEX "MarketSnapshot_assetId_idx" ON "MarketSnapshot"("assetId");
