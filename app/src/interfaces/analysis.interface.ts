import { z } from "zod";
import { PaginationParams } from "./common.interface.js";

export const Analysis = z.object({
    id: z.number(),
    assetId: z.number(),
    // asset: Asset;

    sentimentScore: z.number(), //decimal
    technicalScore: z.number(), //decimal
    macroScore: z.number(), //decimal
    finalScore: z.number(), //decimal

    // recommendation

    snapshotId: z.number(),
    // snapshot

    engineVersionId: z.number(),
    // engineVersion

    createdAt: z.date(),
})

export const AnalysisCreate = z.object({
    assetId: z.number(),
    // asset: Asset;

    sentimentScore: z.number(), //decimal
    technicalScore: z.number(), //decimal
    macroScore: z.number(), //decimal
    finalScore: z.number(), //decimal

    // recommendation

    snapshotId: z.number(),
    // snapshot

    engineVersionId: z.number(),
    // engineVersion
})

export const AnalysisEngineVersion = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().optional(),
    isActive: z.boolean(),

    createdAt: z.date(),

})

export const AnalysisEngineVersionCreate = z.object({
    name: z.string(),
    description: z.string().optional(),
    isActive: z.boolean(),
})

export const PaginatiomAnalysisEngineVersionParams = PaginationParams.extend({
    isActive: z.boolean().optional(),
});

export type AnalysisType = z.infer<typeof Analysis>;
export type AnalysisCreateType = z.infer<typeof AnalysisCreate>;

export type AnalysisEngineVersionType = z.infer<typeof AnalysisEngineVersion>;
export type AnalysisEngineVersionCreateType = z.infer<typeof AnalysisEngineVersionCreate>;

export type PaginatiomAnalysisEngineVersionParamsType = z.infer<typeof PaginatiomAnalysisEngineVersionParams>;