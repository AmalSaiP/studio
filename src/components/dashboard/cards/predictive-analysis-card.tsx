
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Sparkles, Lightbulb, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react"
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

const mockSignals: Signal[] = [
    { id: 1, ticker: 'NIFTY_FUT', signal: 'BUY', confidence: 85, entryPrice: 22510.50, targetPrice: 22650.00, stopLoss: 22450.00, reasoning: 'Strong momentum and RSI crossover suggest upward potential.' },
    { id: 2, ticker: 'BANKNIFTY_FUT', signal: 'SELL', confidence: 78, entryPrice: 48500.00, targetPrice: 48200.00, stopLoss: 48650.00, reasoning: 'Approaching a key resistance level with high volume.' },
    { id: 3, ticker: 'RELIANCE_FUT', signal: 'BUY', confidence: 92, entryPrice: 2950.20, targetPrice: 3000.00, stopLoss: 2925.00, reasoning: 'Positive news catalyst combined with bullish chart pattern.' },
    { id: 4, ticker: 'HDFCBANK_FUT', signal: 'SELL', confidence: 70, entryPrice: 1530.00, targetPrice: 1505.00, stopLoss: 1542.50, reasoning: 'Bearish divergence on the 15-minute chart indicates waning momentum.' },
];


export function PredictiveAnalysisCard() {
  const { toast } = useToast()
  const { searchQuery } = useSearch()
  const [signals, setSignals] = React.useState<Signal[]>([])
  const [signalsLoading, setSignalsLoading] = React.useState(true)
  const [selectedSignal, setSelectedSignal] = React.useState<Signal | null>(null)

  React.useEffect(() => {
    async function fetchSignals() {
      setSignalsLoading(true);
      try {
        const response = await fetch('/api/signals');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSignals(data);
      } catch (error) {
        console.error("Failed to fetch signals:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch AI signals. Showing default data.",
        });
        setSignals(mockSignals); // Fallback to mock data
      } finally {
        setSignalsLoading(false);
      }
    }
    fetchSignals();
  }, [toast]);

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
            <Separator />
            <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-4" />
                    Important Disclaimer
                </h4>
                <p className="text-xs text-muted-foreground">
                    Signals are for informational purposes and not financial advice. The algorithm uses historical data and technical indicators, which do not guarantee future performance. All trading involves risk.
                </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
