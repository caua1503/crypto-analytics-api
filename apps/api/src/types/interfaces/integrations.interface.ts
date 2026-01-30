import { z } from "zod";
import { Period } from "../common.js";

export const ApiMarketSnapshotSchema = z.object({
    assetSymbol: z.string().min(1), // Símbolo do ativo (BTC, ETH, SOL)

    priceUsd: z.coerce.number().positive(), // Preço atual em USD
    volume24hUsd: z.coerce.number().nonnegative(), // Volume negociado nas últimas 24h
    marketCapUsd: z.coerce.number().nonnegative().optional(), // Capitalização de mercado

    source: z.string(), // Fonte dos dados (CoinGecko, CoinMarketCap, Alternative.me, etc)
    fetchedAt: z.date(), // Momento da coleta
    cachedUntil: z.date(), // Validade do cache (TTL)
});

export const ApiSentimentDataSchema = z.object({
    fearGreedIndex: z.coerce.number().min(0).max(100).optional(), // Índice bruto de medo/ganância
    sentimentScore: z.coerce.number().min(0).max(10).optional(), // Score normalizado (0–10)

    source: z.string(), // Fonte do indicador
    timestamp: z.date(), // Momento da medição
});

export const ApiTechnicalIndicatorsSchema = z.object({
    rsi: z.number().optional(), // Relative Strength Index
    ema: z.number().optional(), // Exponential Moving Average
    sma: z.number().optional(), // Simple Moving Average
    macd: z.number().optional(), // Moving Average Convergence Divergence
});

export const ApiTechnicalDataSchema = z.object({
    indicators: ApiTechnicalIndicatorsSchema, // Conjunto de indicadores técnicos

    timeframe: z.string(), // Janela temporal (1h, 4h, 1d)
    source: z.string(), // Fonte dos dados técnicos
    timestamp: z.date(), // Momento do cálculo
});

export const ApiMacroDataSchema = z.object({
    btcDominance: z.number().min(0).max(100).optional(), // Dominância do Bitcoin (%)
    totalMarketCapUsd: z.number().positive().optional(), // Market cap total do mercado
    liquidityIndex: z.number().optional(), // Indicador agregado de liquidez

    source: z.string(), // Fonte dos dados macro
    timestamp: z.date(), // Momento da medição
});

export const ApiMacroDataSchemaDTO = ApiMacroDataSchema.extend({
    btcDominance: z
        .number()
        .min(0)
        .max(100)
        .optional()
        .transform((val) => (val !== undefined ? Number(val.toFixed(2)) : undefined)),

    totalMarketCapUsd: z
        .number()
        .positive()
        .optional()
        .transform((val) => (val !== undefined ? Math.round(val) : undefined)),

    liquidityIndex: z
        .number()
        .optional()
        .transform((val) => (val !== undefined ? Number(val.toFixed(4)) : undefined)),
});

export const ApiAnalysisInputSchema = z.object({
    assetSymbol: z.string().min(1), // Ativo analisado

    marketSnapshot: ApiMarketSnapshotSchema, // Snapshot de mercado obrigatório

    sentiment: ApiSentimentDataSchema.optional(), // Dados de sentimento
    technical: ApiTechnicalDataSchema.optional(), // Dados técnicos
    macro: ApiMacroDataSchema.optional(), // Dados macroeconômicos

    engineVersion: z.string(), // Versão do motor de análise
    generatedAt: z.date(), // Momento da geração da análise
});

export const ApiOHLCSchema = z.object({
    open: z.coerce.number(),
    high: z.coerce.number(),
    low: z.coerce.number(),
    close: z.coerce.number(),
    period: Period,
})

export type ApiMarketSnapshot = z.infer<typeof ApiMarketSnapshotSchema>;
export type ApiSentimentData = z.infer<typeof ApiSentimentDataSchema>;
export type ApiMacroData = z.infer<typeof ApiMacroDataSchema>;
export type ApiTechnicalData = z.infer<typeof ApiTechnicalDataSchema>;
export type ApiAnalysisInput = z.infer<typeof ApiAnalysisInputSchema>;
export type ApiTechnicalIndicators = z.infer<typeof ApiTechnicalIndicatorsSchema>;
export type ApiOHLC= z.infer<typeof ApiOHLCSchema>