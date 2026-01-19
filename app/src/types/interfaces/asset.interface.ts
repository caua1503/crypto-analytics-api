import { z } from "zod";

export const Asset = z.object({
    id: z.number(),
    symbol: z.string().min(1).toUpperCase(),
    name: z
        .string()
        .min(1)
        .transform((str) => str.charAt(0).toUpperCase() + str.slice(1)),
    // snapshots MarketSnapshot[]
    // analyses  Analysis[]

    createdAt: z.coerce.date(),
});

export const AssetCreate = Asset.omit({
    id: true,
    createdAt: true,
});

export const AssetArray = z.array(Asset);

export type AssetType = z.infer<typeof Asset>;
export type AssetCreateType = z.infer<typeof AssetCreate>;
