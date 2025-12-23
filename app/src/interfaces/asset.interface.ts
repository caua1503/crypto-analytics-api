import { z } from "zod";

export const Asset = z.object({
    id: z.number(),
    symbol: z.string(),
    name: z.string(),

    // snapshots MarketSnapshot[]
    // analyses  Analysis[]
    
    createdAt: z.date(),
})

export const AssetCreate = z.object({
        symbol: z.string().min(1),
        name: z.string().min(1),
});


// export type AssetCreateType = z.infer<typeof AssetCreate>;
