import { Asset } from "./asset.interface.js";
import { z } from "zod";

export const MarketSnapshot  = z.object({
    id: z.number(),
    assetId: z.number(),
    // asset: Asset;

    priceUsd: z.number(),
    volumeUsd24Hr: z.number(),
    marketCapUsd: z.number(),

    btcDominance: z.number(),
    changePercent24Hr: z.number(),

    createdAt: z.date(),
});



export const MarketSnapshotCreate = z.object({
    assetId: z.number().int().positive(),
    // asset: Asset;

    priceUsd: z.number().nonnegative(),
    volumeUsd24Hr: z.number().nonnegative(),
    marketCapUsd: z.number().nonnegative(),

    btcDominance: z.number().nonnegative(),
    changePercent24Hr: z.number(),
});


export type MarketSnapshotType = z.infer<typeof MarketSnapshot>;
export type MarketSnapshotCreateType = z.infer<typeof MarketSnapshotCreate>;