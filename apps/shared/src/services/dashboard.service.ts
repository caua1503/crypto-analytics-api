import { httpErrors } from "@fastify/sensible";
import type { PrismaClientType } from "@repo/shared";
import { RecommendationEnum, type RecommendationType } from "@repo/shared/types/common";
import {
    DashboardResponse,
    type DashboardResponseType,
    type CoinType,
    type KPIsType,
} from "@repo/shared/types/interfaces/dashboard.interface";
import { FearAndGreedIndex } from "../integrations/fear-and-greed.js";

/**
 * Resultado bruto da query SQL de KPIs.
 * Todos os campos agregados são retornados como strings pelo driver pg.
 */
type RawKPIRow = {
    total_assets: bigint;
    analyses_today: bigint;
    last_execution: Date | null;
    engine_active: boolean;
};

/**
 * Resultado bruto da query SQL consolidada de coins.
 * Combina dados de Asset + MarketSnapshot (latest) + Analysis (latest)
 * em uma única query usando DISTINCT ON do PostgreSQL.
 */
type RawCoinRow = {
    // Asset
    public_id: string;
    symbol: string;
    name: string;
    // MarketSnapshot (latest via DISTINCT ON)
    price_usd: string | null;
    high: string | null;
    low: string | null;
    volume_24h_usd: string | null;
    market_cap_usd: string | null;
    btc_dominance: string | null;
    fear_greed: number | null;
    snap_open: string | null;
    snap_close: string | null;
    // Analysis (latest via DISTINCT ON)
    recommendation: RecommendationType | null;
    final_score: string | null;
    sentiment_score: string | null;
    technical_score: string | null;
    macro_score: string | null;
};

export class DashboardService {
    constructor(private prisma: PrismaClientType) { }

    async getDashboard(): Promise<DashboardResponseType> {
        try {
            const [kpis, fearGreedIndex] = await Promise.all([
                this.fetchKPIs(),
                new FearAndGreedIndex().getDashboardSentiment(),
            ]);

            const coins = await this.buildCoins(fearGreedIndex.label);

            return DashboardResponse.parse({
                kpis,
                fearGreedIndex,
                coins,
            });
        } catch (error) {
            console.error("Error building dashboard response:", error);
            throw httpErrors.internalServerError("Failed to build dashboard");
        }
    }

    /**
     * Consolida 4 queries Prisma (count, count, findFirst, findFirst- )
     * em uma única query SQL com subqueries.
     */
    private async fetchKPIs(): Promise<KPIsType> {
        const startOfDay = this.startOfDay().toISOString();

        const rows = await this.prisma.$queryRawUnsafe<RawKPIRow[]>(
            `SELECT
                (SELECT COUNT(*)::bigint FROM "Asset") AS total_assets,
                (SELECT COUNT(*)::bigint FROM "Analysis" WHERE "createdAt" >= $1::timestamptz) AS analyses_today,
                (SELECT "createdAt" FROM "Analysis" ORDER BY "createdAt" DESC LIMIT 1) AS last_execution,
                EXISTS(SELECT 1 FROM "AnalysisEngineVersion" WHERE "isActive" = true) AS engine_active`,
            startOfDay,
        );

        const row = rows[0];

        return {
            totalAssets: Number(row?.total_assets ?? 0),
            analysesToday: Number(row?.analyses_today ?? 0),
            engineStatus: row?.engine_active ? "online" : "offline",
            lastExecution: row?.last_execution?.toISOString(),
        };
    }

    /**
     * Consolida 3 queries separadas (assets + snapshots + analyses) em uma
     * única query SQL usando DISTINCT ON do PostgreSQL + LEFT JOINs.
     *
     * O DISTINCT ON(asset_id) com ORDER BY "createdAt" DESC garante que apenas
     * o registro mais recente por asset seja retornado, substituindo o padrão
     * `distinct` do Prisma que carrega todos os registros e filtra em memória.
     */
    private async buildCoins(globalFearGreedLabel: number): Promise<CoinType[]> {
        const rows = await this.prisma.$queryRawUnsafe<RawCoinRow[]>(
            `SELECT
                a."publicId"       AS public_id,
                a."symbol"         AS symbol,
                a."name"           AS name,
                ms."priceUsd"::text       AS price_usd,
                ms."high"::text           AS high,
                ms."low"::text            AS low,
                ms."volume24hUsd"::text   AS volume_24h_usd,
                ms."marketCapUsd"::text   AS market_cap_usd,
                ms."btcDominance"::text   AS btc_dominance,
                ms."fearGreed"            AS fear_greed,
                ms."open"::text           AS snap_open,
                ms."close"::text          AS snap_close,
                an."recommendation"::text AS recommendation,
                an."finalScore"::text     AS final_score,
                an."sentimentScore"::text AS sentiment_score,
                an."technicalScore"::text AS technical_score,
                an."macroScore"::text     AS macro_score
            FROM "Asset" a
            LEFT JOIN LATERAL (
                SELECT *
                FROM "MarketSnapshot" ms2
                WHERE ms2."assetId" = a."id"
                ORDER BY ms2."createdAt" DESC
                LIMIT 1
            ) ms ON true
            LEFT JOIN LATERAL (
                SELECT *
                FROM "Analysis" an2
                WHERE an2."assetId" = a."id"
                ORDER BY an2."createdAt" DESC
                LIMIT 1
            ) an ON true
            ORDER BY a."createdAt" ASC`,
        );

        return rows.map((row) => {
            const recommendation: RecommendationType =
                (row.recommendation as RecommendationType) ?? RecommendationEnum.HOLD;
            const recommendationScore = row.final_score ?? "5";
            const trendDirection = this.getTrendDirection(row.snap_open, row.snap_close);

            return {
                id: row.public_id,
                symbol: row.symbol,
                name: row.name,
                price: row.price_usd ?? undefined,
                high24h: row.high ?? undefined,
                low24h: row.low ?? undefined,
                volume24h: row.volume_24h_usd ?? undefined,
                marketCap: row.market_cap_usd ?? undefined,
                recommendation,
                recommendationScore,
                categoryScores: {
                    sentiment: row.sentiment_score ?? "5",
                    technical: row.technical_score ?? "5",
                    macro: row.macro_score ?? "5",
                },
                sentiment: {
                    fearGreedIndex: `${row.fear_greed ?? globalFearGreedLabel}`,
                },
                technical: trendDirection ? { trendDirection } : undefined,
                macro: row.btc_dominance ? { btcDominance: row.btc_dominance } : undefined,
            };
        });
    }

    private getTrendDirection(
        open: string | null | undefined,
        close: string | null | undefined,
    ): "up" | "down" | "sideways" | undefined {
        const openValue = this.toNumber(open);
        const closeValue = this.toNumber(close);

        if (openValue === undefined || closeValue === undefined) {
            return undefined;
        }

        if (closeValue > openValue) return "up";
        if (closeValue < openValue) return "down";
        return "sideways";
    }

    private toNumber(value: string | null | undefined): number | undefined {
        if (value === undefined || value === null) {
            return undefined;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    private startOfDay(): Date {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }
}

