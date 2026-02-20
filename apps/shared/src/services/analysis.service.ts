import { httpErrors } from "@fastify/sensible";
import type { PrismaClientType } from "@repo/shared";
import { MacroCalculators, TechnicalCalculators } from "../integrations/calculators.js";

import {
    Analysis,
    type AnalysisType,
    AnalysisCreate,
    type AnalysisCreateType,
    AnalysisEngineVersion,
    AnalysisEngineVersionCreate,
    AnalysisArray,
    AnalysisEngineVersionArray,
    type AnalysisArrayType,
    type AnalysisEngineVersionCreateType,
    type AnalysisEngineVersionType,
    PaginatiomAnalysisEngineVersionParams,
    type PaginatiomAnalysisEngineVersionParamsType,
} from "@repo/shared/types/interfaces/analysis.interface";

import {
    PaginationParams,
    type PaginationParamsType,
} from "@repo/shared/types/interfaces/common.interface";
import { RedisClient, buildCacheKey, redis } from "@repo/shared";
import {
    zDecimal,
    CriterionCategory,
    Recommendation,
    RecommendationEnum,
    CriterionCategoryEnum,
    type RecommendationType,
} from "@repo/shared/types/common";

export class AnalysisService {
    constructor(
        private prisma: PrismaClientType,
        private cache: RedisClient = new RedisClient(redis),
    ) {}

    async create(data: AnalysisCreateType): Promise<AnalysisType> {
        try {
            const validatedData = AnalysisCreate.parse(data);

            const analysis = await this.prisma.analysis.create({ data: validatedData });

            return Analysis.parse(analysis);
        } catch (error) {
            console.error("Error creating analysis:", error);
            throw httpErrors.internalServerError("Failed to create analysis");
        }
    }

    async findAll(
        pagination: PaginationParamsType = PaginationParams.parse({}),
    ): Promise<AnalysisType[]> {
        const cacheKey = buildCacheKey("analyses:findAll:", pagination);

        const cachedAnalyses = await this.cache.get_json<AnalysisType[]>(cacheKey, AnalysisArray);

        if (cachedAnalyses) {
            return cachedAnalyses;
        }
        const { skip, take, order } = pagination;

        const analyses = await this.prisma.analysis.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: order },
        });

        if (!analyses) {
            throw httpErrors.notFound("Analyses not found");
        }

        const { success, data, error } = AnalysisArray.safeParse(analyses);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analyses data");
        }

        return data;
    }

    async findById(id: number): Promise<AnalysisType> {
        const cacheKey = `analyses:findById:${id}`;

        const cachedAnalyses = await this.cache.get_json<AnalysisType>(cacheKey, Analysis);

        if (cachedAnalyses) {
            return cachedAnalyses;
        }

        const analyses = await this.prisma.analysis.findUnique({ where: { id } });

        if (!analyses) {
            throw httpErrors.notFound("Analyses not found");
        }

        const { success, data, error } = Analysis.safeParse(analyses);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analyses data");
        }

        return data;
    }

    async findByAssetId(assetId: number): Promise<AnalysisType[]> {
        const cacheKey = `analyses:findByAssetId:${assetId}`;

        const cachedAnalyses = await this.cache.get_json<AnalysisType[]>(cacheKey, AnalysisArray);

        if (cachedAnalyses) {
            return cachedAnalyses;
        }
        const analyses = await this.prisma.analysis.findMany({ where: { assetId } });

        if (!analyses) {
            throw httpErrors.notFound("Analyses not found");
        }

        const { success, data, error } = AnalysisArray.safeParse(analyses);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analyses data");
        }

        return data;
    }

    async delete(id: number): Promise<void> {
        try {
            this.cache.del(`analyses:findById:${id}`);
            await this.prisma.analysis.delete({ where: { id } });
        } catch (error) {
            console.error(`Error deleting analysis by ID (${id}): ${error}`);
            throw httpErrors.notFound("Analysis not found");
        }
    }

    async update(id: number, data: Partial<AnalysisCreateType>): Promise<AnalysisType> {
        try {
            this.cache.del(`analyses:findById:${id}`);
            const validatedData = AnalysisCreate.partial().parse(data);
            const updatedAnalysis = await this.prisma.analysis.update({
                where: { id },
                data: validatedData,
            });
            return Analysis.parse(updatedAnalysis);
        } catch (error) {
            console.error(`Error updating analysis by ID (${id}): ${error}`);
            throw httpErrors.internalServerError("Failed to update analysis");
        }
    }

    async performAnalysis(assetId: number, snapshotId: number): Promise<AnalysisType> {
        try {
            const engineVersion = await this.prisma.analysisEngineVersion.findFirst({
                where: { isActive: true },
                include: { weights: { include: { criterion: true } } },
                orderBy: { createdAt: "desc" },
            });

            if (!engineVersion) {
                throw httpErrors.internalServerError("No active analysis engine version found");
            }

            const snapshot = await this.prisma.marketSnapshot.findUnique({
                where: { id: snapshotId },
                include: { asset: true },
            });

            if (!snapshot) {
                throw httpErrors.notFound("Market snapshot not found");
            }

            const asset = snapshot.asset;
            const symbol = asset.symbol.toUpperCase();
            const isBtc = symbol === "BTC";
            const isStable = symbol.includes("USD");

            const sevenDaysAgo = new Date(snapshot.createdAt);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const globalHistoricalSnapshot = await this.prisma.marketSnapshot.findFirst({
                where: {
                    createdAt: { lte: sevenDaysAgo },
                    btcDominance: { not: null },
                },
                orderBy: { createdAt: "desc" },
            });

            const assetHistoricalSnapshot = await this.prisma.marketSnapshot.findFirst({
                where: {
                    assetId: asset.id,
                    createdAt: { lte: sevenDaysAgo },
                },
                orderBy: { createdAt: "desc" },
            });

            const macroCalculators = new MacroCalculators();
            let sentimentScore = 5;
            let technicalScore = 5;
            let macroScore = 5;

            for (const weight of engineVersion.weights) {
                const code = weight.criterion.code;
                const importance = Number(weight.importanceWeight);

                if (code === "SENTIMENT_FEAR_GREED" && snapshot.fearGreed !== null) {
                    sentimentScore = isStable
                        ? snapshot.fearGreed / 10
                        : (100 - snapshot.fearGreed) / 10;
                } else if (code === "TECHNICAL_TREND") {
                    if (isStable) {
                        technicalScore = 5;
                    } else {
                        // Buscar histórico para calculos técnicos (ultimos 30 snapshots ~ 1 mes se diario)
                        // Idealmente deveria buscar candles diarios, mas snapshots servem como proxy se frequentes
                        const historicalSnapshots = await this.prisma.marketSnapshot.findMany({
                            where: { assetId: asset.id },
                            orderBy: { createdAt: "desc" },
                            take: 30,
                        });

                        // Reverter para ordem cronologica (antigo -> novo) para calculos
                        const prices = historicalSnapshots
                            .map((s: any) => Number(s.close ?? s.priceUsd))
                            .reverse();

                        let trendScore = 5;
                        let rsiScore = 5;
                        let momentumScore = 5;

                        if (prices.length >= 15) {
                            // Minimo para RSI
                            const techCalc = new TechnicalCalculators();

                            // 1. RSI (Relative Strength Index)
                            try {
                                const rsi = techCalc.RSI(prices, 14);
                                // RSI < 30 -> Oversold (Bullish) -> Score 8-10
                                // RSI > 70 -> Overbought (Bearish) -> Score 0-2
                                // RSI 50 -> Neutral -> Score 5
                                if (rsi <= 30) rsiScore = 8 + ((30 - rsi) / 30) * 2;
                                else if (rsi >= 70) rsiScore = 2 - ((rsi - 70) / 30) * 2;
                            } catch (e) {
                                console.warn(`Error calculating RSI for ${asset.symbol}: ${e}`);
                            }

                            // 2. SMA Trend
                            try {
                                const sma20 = techCalc.SMA(prices, Math.min(20, prices.length));
                                const currentPrice = prices[prices.length - 1];
                                if (currentPrice !== undefined) {
                                    if (currentPrice > sma20)
                                        trendScore = 7; // Bullish trend
                                    else trendScore = 3; // Bearish trend
                                }
                            } catch (e) {
                                console.warn(`Error calculating SMA for ${asset.symbol}: ${e}`);
                            }
                        }

                        // 3. Momentum (7d Price Change) - Logica Antiga mantida como componente
                        if (assetHistoricalSnapshot) {
                            const currentPrice = Number(snapshot.priceUsd);
                            const oldPrice = Number(assetHistoricalSnapshot.priceUsd);
                            const priceChange = (currentPrice - oldPrice) / oldPrice;
                            momentumScore = Math.max(0, Math.min(10, 5 + priceChange * 50));
                        }

                        // Composição Final do Technical Score
                        // 40% RSI, 30% Trend, 30% Momentum

                        // console.log(
                        //     `[Technical] ${asset.symbol}: RSI=${rsiScore.toFixed(2)}, Trend=${trendScore}, Momentum=${momentumScore.toFixed(2)} -> Final=${technicalScore.toFixed(2)}`,
                        // );
                    }
                } else if (code === "MACRO_BTC_DOMINANCE" && snapshot.btcDominance !== null) {
                    if (isStable) {
                        macroScore = 5;
                    } else {
                        const currentDominance = Number(snapshot.btcDominance);
                        const previousDominance = globalHistoricalSnapshot?.btcDominance
                            ? Number(globalHistoricalSnapshot.btcDominance)
                            : currentDominance;

                        const altseasonScore = macroCalculators.calculateAltseasonScore(
                            currentDominance,
                            previousDominance,
                        );

                        if (isBtc) {
                            macroScore = (1 - altseasonScore) * 10;
                        } else {
                            macroScore = altseasonScore * 10;
                        }
                    }

                    // const regime = macroCalculators.getMarketRegime(Number(snapshot.btcDominance));
                    // console.log(
                    //     `[Analysis] ${asset.symbol} - Regime: ${regime}, isStable: ${isStable}, Macro Score: ${macroScore.toFixed(2)}`,
                    // );
                }
            }

            let totalWeightedScore = 0;
            let totalWeight = 0;

            for (const weight of engineVersion.weights) {
                const importance = Number(weight.importanceWeight);
                totalWeight += importance;

                if (weight.criterion.category === CriterionCategoryEnum.SENTIMENT) {
                    totalWeightedScore += sentimentScore * importance;
                } else if (weight.criterion.category === CriterionCategoryEnum.TECHNICAL) {
                    totalWeightedScore += technicalScore * importance;
                } else if (weight.criterion.category === CriterionCategoryEnum.MACRO) {
                    totalWeightedScore += macroScore * importance;
                }
            }

            const finalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 5;

            let recommendation: RecommendationType = RecommendationEnum.HOLD;

            if (finalScore >= 8) recommendation = RecommendationEnum.STRONG_BUY;
            else if (finalScore >= 6) recommendation = RecommendationEnum.BUY;
            else if (finalScore >= 4) recommendation = RecommendationEnum.HOLD;
            else if (finalScore >= 2) recommendation = RecommendationEnum.SELL;
            else recommendation = RecommendationEnum.STRONG_SELL;

            const validatedAnalysisData = AnalysisCreate.parse({
                assetId,
                snapshotId,
                engineVersionId: engineVersion.id,
                sentimentScore,
                technicalScore,
                macroScore,
                finalScore,
                recommendation,
            });

            const analysis = await this.prisma.analysis.create({
                data: validatedAnalysisData,
            });

            return Analysis.parse(analysis);
        } catch (error) {
            console.error("Error performing analysis:", error);
            throw error;
        }
    }
}

export class AnalysisEngineVersionService {
    constructor(
        private prisma: PrismaClientType,
        private cache: RedisClient = new RedisClient(redis),
    ) {}

    async create(data: AnalysisEngineVersionCreateType): Promise<AnalysisEngineVersionType> {
        try {
            const validatedData = AnalysisEngineVersionCreate.parse(data);
            return this.prisma.analysisEngineVersion.create({ data: validatedData });
        } catch (error) {
            console.error("Error creating analysis engine version:", error);
            throw httpErrors.internalServerError("Failed to create analysis engine version");
        }
    }

    async findAll(
        pagination: PaginatiomAnalysisEngineVersionParamsType = PaginatiomAnalysisEngineVersionParams.parse(
            {},
        ),
    ): Promise<AnalysisEngineVersionType[]> {
        const cacheKey = buildCacheKey("analysisEngineVersions:findAll:", pagination);

        const cachedVersions = await this.cache.get_json<AnalysisEngineVersionType[]>(
            cacheKey,
            AnalysisEngineVersionArray,
        );

        if (cachedVersions) {
            return cachedVersions;
        }
        const { skip, take, isActive } = pagination;

        const versions = await this.prisma.analysisEngineVersion.findMany({
            skip: skip,
            take: take,
            orderBy: { createdAt: "desc" },
            where: {
                ...(isActive !== undefined && { isActive }),
            },
        });

        if (!versions) {
            throw httpErrors.notFound("No analysis engine versions found");
        }

        const { success, data, error } = AnalysisEngineVersionArray.safeParse(versions);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analysis engine versions data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async findById(id: number): Promise<AnalysisEngineVersionType> {
        const cacheKey = `analysisEngineVersions:findById:${id}`;

        const cachedVersion = await this.cache.get_json<AnalysisEngineVersionType>(
            cacheKey,
            AnalysisEngineVersion,
        );

        if (cachedVersion) {
            return cachedVersion;
        }

        const version = await this.prisma.analysisEngineVersion.findUnique({ where: { id } });

        if (!version) {
            throw httpErrors.notFound("Analysis engine version not found");
        }

        const { success, data, error } = AnalysisEngineVersion.safeParse(version);

        if (!success) {
            console.error(error);
            throw httpErrors.internalServerError("Invalid analysis engine version data");
        }

        this.cache.set_json(cacheKey, data);

        return data;
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.analysisEngineVersion.delete({ where: { id } });
        } catch (error) {
            console.error(`Error deleting analysis engine version by ID (${id}): ${error}`);
            throw httpErrors.notFound("Analysis engine version not found");
        }
    }

    async update(
        id: number,
        data: Partial<AnalysisEngineVersionCreateType>,
    ): Promise<AnalysisEngineVersionType> {
        try {
            const validatedData = AnalysisEngineVersionCreate.partial().parse(data);
            const updatedVersion = await this.prisma.analysisEngineVersion.update({
                where: { id },
                data: validatedData,
            });
            return AnalysisEngineVersion.parse(updatedVersion);
        } catch (error) {
            console.error(`Error updating analysis engine version by ID (${id}): ${error}`);
            throw httpErrors.internalServerError("Failed to update analysis engine version");
        }
    }
}
