
"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import { BrainCircuit } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const mockAnalysis = "Overall market sentiment appears cautiously bullish based on Put-Call Ratio (PCR) of 1.2. Significant open interest is concentrated at the 22500 CE and 22000 PE strikes, suggesting a potential trading range. Implied Volatility (IV) is relatively low, which could mean options are cheap, but a sudden spike in volatility could negatively impact short positions. A Bull Call Spread could be considered, buying the 22200 CE and selling the 22500 CE to capitalize on the expected range-bound upward movement while limiting risk.";

function AnalysisSummary() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true);
  const [analysisText, setAnalysisText] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchAnalysis() {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setAnalysisText(mockAnalysis);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to get analysis summary. Please try again.",
            });
        }
        setLoading(false);
    }
    fetchAnalysis();
  }, [toast])

  if (loading) {
    return (
       <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    )
  }

  if (!analysisText) {
    return <p className="text-sm text-muted-foreground">No analysis available.</p>
  }

  return (
    <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{analysisText}</p>
    </div>
  )
}


export function OptionsAnalyzerCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BrainCircuit className="size-6" />
          <span>Options Analyzer</span>
        </CardTitle>
        <CardDescription>
          AI-driven insights from option chain data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnalysisSummary />
      </CardContent>
    </Card>
  )
}
