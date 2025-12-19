import { z } from "zod";

export interface Asset {
    id: number;
    symbol: string;
    name: string;

    // snapshots MarketSnapshot[]
    // analyses  Analysis[]
    
    createdAt: Date
}

export const AssetCreate = z.object({
        symbol: z.string().min(1),
        name: z.string().min(1),
});


// export type AssetCreateType = z.infer<typeof AssetCreate>;
