
"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"
import { getOptionsChainAnalysis } from "@/services/zerodha"
import { BrainCircuit } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function AnalysisSummary() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true);
  const [analysisText, setAnalysisText] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchAnalysis() {
        setLoading(true);
        try {
            const result = await getOptionsChainAnalysis("NIFTY 50");
            setAnalysisText(result);
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
