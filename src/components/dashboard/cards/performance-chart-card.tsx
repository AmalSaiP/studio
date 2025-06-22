
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
import { getPerformanceData } from "@/services/zerodha"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

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

  const latestData = data[data.length - 1];
  const previousData = data[data.length - 2];
  const change = latestData && previousData ? latestData.value - previousData.value : 0;
  const percentageChange = latestData && previousData ? (change / previousData.value) * 100 : 0;
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
            <Skeleton className="h-64 w-full" />
           </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold">{latestData?.value.toFixed(2)}</h2>
                <p className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
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
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis 
                    domain={['dataMin - 10', 'dataMax + 10']} 
                    hide 
                />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 2, strokeDasharray: "3 3" }}
                    content={<ChartTooltipContent 
                        indicator="dot"
                        labelFormatter={(label, payload) => payload?.[0] && `Value: ${payload[0].value.toFixed(2)}`}
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
