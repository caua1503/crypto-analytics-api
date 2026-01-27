import { z } from "zod";

export const Asset = z.object({
    id: z.number(),
    public_Id: z.uuid(),
    symbol: z.string().min(1).toUpperCase(),
    name: z
        .string()
        .min(1)
        .transform((str) => str.charAt(0).toUpperCase() + str.slice(1)),

    createdAt: z.coerce.date(),
});

export const AssetExtras = Asset.extend({
    extras: z.json().default({}),
});

export const AssetCreate = Asset.omit({
    id: true,
    createdAt: true,
    public_Id: true,
});

export const AssetPublic = Asset.omit({
    id: true,
    createdAt: true,
});    

export const AssetPublicArray = z.array(AssetPublic);
export const AssetArray = z.array(Asset);
export const AssetExtrasArray = z.array(AssetExtras);

export const AssetResponse = z.object({
    meta: z.object({
        total: z.number(),
    }),
    data: AssetArray,
});

export const AssetPublicResponse = AssetResponse.extend({
    data: AssetPublicArray,
});

export type AssetType = z.infer<typeof Asset>;
export type AssetExtrasType = z.infer<typeof AssetExtras>;
export type AssetCreateType = z.infer<typeof AssetCreate>;
export type AssetResponseType = z.infer<typeof AssetResponse>;
export type AssetPublicType = z.infer<typeof AssetPublic>;
export type AssetPublicResponseType = z.infer<typeof AssetPublicResponse>;
