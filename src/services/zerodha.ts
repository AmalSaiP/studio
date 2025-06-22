'use server';

import { KiteConnect } from 'kiteconnect';

// --- IMPORTANT ---
// THIS IS A PLACEHOLDER IMPLEMENTATION.
// You must replace these values with your actual keys and handle the
// daily access token generation flow as required by Zerodha.

// These values can be stored in environment variables for better security.
const API_KEY = "9mhowz0mpnfltqpm";
const API_SECRET = "qxoqq4ew35qv4xsklg5zk2zvudcfn9zg";

// NOTE: The access_token must be generated manually each morning via the Kite Connect flow.
const ACCESS_TOKEN = "YOUR_MANUALLY_GENERATED_ACCESS_TOKEN";

let kc: KiteConnect;

try {
  kc = new KiteConnect({
    api_key: API_KEY,
  });

  if (ACCESS_TOKEN && ACCESS_TOKEN !== "YOUR_MANUALLY_GENERATED_ACCESS_TOKEN") {
    kc.setAccessToken(ACCESS_TOKEN);
  }
  
  kc.setSessionExpiryHook(() => {
    console.warn("Kite Connect session expired. Please generate a new access token.");
    // Here you would ideally trigger a re-login flow or notify the user.
  });

} catch (error) {
    console.error("Failed to initialize KiteConnect:", error);
}

// Data format expected by the application
type AppCandle = {
    open: number;
    high: number;
    low: number;
    close: number;
    timestamp: number;
};

/**
 * Fetches historical data from Zerodha.
 * @param instrumentToken The token for the instrument (e.g., "256265" for NIFTY 50).
 * @param interval The candle interval (e.g., "15minute", "day").
 * @param from The start date for the data.
 * @param to The end date for the data.
 * @returns A promise that resolves to an array of candles in the application's format.
 */
export async function getHistoricalData(
  instrumentToken: string,
  interval: string,
  from: Date,
  to: Date
): Promise<AppCandle[]> {
  if (!kc || !ACCESS_TOKEN || ACCESS_TOKEN === "YOUR_MANUALLY_GENERATED_ACCESS_TOKEN") {
      console.warn("Zerodha API not configured. Returning empty data.");
      return [];
  }

  try {
    const data = await kc.getHistoricalData(instrumentToken, interval, from, to);
    // Map Zerodha's response to the application's expected format
    return data.map((d: any) => ({
      timestamp: new Date(d.date).getTime(),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
  } catch (error) {
    console.error(`Error fetching historical data for token ${instrumentToken}:`, error);
    // Depending on requirements, you might want to re-throw or return a specific error state.
    return [];
  }
}

/**
 * Fetches the latest live quote for an instrument.
 * @param instrument The instrument string (e.g., "NFO:NIFTY24JULOFUT").
 * @returns A promise that resolves to the quote data.
 */
export async function getQuote(instrument: string): Promise<any> {
  if (!kc || !ACCESS_TOKEN || ACCESS_TOKEN === "YOUR_MANUALLY_GENERATED_ACCESS_TOKEN") {
    console.warn("Zerodha API not configured. Returning empty quote.");
    return {};
  }
  
  try {
    // Zerodha's getQuote takes an array of instruments
    const quotes = await kc.getQuote([instrument]);
    return quotes[instrument];
  } catch (error) {
    console.error(`Error fetching quote for instrument ${instrument}:`, error);
    return {};
  }
}
