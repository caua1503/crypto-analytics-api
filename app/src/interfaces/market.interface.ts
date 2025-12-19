import { Asset } from "./asset.interface.js";

export interface MarketSnapshot {
    id: number;
    assetId: number;
    asset: Asset;

    priceUsd: number;
    volumeUsd24Hr: number;
    marketCapUsd: number;

    btcDominance: number;
    changePercent24Hr: number;

    createdAt: Date
}