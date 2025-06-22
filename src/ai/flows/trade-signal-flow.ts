
'use server';
/**
 * @fileOverview A trade signal generation AI flow.
 *
 * - generateTradeSignal: A function that generates a detailed trade signal.
 * - MarketData: The input type for the generateTradeSignal function.
 * - TradeSignal: The return type for the generateTradeSignal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the market data
const MarketDataSchema = z.object({
  ticker: z.string().describe('The stock or futures ticker symbol.'),
  currentPrice: z.number().describe('The current market price of the instrument.'),
  volume: z.number().describe('The trading volume for the current period.'),
  rsi: z.number().describe('The Relative Strength Index (RSI) value, typically from 0 to 100.'),
  macd: z.number().describe('The Moving Average Convergence Divergence (MACD) value.'),
  movingAverage50: z.number().describe('The 50-period simple moving average.'),
  movingAverage200: z.number().describe('The 200-period simple moving average.'),
});
export type MarketData = z.infer<typeof MarketDataSchema>;

// Define the output schema for the generated trade signal
const TradeSignalSchema = z.object({
  ticker: z.string().describe('The ticker symbol for the signal.'),
  signal: z.enum(['BUY', 'SELL', 'HOLD']).describe("The recommended action: 'BUY', 'SELL', or 'HOLD'."),
  confidence: z.number().min(0).max(100).describe('The confidence level of the signal, from 0 to 100.'),
  entryPrice: z.number().describe('The recommended price to enter the trade.'),
  targetPrice: z.number().describe('The price target for taking profit.'),
  stopLoss: z.number().describe('The price at which to exit the trade to limit losses.'),
  reasoning: z.string().describe('A detailed, expert-level explanation for the trade signal, referencing the provided market data points.'),
});
export type TradeSignal = z.infer<typeof TradeSignalSchema>;


export async function generateTradeSignal(input: MarketData): Promise<TradeSignal> {
  return tradeSignalFlow(input);
}


const tradeSignalPrompt = ai.definePrompt({
  name: 'tradeSignalPrompt',
  input: {schema: MarketDataSchema},
  output: {schema: TradeSignalSchema},
  prompt: `
    You are a professional quantitative analyst for a high-frequency trading firm. Your task is to analyze the provided market data for a specific instrument and generate a high-conviction trade signal.

    Analyze the following data points:
    - Ticker: {{{ticker}}}
    - Current Price: {{{currentPrice}}}
    - Volume: {{{volume}}}
    - RSI: {{{rsi}}}
    - MACD: {{{macd}}}
    - 50-day MA: {{{movingAverage50}}}
    - 200-day MA: {{{movingAverage200}}}

    Based on your analysis, determine whether to issue a 'BUY', 'SELL', or 'HOLD' signal.
    - A 'BUY' signal should be issued for bullish setups (e.g., RSI oversold, golden cross, bullish MACD).
    - A 'SELL' signal should be issued for bearish setups (e.g., RSI overbought, death cross, bearish MACD).
    - A 'HOLD' signal should be issued when indicators are conflicting or neutral.

    For BUY or SELL signals, you must provide:
    1.  A confidence score (0-100) based on how many indicators align.
    2.  A precise entryPrice, slightly better than the current price.
    3.  A realistic targetPrice based on a typical risk/reward ratio of 1:2.
    4.  A tight stopLoss to manage risk.
    5.  A concise but expert-level reasoning, explicitly mentioning the indicators that support your decision. For example, "Bullish signal due to RSI crossing 30 and price bouncing off the 50-day MA."

    If the signal is 'HOLD', set confidence to a value below 50 and set entry, target, and stop loss to 0. The reasoning should explain the market ambiguity.

    Generate the trade signal in the specified JSON format.
  `,
});

const tradeSignalFlow = ai.defineFlow(
  {
    name: 'tradeSignalFlow',
    inputSchema: MarketDataSchema,
    outputSchema: TradeSignalSchema,
  },
  async (input) => {
    const {output} = await tradeSignalPrompt(input);
    if (!output) {
      throw new Error("The AI model failed to generate a valid trade signal.");
    }
    return output;
  }
);
