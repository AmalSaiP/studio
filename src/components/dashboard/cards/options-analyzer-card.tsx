
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { suggestIndicators, type SuggestIndicatorsOutput } from "@/ai/flows/suggest-indicators"
import { summarizeOptionsAnalysis, type SummarizeOptionsAnalysisOutput } from "@/ai/flows/summarize-options-analysis"
import { getOptionsChainAnalysis } from "@/services/zerodha"
import { BrainCircuit, Lightbulb, Sparkles } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const indicatorSchema = z.object({
  tradingGoals: z.string().min(10, { message: "Please describe your goals in more detail." }),
  experienceLevel: z.string({ required_error: "Please select your experience level." }),
  assetType: z.string({ required_error: "Please select an asset type." }),
})

type IndicatorValues = z.infer<typeof indicatorSchema>

function IndicatorSuggester() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<SuggestIndicatorsOutput | null>(null)

  const form = useForm<IndicatorValues>({
    resolver: zodResolver(indicatorSchema),
  })

  async function onSubmit(data: IndicatorValues) {
    setLoading(true)
    setResult(null)
    try {
      const res = await suggestIndicators(data)
      setResult(res)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get suggestions. Please try again.",
      })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tradingGoals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trading Goals</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., short-term gains, hedging" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="stocks">Stocks</SelectItem>
                      <SelectItem value="options">Options</SelectItem>
                      <SelectItem value="futures">Futures</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Getting Suggestions..." : "Get AI Suggestions"}
            {!loading && <Sparkles className="ml-2 size-4" />}
          </Button>
        </form>
      </Form>

      {loading && (
        <div className="space-y-4 pt-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-8 w-1/4" />
           <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      )}

      {result && (
        <div className="pt-4 space-y-4">
            <h3 className="font-semibold font-headline text-lg">Recommended Indicators</h3>
            <div className="flex flex-wrap gap-2">
              {result.indicators.map((indicator) => <Badge key={indicator} variant="secondary">{indicator}</Badge>)}
            </div>
             <h3 className="font-semibold font-headline text-lg">Recommended Strategies</h3>
            <div className="flex flex-wrap gap-2">
              {result.strategies.map((strategy) => <Badge key={strategy} variant="secondary">{strategy}</Badge>)}
            </div>
             <h3 className="font-semibold font-headline text-lg">Explanation</h3>
            <p className="text-sm text-muted-foreground">{result.explanation}</p>
        </div>
      )}
    </div>
  )
}

function AnalysisSummary() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<SummarizeOptionsAnalysisOutput | null>(null)

  React.useEffect(() => {
    async function fetchAnalysis() {
        setLoading(true);
        try {
            const analysisData = await getOptionsChainAnalysis("NIFTY 50");
            const result = await summarizeOptionsAnalysis({ analysisData });
            setSummary(result);
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
       <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
           <div className="space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/5" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
    )
  }

  if (!summary) {
    return <p className="text-sm text-muted-foreground">No analysis available.</p>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold font-headline">Summary</h4>
          <p className="text-sm text-muted-foreground">{summary.summary}</p>
        </div>
        <div>
          <h4 className="font-semibold font-headline">Opportunities</h4>
          <p className="text-sm text-muted-foreground">{summary.opportunities}</p>
        </div>
        <div>
          <h4 className="font-semibold font-headline">Risks</h4>
          <p className="text-sm text-muted-foreground">{summary.risks}</p>
        </div>
      </div>
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
        <Tabs defaultValue="suggester">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggester">
              <Lightbulb className="mr-2 size-4" />
              Indicator Suggester
            </TabsTrigger>
            <TabsTrigger value="summary">
              <Sparkles className="mr-2 size-4" />
              Analysis Summary
            </TabsTrigger>
          </TabsList>
          <TabsContent value="suggester" className="pt-4">
            <IndicatorSuggester />
          </TabsContent>
          <TabsContent value="summary" className="pt-4">
            <AnalysisSummary />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
