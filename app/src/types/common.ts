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


export type RecommendationType = z.infer<typeof Recommendation>;
export type CriterionCategoryType = z.infer<typeof CriterionCategory>;
