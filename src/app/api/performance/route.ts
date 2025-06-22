import { NextResponse } from 'next/server';
import { getHistoricalData } from '@/services/zerodha';
import { subDays, subMonths } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '1d';

  try {
    const toDate = new Date();
    let fromDate: Date;
    let interval: string;

    // Zerodha instrument token for NIFTY 50 Index
    const instrumentToken = "256265"; 

    switch (timeRange) {
      case '7d':
        fromDate = subDays(toDate, 7);
        interval = 'day';
        break;
      case '1m':
        fromDate = subMonths(toDate, 1);
        interval = 'day';
        break;
      case '3m':
        fromDate = subMonths(toDate, 3);
        interval = 'day';
        break;
      case '1d':
      default:
        fromDate = new Date(toDate.setHours(9, 15, 0, 0));
        interval = '15minute';
        break;
    }

    const data = await getHistoricalData(instrumentToken, interval, fromDate, toDate);
    
    // Map to the format the chart expects: { date: string (ISO), value: number }
    const chartData = data.map(candle => ({
        date: new Date(candle.timestamp).toISOString(),
        value: candle.close,
    }));
    
    return NextResponse.json(chartData);

  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json({ message: 'Error fetching performance data' }, { status: 500 });
  }
}
