export class TechnicalCalculators {
    RSI(prices: number[], period: number = 14): number {
        if (prices.length < period + 1) {
            throw new Error("Not enough data points to calculate RSI");
        }

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }

        let averageGain = gains / period;
        let averageLoss = losses / period;

        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];

            if (change > 0) {
                averageGain = (averageGain * (period - 1) + change) / period;
                averageLoss = (averageLoss * (period - 1)) / period;
            } else {
                averageGain = (averageGain * (period - 1)) / period;
                averageLoss = (averageLoss * (period - 1) - change) / period;
            }
        }

        if (averageLoss === 0) return 100;
        if (averageGain === 0) return 0;

        const rs = averageGain / averageLoss;
        return 100 - 100 / (1 + rs);
    }

    SMA(prices: number[], period: number = 14): number {
        if (prices.length < period) {
            throw new Error("Not enough data points to calculate SMA");
        }

        let sum = 0;
        for (let i = prices.length - period; i < prices.length; i++) {
            sum += prices[i];
        }

        return sum / period;
    }

    EMA(prices: number[], period: number = 14): number {
        if (prices.length < period) {
            throw new Error("Not enough data points to calculate EMA");
        }

        const multiplier = 2 / (period + 1);

        let ema = 0;
        for (let i = 0; i < period; i++) {
            ema += prices[i];
        }
        ema /= period;

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    MACD(
        prices: number[],
        fastPeriod: number = 12,
        slowPeriod: number = 26,
        signalPeriod: number = 9,
    ): { macd: number; signal: number; histogram: number } {
        if (prices.length < slowPeriod + signalPeriod) {
            throw new Error("Not enough data points to calculate MACD");
        }

        // EMA rápida e lenta (últimos valores)
        const fastEMA = this.EMA(prices, fastPeriod);
        const slowEMA = this.EMA(prices, slowPeriod);

        const macdLine = fastEMA - slowEMA;

        // Série MACD para cálculo da linha de sinal
        const macdSeries: number[] = [];
        for (let i = slowPeriod - 1; i < prices.length; i++) {
            const fast = this.EMA(prices.slice(0, i + 1), fastPeriod);
            const slow = this.EMA(prices.slice(0, i + 1), slowPeriod);
            macdSeries.push(fast - slow);
        }

        const signalLine = this.EMA(macdSeries, signalPeriod);
        const histogram = macdLine - signalLine;

        return {
            macd: macdLine,
            signal: signalLine,
            histogram,
        };
    }
}

export class SentimentCalculators {
    // Placeholder for sentiment calculation methods
}

export class MacroCalculators {
    getMarketRegime(
        btcDominance: number,
    ): "RISK_OFF" | "BTC_LEAD" | "TRANSITION" | "ALTSEASON_START" | "ALTSEASON_EUPHORIA" {
        if (btcDominance > 55) return "RISK_OFF";
        if (btcDominance > 52) return "BTC_LEAD";
        if (btcDominance > 48) return "TRANSITION";
        if (btcDominance > 42) return "ALTSEASON_START";
        return "ALTSEASON_EUPHORIA";
    }

    /**
     * Calcula o score contínuo de Altseason (0-1).
     * @param currentBtcDominance Dominância atual (%)
     * @param previousBtcDominance Dominância anterior (ex: 7 dias atrás) (%)
     */
    calculateAltseasonScore(currentBtcDominance: number, previousBtcDominance: number): number {
        const deltaBtcD = (currentBtcDominance - previousBtcDominance) / previousBtcDominance;
        const btcDDecimal = currentBtcDominance / 100;

        const dominanceFactor = Math.max(0, Math.min(1, (0.55 - btcDDecimal) / (0.55 - 0.42)));
        const trendFactor = Math.max(0, Math.min(1, -deltaBtcD / 0.05));

        return dominanceFactor * trendFactor;
    }

    /**
     * Estima o retorno esperado das altcoins.
     * @param deltaBtcDominance Variação da dominância (ex: -0.05 para -5%)
     * @param k Coeficiente de alavancagem (Top 10: 1.5-3.0, Mid: 3.0-5.0, Small: 5.0-8.0)
     */
    calculateExpectedAltReturn(deltaBtcDominance: number, k: number): number {
        return -k * deltaBtcDominance;
    }
}
