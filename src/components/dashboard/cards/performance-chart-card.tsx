
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
import { useToast } from "@/hooks/use-toast"

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
    '1d': (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
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
  const { toast } = useToast()
  const [data, setData] = React.useState<PerformanceData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState("1d")
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);


  React.useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setLastUpdated(null);
        try {
            const response = await fetch(`/api/performance?timeRange=${timeRange}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const chartData = await response.json();
            setData(chartData);
             if (chartData.length > 0) {
                setLastUpdated(new Date(chartData[chartData.length - 1].date));
            }
        } catch (error) {
            console.error("Failed to fetch performance data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch performance data. Zerodha token may be expired.",
            });
            setData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [timeRange, toast]);

  // Live updates for 1d view
  React.useEffect(() => {
    if (timeRange !== '1d' || loading) {
      return
    }

    const intervalId = setInterval(async () => {
        try {
            const response = await fetch('/api/quote?instrument=NSE:NIFTY%2050');
            if (!response.ok) {
                console.warn('Failed to fetch live quote');
                return;
            }
            const newTick = await response.json();

            setLastUpdated(new Date(newTick.date));

            setData((prevData) => {
                if (prevData.length === 0) return [newTick];
                const newData = [...prevData, newTick];
                // Keep array size reasonable to prevent performance degradation
                return newData.length > 150 ? newData.slice(1) : newData; 
            });

        } catch (error) {
            console.warn("Error polling for quote:", error);
        }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(intervalId)
  }, [timeRange, loading, toast])

  const latestData = data.length > 0 ? data[data.length - 1] : null;
  const previousData = data.length > 1 ? data[data.length - 2] : latestData;
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
        ) : data.length > 0 ? (
          <>
             <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold">{latestData?.value.toFixed(2)}</h2>
                    <p className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)} ({percentageChange.toFixed(2)}%)
                    </p>
                </div>
                 <div className="flex items-center text-xs text-muted-foreground gap-2">
                    {timeRange === '1d' && (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    )}
                    <span>
                    {timeRange === '1d' ? 
                        `Live • Last update ${lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '...'}` :
                        `Closing data as of ${lastUpdated ? lastUpdated.toLocaleDateString() : '...'}`
                    }
                    </span>
                </div>
            </div>
            <ChartContainer config={chartConfig} className="h-64 w-full mt-4">
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
        ) : (
             <div className="flex h-[320px] items-center justify-center">
                <p className="text-muted-foreground">No data available. Please configure API keys.</p>
             </div>
        )}
      </CardContent>
    </Card>
  )
}
