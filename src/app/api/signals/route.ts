import { NextResponse } from 'next/server';
import { RSI, MACD, EMA } from 'technicalindicators';

type Candle = {
    open: number;
    high: number;
    low: number;
    close: number;
    timestamp: number;
};

type Signal = {
  id: number;
  ticker: string;
  signal: 'BUY' | 'SELL';
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
}

// Generates a series of mock price candles for analysis.
function generateMockCandles(count: number): Candle[] {
    const candles: Candle[] = [];
    let close = 22500;
    let timestamp = new Date().getTime();

    for (let i = 0; i < count; i++) {
        const open = close + (Math.random() - 0.5) * 20;
        const high = Math.max(open, close) + Math.random() * 15;
        const low = Math.min(open, close) - Math.random() * 15;
        close = low + Math.random() * (high - low);
        
        candles.unshift({ open, high, low, close, timestamp });
        timestamp -= 15 * 60 * 1000; // 15 min intervals
    }
    return candles;
}

// Applies rule-based logic to generate BUY/SELL signals.
function generateTradeSignals(candles: Candle[]): Signal[] {
    const closes = candles.map(c => c.close);

    const rsiValues = RSI.calculate({ values: closes, period: 14 });
    const macdValues = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    });
    const emaFastValues = EMA.calculate({ period: 12, values: closes });
    const emaSlowValues = EMA.calculate({ period: 26, values: closes });

    const signals: Signal[] = [];
    let signalId = 1;

    const alignOffset = closes.length - macdValues.length;

    // Iterate backwards through recent history to find signals
    for (let i = macdValues.length - 1; i > macdValues.length - 20 && i >= 0; i--) {
        if (signals.length >= 5) break;

        const candleIndex = i + alignOffset;
        const currentCandle = candles[candleIndex];
        
        const rsiIndex = i - (macdValues.length - rsiValues.length);
        const emaFastIndex = i - (macdValues.length - emaFastValues.length);
        const emaSlowIndex = i - (macdValues.length - emaSlowValues.length);

        if (rsiIndex < 0 || emaFastIndex < 0 || emaSlowIndex < 0) continue;

        const currentRsi = rsiValues[rsiIndex];
        const currentMacd = macdValues[i];
        const currentEmaFast = emaFastValues[emaFastIndex];
        const currentEmaSlow = emaSlowValues[emaSlowIndex];

        let generatedSignal: 'BUY' | 'SELL' | null = null;
        let reasoning = '';

        // Buy Signal Logic
        if (currentRsi < 40 && currentMacd.MACD > currentMacd.signal && currentEmaFast > currentEmaSlow) {
            generatedSignal = 'BUY';
            reasoning = `RSI at ${currentRsi.toFixed(1)} suggests it's nearing oversold. A bullish MACD crossover combined with a positive EMA trend indicates potential upward momentum.`;
        }
        
        // Sell Signal Logic
        else if (currentRsi > 60 && currentMacd.MACD < currentMacd.signal && currentEmaFast < currentEmaSlow) {
            generatedSignal = 'SELL';
            reasoning = `RSI at ${currentRsi.toFixed(1)} suggests it's nearing overbought. A bearish MACD crossover with a negative EMA trend indicates potential downward pressure.`;
        }

        if (generatedSignal) {
            signals.push({
                id: signalId++,
                ticker: 'NIFTY_FUT',
                signal: generatedSignal,
                confidence: Math.floor(75 + (generatedSignal === 'BUY' ? (40 - currentRsi) : (currentRsi - 60)) * 1.5),
                entryPrice: currentCandle.close,
                targetPrice: parseFloat((generatedSignal === 'BUY' ? currentCandle.close * 1.007 : currentCandle.close * 0.993).toFixed(2)),
                stopLoss: parseFloat((generatedSignal === 'BUY' ? currentCandle.close * 0.996 : currentCandle.close * 1.004).toFixed(2)),
                reasoning: reasoning,
            });
        }
    }
    
    if (signals.length === 0) {
        return [
            { id: 1, ticker: 'BANKNIFTY_FUT', signal: 'BUY', confidence: 85, entryPrice: 48500.00, targetPrice: 48800.00, stopLoss: 48350.00, reasoning: 'Default signal: Strong market opening and positive global cues.' },
            { id: 2, ticker: 'RELIANCE_FUT', signal: 'SELL', confidence: 78, entryPrice: 2900.00, targetPrice: 2860.00, stopLoss: 2920.00, reasoning: 'Default signal: Approaching a key resistance level with high volume.' },
        ];
    }

    return signals;
}


export async function GET() {
    try {
        const historicalData = generateMockCandles(100);
        const tradeSignals = generateTradeSignals(historicalData);
        return NextResponse.json(tradeSignals);
    } catch (error) {
        console.error("Error generating signals:", error);
        return NextResponse.json({ message: 'Error generating signals' }, { status: 500 });
    }
}
