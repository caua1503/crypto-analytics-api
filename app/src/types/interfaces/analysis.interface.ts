import { z } from "zod";
import { PaginationParams } from "./common.interface.js";
import { Recommendation } from "../common.js";
import { zDecimal, zDecimaltoString } from "../common.js";

export const Analysis = z.object({
    id: z.number(),
    assetId: z.number(),
    // asset: Asset;

    sentimentScore: zDecimaltoString, //decimal
    technicalScore: zDecimaltoString, //decimal
    macroScore: zDecimaltoString, //decimal
    finalScore: zDecimaltoString, //decimal

    recommendation: Recommendation,

    snapshotId: z.number(),
    // snapshot

    engineVersionId: z.number(),
    // engineVersion

    createdAt: z.coerce.date(),
});

export const AnalysisCreate = Analysis.omit({ id: true, createdAt: true }).extend({
    sentimentScore: zDecimal,
    technicalScore: zDecimal,
    macroScore: zDecimal,
    finalScore: zDecimal,
});

export const AnalysisResponse = Analysis.extend({
    sentimentScore: z.string(),
    technicalScore: z.string(),
    macroScore: z.string(),
    finalScore: z.string(),
});

export const AnalysisEngineVersion = z.object({
    id: z.number(),

    name: z.string(),
    description: z.string().nullable(),
    isActive: z.boolean(),

    createdAt: z.coerce.date(),
});

export const AnalysisEngineVersionCreate = AnalysisEngineVersion.omit({
    id: true,
    createdAt: true,
});

export const PaginatiomAnalysisEngineVersionParams = PaginationParams.extend({
    isActive: z.boolean().optional(),
});

export type AnalysisType = z.infer<typeof Analysis>;
export type AnalysisCreateType = z.infer<typeof AnalysisCreate>;

export type AnalysisEngineVersionType = z.infer<typeof AnalysisEngineVersion>;
export type AnalysisEngineVersionCreateType = z.infer<typeof AnalysisEngineVersionCreate>;

export type PaginatiomAnalysisEngineVersionParamsType = z.infer<
    typeof PaginatiomAnalysisEngineVersionParams
>;
