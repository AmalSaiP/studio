
'use server';

// This is a mock service to simulate Zerodha Kite Connect API.
// In a real application, you would use the Kite Connect client here.

const MOCK_API_LATENCY = 500; // 0.5 second

// Check if API keys are set (for simulation purposes)
if (!process.env.ZERODHA_API_KEY || !process.env.ZERODHA_API_SECRET) {
  console.warn("Zerodha API key/secret not found in .env. Using mock service without auth check.");
}

const tradeSignals = [
    {
      id: 1,
      ticker: 'NIFTY 24AUGFUT',
      signal: 'BUY',
      confidence: 88,
      entryPrice: 22550.00,
      targetPrice: 22750.00,
      stopLoss: 22450.00,
      reasoning: 'Bullish Engulfing pattern formed on the 1-hour chart, confirmed by RSI crossing above 50. Entry is triggered on a break of the pattern\'s high. Target is set at the next major resistance level. Stop-loss is placed just below the pattern\'s low.',
    },
    {
      id: 2,
      ticker: 'BANKNIFTY 24AUG48000CE',
      signal: 'BUY',
      confidence: 92,
      entryPrice: 350.50,
      targetPrice: 550.00,
      stopLoss: 250.00,
      reasoning: 'Significant open interest buildup and positive delta at this strike price suggest strong upward potential. Random Forest model identifies a pattern of pre-expiry gamma squeeze, making this a high-probability trade.',
    },
    {
      id: 3,
      ticker: 'RELIANCE',
      signal: 'SELL',
      confidence: 78,
      entryPrice: 2880.00,
      targetPrice: 2800.00,
      stopLoss: 2920.00,
      reasoning: 'Stock is overbought with RSI above 75 on the daily chart. XGBoost model flags a potential reversal pattern (Evening Star) after hitting a key Fibonacci resistance level. The sell signal indicates a short-term correction is likely.',
    },
    {
      id: 4,
      ticker: 'TCS',
      signal: 'BUY',
      confidence: 81,
      entryPrice: 3850.00,
      targetPrice: 4000.00,
      stopLoss: 3790.00,
      reasoning: 'Breakout above the 50-day moving average on high volume, indicating strong institutional interest. LSTM model confirms a bullish trend continuation with a projected upside target of ₹4000.',
    },
];

// --- MOCK DATA GENERATION ---

function generateIntradaySeries(startDate: Date, numPoints: number, intervalMinutes: number) {
    const data = [];
    let currentDate = new Date(startDate);
    let currentValue = 22500 + (Math.random() - 0.5) * 50;

    for (let i = 0; i < numPoints; i++) {
        data.push({
            date: currentDate.toISOString(),
            value: parseFloat(currentValue.toFixed(2)),
        });
        currentValue += (Math.random() - 0.5) * 20;
        currentDate = new Date(currentDate.getTime() + intervalMinutes * 60000);
    }
    return data;
}

function generateDailySeries(endDate: Date, numDays: number) {
    const data = [];
    let currentDate = new Date(endDate);
    let currentValue = 22500 + (Math.random() - 0.5) * 500;

    for (let i = 0; i < numDays; i++) {
        data.unshift({
            date: new Date(currentDate.setDate(currentDate.getDate() - 1)).toISOString(),
            value: parseFloat(currentValue.toFixed(2)),
        });
        currentValue += (Math.random() - 0.5) * 150;
    }
    return data;
}

function generateWeeklySeries(endDate: Date, numWeeks: number) {
    const data = [];
    let currentDate = new Date(endDate);
     let currentValue = 22000 + (Math.random() - 0.5) * 1000;

    for (let i = 0; i < numWeeks; i++) {
        data.unshift({
            date: new Date(currentDate.setDate(currentDate.getDate() - 7)).toISOString(),
            value: parseFloat(currentValue.toFixed(2)),
        });
        currentValue += (Math.random() - 0.5) * 300;
    }
    return data;
}


// --- API FUNCTIONS ---

export async function getPerformanceData(instrument: string, timeRange: string) {
    console.log(`Fetching performance data for ${instrument} (${timeRange})`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY));
    
    const now = new Date();
    switch (timeRange) {
        case '7d':
            return generateDailySeries(now, 7);
        case '1m':
            return generateDailySeries(now, 30);
        case '3m':
            return generateWeeklySeries(now, 12);
        case '1d':
        default:
            const marketOpen = new Date(now.setHours(9, 15, 0, 0));
            return generateIntradaySeries(marketOpen, 25, 15); // 25 points, 15 min interval
    }
}

export async function getLatestTick(instrument: string, currentValue: number) {
    console.log(`Fetching latest tick for ${instrument}`);
    // No latency for ticks to feel "live"
    const change = (Math.random() - 0.5) * 5;
    const newValue = currentValue + change;
    return {
        date: new Date().toISOString(),
        value: parseFloat(newValue.toFixed(2)),
    }
}

export async function getTradeSignals() {
    console.log('Fetching trade signals');
    await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY / 2));
    return tradeSignals;
}

export async function runBacktest(model: string, dateRange: { from: Date; to: Date }) {
    console.log(`Running backtest for model ${model} from ${dateRange.from} to ${dateRange.to}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY * 3));
    const pnl = Math.floor(Math.random() * 20000) - 5000;
    const winRate = Math.random() * (0.8 - 0.4) + 0.4;
    return { pnl, winRate };
}

export async function getOptionsChainAnalysis(instrument: string) {
    console.log(`Fetching options chain analysis for ${instrument}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY));
    return "Overall market sentiment appears cautiously bullish based on Put-Call Ratio (PCR) of 1.2. Significant open interest is concentrated at the 22500 CE and 22000 PE strikes, suggesting a potential trading range. Implied Volatility (IV) is relatively low, which could mean options are cheap, but a sudden spike in volatility could negatively impact short positions. A Bull Call Spread could be considered, buying the 22200 CE and selling the 22500 CE to capitalize on the expected range-bound upward movement while limiting risk.";
}
