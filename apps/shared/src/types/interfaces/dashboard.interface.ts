import { z } from "zod";
import { Recommendation } from "../common.js";

const DashboardCategory = z.enum(["sentiment", "technical", "macro"]);

export const KPIs = z.object({
    totalAssets: z.number(),
    analysesToday: z.number(),
    upPercent: z.number().optional(),
    downPercent: z.number().optional(),
    engineStatus: z.enum(["online", "offline"]).optional(),
    lastExecution: z.string().optional(),
});

export const FearGreedIndex = z.object({
    value: z.number(),
    label: z.number().int().min(0).max(10).optional(),
    marketSentiment: z
        .enum(["Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"])
        .optional(),
});

export const CategoryScores = z.object({
    sentiment: z.string(),
    technical: z.string(),
    macro: z.string(),
});

export const Sentiment = z.object({
    fearGreedIndex: z.string(),
    socialMentions: z.string().optional(),
    socialTrend: z.enum(["rising", "falling", "stable"]).optional(),
    newsSentiment: z.enum(["positive", "neutral", "negative"]).optional(),
    contrarianSignal: z.boolean().optional(),
});

export const Indicator = z.object({
    name: z.string(),
    value: z.string(),
    signal: Recommendation,
    category: DashboardCategory,
});

export const Technical = z.object({
    indicators: z.array(Indicator).optional(),
    supportLevel: z.string().optional(),
    resistanceLevel: z.string().optional(),
    trendStrength: z.string().optional(),
    trendDirection: z.enum(["up", "down", "sideways"]).optional(),
});

export const Macro = z.object({
    btcDominance: z.string(),
    altseasonIndex: z.string().optional(),
    // sp500Correlation: z.number(),
    // dxyCorrelation: z.number(),
    // inflationImpact: z.enum(["positive", "neutral", "negative"]),
});

export const HistoryPoint = z.object({
    date: z.string(),
    score: z.string(),
    signal: Recommendation,
});

export const Coin = z.object({
    id: z.string(),
    symbol: z.string(),
    name: z.string(),
    price: z.string().optional(),
    change24h: z.string().optional(),
    high24h: z.string().optional(),
    low24h: z.string().optional(),
    volume24h: z.string().optional(),
    marketCap: z.string().optional(),
    category: z.string().optional(),
    recommendation: Recommendation,
    recommendationScore: z.string(),
    categoryScores: CategoryScores,
    sentiment: Sentiment,
    technical: Technical.optional(),
    macro: Macro.optional(),
    history: z.array(HistoryPoint).optional(),
});

export const Insight = z.object({
    id: z.string(),
    coinId: z.string(),
    coinSymbol: z.string(),
    title: z.string(),
    description: z.string(),
    impact: z.enum(["low", "medium", "high"]).optional(),
    category: DashboardCategory.optional(),
    timestamp: z.string().optional(),
});

export const DashboardResponse = z.object({
    kpis: KPIs,
    fearGreedIndex: FearGreedIndex,
    coins: z.array(Coin),
    insights: z.array(Insight).optional(),
});

export type KPIsType = z.infer<typeof KPIs>;
export type FearGreedIndexType = z.infer<typeof FearGreedIndex>;
export type CategoryScoresType = z.infer<typeof CategoryScores>;
export type SentimentType = z.infer<typeof Sentiment>;
export type IndicatorType = z.infer<typeof Indicator>;
export type TechnicalType = z.infer<typeof Technical>;
export type MacroType = z.infer<typeof Macro>;
export type HistoryPointType = z.infer<typeof HistoryPoint>;
export type RecommendationType = z.infer<typeof Recommendation>;
export type CoinType = z.infer<typeof Coin>;
export type InsightType = z.infer<typeof Insight>;
export type DashboardResponseType = z.infer<typeof DashboardResponse>;
