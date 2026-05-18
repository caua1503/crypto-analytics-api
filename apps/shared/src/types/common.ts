import { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import type { Prisma as UserPrisma } from "../../generated/user-prisma/client.js";

export const Recommendation = z.enum(["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]);
export enum RecommendationEnum {
	STRONG_BUY = "STRONG_BUY",
	BUY = "BUY",
	HOLD = "HOLD",
	SELL = "SELL",
	STRONG_SELL = "STRONG_SELL",
}
export const Period = z.enum(["1H", "4H", "8H", "24H", "7D", "14D", "30D"]);
export const CriterionCategory = z.enum(["SENTIMENT", "TECHNICAL", "MACRO"]);
export enum CriterionCategoryEnum {
	SENTIMENT = "SENTIMENT",
	TECHNICAL = "TECHNICAL",
	MACRO = "MACRO",
}
export enum MarketDataProviderEnum {
	COINGECKO = "COINGECKO",
	COINPAPRIKA = "COINPAPRIKA",
	COINMARKETCAP = "COINMARKETCAP",
}
export enum SourceEnum {
	COINMARKETCAP = "COINMARKETCAP",
	COINGECKO = "COINGECKO",
	COINPAPRIKA = "COINPAPRIKA",
	ALTERNATIVE_ME = "ALTERNATIVE_ME",
}

export const zDecimal = z
	.union([z.string(), z.number(), z.instanceof(Prisma.Decimal), z.undefined()])
	.transform((val) => {
		if (val === undefined) return new Prisma.Decimal(0);
		return new Prisma.Decimal(val);
	});

export const zDecimaltoString = z
	.union([z.string(), z.number(), z.instanceof(Prisma.Decimal), z.undefined()])
	.transform((val) => {
		if (val === undefined) return "0";
		return val.toString();
	});

export const zJson = z
	.json()
	.optional()
	.transform((val) => val as UserPrisma.InputJsonValue);

export const jwt = z.object({
	sub: z.string(),
	exp: z.date(),
	iat: z.date(),
});

export enum ApiKeyMode {
	PROD = "prod",
	DEV = "dev",
}
export const ApiMethod = z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]).default("GET");
export const jwtType = z.jwt();
export type ApiMethodType = z.infer<typeof ApiMethod>;
export type RecommendationType = z.infer<typeof Recommendation>;
export type CriterionCategoryType = z.infer<typeof CriterionCategory>;
