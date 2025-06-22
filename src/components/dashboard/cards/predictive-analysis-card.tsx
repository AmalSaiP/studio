
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
import { getTradeSignals } from "@/services/zerodha"
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
        const result = await getTradeSignals()
        setSignals(result)
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
