
"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Sparkles, Lightbulb, TrendingUp, TrendingDown, Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useSearch } from "@/context/search-provider"

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

const mockSignals = [
    {
        id: 1,
        ticker: 'NIFTY24AUGFUT',
        signal: 'BUY' as const,
        confidence: 88,
        entryPrice: 22510.50,
        targetPrice: 22650.00,
        stopLoss: 22440.00,
        reasoning: 'Strong bullish momentum indicated by MACD crossover and RSI above 60. Price is holding above the 50-period moving average.',
    },
    {
        id: 2,
        ticker: 'BANKNIFTY 24AUG48000CE',
        signal: 'BUY' as const,
        confidence: 92,
        entryPrice: 350.00,
        targetPrice: 450.00,
        stopLoss: 300.00,
        reasoning: 'High open interest buildup and positive delta suggest strong upward potential. Implied volatility is increasing, favoring option buyers.',
    },
    {
        id: 3,
        ticker: 'RELIANCE',
        signal: 'SELL' as const,
        confidence: 75,
        entryPrice: 2890.00,
        targetPrice: 2820.00,
        stopLoss: 2925.00,
        reasoning: 'Stock is overbought with RSI above 75. A bearish divergence pattern is forming after hitting a key resistance level.',
    },
    {
        id: 4,
        ticker: 'TCS',
        signal: 'BUY' as const,
        confidence: 81,
        entryPrice: 3855.00,
        targetPrice: 3950.00,
        stopLoss: 3810.00,
        reasoning: 'Breakout above 50-day moving average with high volume. Trend indicators confirm bullish continuation.',
    },
    {
        id: 5,
        ticker: 'HDFCBANK',
        signal: 'SELL' as const,
        confidence: 78,
        entryPrice: 1680.00,
        targetPrice: 1640.00,
        stopLoss: 1695.00,
        reasoning: 'Price broke below a key support level and the 200-day moving average, a strong bearish signal.',
    }
];

export function PredictiveAnalysisCard() {
  const { toast } = useToast()
  const { searchQuery } = useSearch()
  const [signals, setSignals] = React.useState<Signal[]>([])
  const [signalsLoading, setSignalsLoading] = React.useState(true)
  const [selectedSignal, setSelectedSignal] = React.useState<Signal | null>(null)

  React.useEffect(() => {
    async function fetchSignals() {
      setSignalsLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setSignals(mockSignals)
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch trade signals.",
        })
      }
      setSignalsLoading(false)
    }
    fetchSignals()
  }, [toast])

  const filteredSignals = React.useMemo(() => {
    if (!searchQuery) {
      return signals;
    }
    return signals.filter(signal =>
      signal.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [signals, searchQuery]);

  const handleDetailsClick = (signal: Signal) => {
    setSelectedSignal(signal)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="size-6" />
            <span>Predictive Analysis</span>
          </CardTitle>
          <CardDescription>
            High-conviction trade signals with entry, target, and stop-loss levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signalsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead className="text-right">Stop Loss</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSignals.length > 0 ? filteredSignals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell className="font-medium">{signal.ticker}</TableCell>
                    <TableCell>
                      <Badge
                        variant={signal.signal === "BUY" ? "success" : "destructive"}
                      >
                        {signal.signal === "BUY" ? <ArrowUp className="mr-1 size-3" /> : <ArrowDown className="mr-1 size-3" />}
                        {signal.signal}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">₹{signal.entryPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-500">₹{signal.targetPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600 dark:text-red-500">₹{signal.stopLoss.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDetailsClick(signal)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No signals match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSignal} onOpenChange={(open) => !open && setSelectedSignal(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2">
                <Lightbulb className="text-primary"/>
                Signal Details: {selectedSignal?.ticker}
            </DialogTitle>
             <DialogDescription>
                A <span className={cn("font-semibold", selectedSignal?.signal === 'BUY' ? "text-emerald-500" : "text-destructive")}>{selectedSignal?.signal === 'BUY' ? 'long' : 'short'}</span> opportunity with {selectedSignal?.confidence}% confidence.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="size-3"/>Entry Price</p>
                <p className="font-bold text-lg">₹{selectedSignal?.entryPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Target className="size-3"/>Target Price</p>
                <p className="font-bold text-lg text-emerald-500">₹{selectedSignal?.targetPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><TrendingDown className="size-3"/>Stop Loss</p>
                <p className="font-bold text-lg text-red-500">₹{selectedSignal?.stopLoss.toFixed(2)}</p>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Model Reasoning</h4>
              <p className="text-sm text-muted-foreground">{selectedSignal?.reasoning}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
