
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Bot, ArrowRight, AreaChart } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { runBacktest } from "@/services/zerodha"
import { Skeleton } from "@/components/ui/skeleton"

const backtestingSchema = z.object({
  model: z.string({ required_error: "Please select a model." }),
  dateRange: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }),
}).refine(data => data.dateRange.from < data.dateRange.to, {
    message: "Start date must be before end date.",
    path: ["dateRange"],
});


type BacktestingValues = z.infer<typeof backtestingSchema>

export function BacktestingCard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false)
  const [results, setResults] = React.useState<{ pnl: number; winRate: number } | null>(null)

  const form = useForm<BacktestingValues>({
    resolver: zodResolver(backtestingSchema),
    defaultValues: {
      dateRange: {
        from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: new Date(),
      }
    }
  })

  const onSubmit = async (data: BacktestingValues) => {
    console.log("Starting backtest with:", data)
    setIsLoading(true)
    setResults(null)
    
    try {
        const backtestResults = await runBacktest(data.model, data.dateRange);
        setResults(backtestResults);
    } catch(error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Backtest Failed",
            description: "Could not run the backtest. Please try again later.",
        })
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot className="size-6" />
          <span>Backtest AI Models</span>
        </CardTitle>
        <CardDescription>
          Evaluate AI model performance with historical data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model to test" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="xgboost">XGBoost</SelectItem>
                      <SelectItem value="random-forest">Random Forest</SelectItem>
                      <SelectItem value="lstm">LSTM</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date range</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          disabled={isLoading}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, "LLL dd, y")} -{" "}
                                {format(field.value.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(field.value.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={{ from: field.value?.from, to: field.value?.to }}
                        onSelect={(range) => field.onChange(range || { from: undefined, to: undefined })}
                        numberOfMonths={2}
                        disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Running Backtest..." : "Run Backtest"}
              {!isLoading && <ArrowRight className="ml-2 size-4" />}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        {isLoading && (
          <div className="w-full space-y-2">
            <p className="text-sm text-muted-foreground">Processing historical data...</p>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {results && (
          <Alert className="w-full" variant={results.pnl >= 0 ? "default" : "destructive"}>
            <AreaChart className="h-4 w-4" />
            <AlertTitle>Backtest Results</AlertTitle>
            <AlertDescription className="mt-2 space-y-1">
              <p>
                <strong>Net P&L:</strong>{" "}
                <span className={cn("font-semibold", results.pnl >= 0 ? "text-emerald-500" : "text-destructive")}>
                  ₹{results.pnl.toFixed(2)}
                </span>
              </p>
              <p>
                <strong>Win Rate:</strong> {(results.winRate * 100).toFixed(2)}%
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}
