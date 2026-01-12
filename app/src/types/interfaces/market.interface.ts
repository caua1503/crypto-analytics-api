import { Asset } from "./asset.interface.js";
import { z } from "zod";
import { zDecimal, zDecimaltoString } from "../common.js";

export const MarketSnapshot = z.object({
    id: z.number(),
    assetId: z.number(),
    // asset: Asset,

    priceUsd: zDecimaltoString,
    volume24hUsd: zDecimaltoString,
    marketCapUsd: zDecimaltoString,

    btcDominance: zDecimaltoString,
    fearGreed: z.number().optional(),

    source: z.string(),
    cachedUntil: z.coerce.date(),

    createdAt: z.coerce.date(),
});

export const MarketSnapshotCreate = MarketSnapshot.omit({
    id: true,
    createdAt: true,
}).extend({
    priceUsd: zDecimal,
    volume24hUsd: zDecimal,
    marketCapUsd: zDecimal,
    btcDominance: zDecimal,
});

export const MarketSnapshotResponse = MarketSnapshot.extend({
    priceUsd: z.string(),
    volume24hUsd: z.string(),
    marketCapUsd: z.string(),
    btcDominance: z.string(),
});

export type MarketSnapshotType = z.infer<typeof MarketSnapshot>;
export type MarketSnapshotCreateType = z.infer<typeof MarketSnapshotCreate>;
