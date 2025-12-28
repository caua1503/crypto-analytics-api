import { Asset } from "./asset.interface.js";
import { z } from "zod";

export const MarketSnapshot = z.object({
	id: z.number(),
	assetId: z.number(),
	// asset: Asset,

	priceUsd: z.number(),
	volumeUsd24Hr: z.number(),
	marketCapUsd: z.number(),

	btcDominance: z.number(),
	changePercent24Hr: z.number(),

	createdAt: z.coerce.date(),
});

export const MarketSnapshotCreate = MarketSnapshot.omit({
	id: true,
	createdAt: true,	
});

export type MarketSnapshotType = z.infer<typeof MarketSnapshot>;
export type MarketSnapshotCreateType = z.infer<typeof MarketSnapshotCreate>;
