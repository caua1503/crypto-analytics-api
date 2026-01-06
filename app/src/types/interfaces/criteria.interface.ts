import { z } from "zod";
import { CriterionCategory } from "../common.js";
import { zDecimal, zDecimaltoString } from "../common.js";

export const Criterion = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    category: CriterionCategory,

    // weights: CriterionWeight[]

    // createdAt: z.coerce.date(),
});

export const CriterionCreate = Criterion.omit({ id: true });

export const CriterionWeight = z.object({
    id: z.number(),
    engineVersionId: z.number(),
    criterionId: z.number(),

    importanceWeight: zDecimaltoString, //decimal
    scoreMin: z.number(),
    scoreMax: z.number(),
});

export const CriterionWeightCreate = CriterionWeight.omit({ id: true }).extend(
    { importanceWeight: zDecimal }, //decimal
);

export type CriterionType = z.infer<typeof Criterion>;
export type CriterionCreateType = z.infer<typeof CriterionCreate>;

export type CriterionWeightType = z.infer<typeof CriterionWeight>;
export type CriterionWeightCreateType = z.infer<typeof CriterionWeightCreate>;
