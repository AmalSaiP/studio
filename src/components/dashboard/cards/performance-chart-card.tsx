
"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CandlestickChart } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// --- MOCK DATA GENERATION ---

// Generates a series for a trading day starting at 9:15 AM.
function generateIntradaySeries(baseValue: number, numPoints: number, intervalMinutes: number) {
    const data = [];
    const marketOpen = new Date();
    marketOpen.setHours(9, 15, 0, 0);

    let currentDate = new Date(marketOpen);
    let currentValue = baseValue;

    for (let i = 0; i < numPoints; i++) {
        data.push({
            date: currentDate.toISOString(),
            value: parseFloat(currentValue.toFixed(2)),
        });
        currentValue += (Math.random() - 0.5) * 20; // Simulate price fluctuation
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

async function getPerformanceData(instrument: string, timeRange: string) {
    console.log(`Fetching performance data for ${instrument} (${timeRange})`);
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
            const marketOpen = new Date();
            marketOpen.setHours(9, 15, 0, 0);
            const marketClose = new Date();
            marketClose.setHours(15, 30, 0, 0);

            // If market is closed for the day, show the full day's data
            if (now > marketClose) {
                return generateIntradaySeries(22500, 26, 15); // 26 points for a full 9:15-15:30 day at 15min intervals
            }
            // If market is not yet open, show a single point at open time
            if (now < marketOpen) {
                return [{ date: marketOpen.toISOString(), value: 22500 }];
            }
            // If market is open, generate data up to the current time
            const minutesSinceOpen = (now.getTime() - marketOpen.getTime()) / 60000;
            const pointsToGenerate = Math.floor(minutesSinceOpen / 15) + 1;
            return generateIntradaySeries(22500, pointsToGenerate, 15);
    }
}

async function getLatestTick(instrument: string, currentValue: number) {
    console.log(`Fetching latest tick for ${instrument}`);
    
    const now = new Date();
    const marketOpenTime = new Date().setHours(9, 15, 0, 0);
    const marketCloseTime = new Date().setHours(15, 30, 0, 0);
    
    // If market is closed, don't generate a new value
    if (now.getTime() < marketOpenTime || now.getTime() > marketCloseTime) {
         return {
            date: new Date().toISOString(),
            value: currentValue
        };
    }

    // No latency for ticks to feel "live"
    const change = (Math.random() - 0.5) * 5;
    const newValue = currentValue + change;
    return {
        date: new Date().toISOString(),
        value: parseFloat(newValue.toFixed(2)),
    }
}


const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
}

type PerformanceData = {
    date: string;
    value: number;
}

const axisFormatters: Record<string, (value: any) => string> = {
    '1d': (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    '7d': (value) => new Date(value).toLocaleDateString([], { weekday: 'short' }),
    '1m': (value) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    '3m': (value) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' }),
};

const tooltipLabelFormatters: Record<string, (label: any) => string> = {
    '1d': (label) => new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    '7d': (label) => new Date(label).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }),
    '1m': (label) => new Date(label).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }),
    '3m': (label) => new Date(label).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }),
};

export function PerformanceChartCard() {
  const [data, setData] = React.useState<PerformanceData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState("1d")

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const result = await getPerformanceData("NIFTY 50", timeRange)
      setData(result)
      setLoading(false)
    }
    fetchData()
  }, [timeRange])

  // Live updates for 1d view
  React.useEffect(() => {
    if (timeRange !== '1d' || loading || data.length === 0) {
      return
    }

    const intervalId = setInterval(async () => {
      const latestValue = data[data.length - 1].value;
      const newTick = await getLatestTick("NIFTY 50", latestValue);
      
      // Only update state if the market is open and the value changed
      if (newTick.value !== latestValue) {
         setData((prevData) => {
            const newData = [...prevData, newTick];
            // Don't let the array grow indefinitely, keep last ~100 points
            return newData.length > 100 ? newData.slice(1) : newData;
         });
      }
    }, 5000) // 5 seconds

    return () => clearInterval(intervalId)
  }, [timeRange, loading, data])

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2] ?? data[data.length - 1];
  const change = latestData && previousData ? latestData.value - previousData.value : 0;
  const percentageChange = latestData && previousData && previousData.value !== 0 ? (change / previousData.value) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-headline flex items-center gap-2">
              <CandlestickChart className="size-6" />
              <span>Performance</span>
            </CardTitle>
            <CardDescription>NIFTY 50 Index</CardDescription>
          </div>
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
            <TabsList>
              <TabsTrigger value="1d">1D</TabsTrigger>
              <TabsTrigger value="7d">7D</TabsTrigger>
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[256px] w-full" />
           </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold">{latestData?.value.toFixed(2)}</h2>
                <p className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{change.toFixed(2)} ({percentageChange.toFixed(2)}%)
                </p>
            </div>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={axisFormatters[timeRange]}
                  interval="preserveStartEnd"
                />
                <YAxis 
                    domain={['dataMin - 10', 'dataMax + 10']} 
                    hide 
                />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 2, strokeDasharray: "3 3" }}
                    content={<ChartTooltipContent 
                        indicator="dot"
                        labelKey="date"
                        labelFormatter={(label, payload) => {
                           if (!payload || !payload.length) return null;
                           const point = payload[0].payload;
                           return (
                             <div className="space-y-1">
                               <p className="font-semibold">{point.value.toFixed(2)}</p>
                               <p className="text-xs text-muted-foreground">{tooltipLabelFormatters[timeRange](point.date)}</p>
                             </div>
                           )
                        }}
                    />} 
                />
                <Area
                  dataKey="value"
                  type="monotone"
                  fill="url(#colorValue)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  )
}
