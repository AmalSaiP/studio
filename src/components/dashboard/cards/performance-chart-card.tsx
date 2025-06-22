
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

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await fetch(`/api/performance?timeRange=${timeRange}`)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch performance data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch performance data from the backend.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [timeRange, toast])

  // Live updates for 1d view
  React.useEffect(() => {
    if (timeRange !== '1d' || loading) {
      return
    }

    const intervalId = setInterval(async () => {
        // Only fetch new ticks during market hours
        const now = new Date();
        const marketOpenTime = new Date().setHours(9, 15, 0, 0);
        const marketCloseTime = new Date().setHours(15, 30, 0, 0);

        if (now.getTime() < marketOpenTime || now.getTime() > marketCloseTime) {
            return;
        }

        try {
            // Instrument for NIFTY 50 Index quote
            const response = await fetch('/api/quote?instrument=NSE:NIFTY 50');
            if (!response.ok) return;

            const newTick = await response.json();
            
            setData((prevData) => {
                if (prevData.length > 0 && prevData[prevData.length - 1].value === newTick.value) {
                    return prevData;
                }
                const newData = [...prevData, newTick];
                return newData.length > 150 ? newData.slice(1) : newData; // Keep array size reasonable
            });
        } catch (error) {
            console.warn("Failed to fetch live tick:", error);
        }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(intervalId)
  }, [timeRange, loading])

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
        ) : (
             <div className="flex h-[320px] items-center justify-center">
                <p className="text-muted-foreground">No data available. Please configure API keys.</p>
             </div>
        )}
      </CardContent>
    </Card>
  )
}
