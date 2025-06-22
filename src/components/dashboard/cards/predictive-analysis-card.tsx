
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
import { ArrowUp, ArrowDown, Sparkles, Lightbulb } from "lucide-react"
import { tradeSignals } from "@/lib/data"
import { generateTradeSignalExplanation } from "@/ai/flows/generate-trade-signal-explanation"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

type Signal = (typeof tradeSignals)[number]

export function PredictiveAnalysisCard() {
  const { toast } = useToast()
  const [selectedSignal, setSelectedSignal] = React.useState<Signal | null>(null)
  const [explanation, setExplanation] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleExplainClick = async (signal: Signal) => {
    setSelectedSignal(signal)
    setIsLoading(true)
    setExplanation(null)
    
    try {
      const result = await generateTradeSignalExplanation({
        ticker: signal.ticker,
        signalType: signal.signal.toLowerCase() as "buy" | "sell",
        reasoning: signal.reasoning,
      })
      setExplanation(result.explanation)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate explanation. Please try again.",
      })
      // Close dialog on error
      setSelectedSignal(null)
    } finally {
      setIsLoading(false)
    }
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
            AI-generated signals based on advanced ML models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tradeSignals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell className="font-medium">{signal.ticker}</TableCell>
                  <TableCell>
                    <Badge
                      variant={signal.signal === "BUY" ? "default" : "destructive"}
                      className={signal.signal === "BUY" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                    >
                      {signal.signal === "BUY" ? <ArrowUp className="mr-1 size-3" /> : <ArrowDown className="mr-1 size-3" />}
                      {signal.signal}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{signal.confidence}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleExplainClick(signal)}>
                      Explain
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSignal} onOpenChange={(open) => !open && setSelectedSignal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2">
                <Lightbulb className="text-primary"/>
                AI Signal Explanation for {selectedSignal?.ticker}
            </DialogTitle>
            <DialogDescription>
                Signal: <span className={selectedSignal?.signal === 'BUY' ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{selectedSignal?.signal}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
            {explanation && <p className="text-sm text-muted-foreground">{explanation}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
