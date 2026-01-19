import { z } from "zod";
import {
    FastifyInstance,
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    FastifyBaseLogger,
} from "fastify";

import { ZodTypeProvider } from "fastify-type-provider-zod";
import { Prisma } from "../../generated/prisma/client.js";

export type FastifyInstanceTyped = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    FastifyBaseLogger,
    ZodTypeProvider
>;

export const Recommendation = z.enum(["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]);
export const CriterionCategory = z.enum(["SENTIMENT", "TECHNICAL", "MACRO"]);
export const enum SourceEnum {
    COINMARKETCAP = "COINMARKETCAP",
    COINGECKO = "COINGECKO",
    COINPAPRIKA = "COINPAPRIKA",
}

export const zDecimal = z
    .union([z.string(), z.number(), z.instanceof(Prisma.Decimal)])
    .transform((val) => new Prisma.Decimal(val));

export const zDecimaltoString = z.instanceof(Prisma.Decimal).transform((val) => val.toString());

export type RecommendationType = z.infer<typeof Recommendation>;
export type CriterionCategoryType = z.infer<typeof CriterionCategory>;
