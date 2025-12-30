import { z } from "zod";

export const Asset = z.object({
	id: z.number(),
	symbol: z.string().min(1),
	name: z.string().min(1),

	// snapshots MarketSnapshot[]
	// analyses  Analysis[]

	createdAt: z.coerce.date(),
});

export const AssetCreate = Asset.omit({
	id: true,
	createdAt: true,
});

export type AssetType = z.infer<typeof Asset>;
export type AssetCreateType = z.infer<typeof AssetCreate>;
