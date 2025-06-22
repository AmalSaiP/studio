
"use client"

import * as React from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Nav } from "@/components/dashboard/nav"
import { Header } from "@/components/dashboard/header"
import { PerformanceChartCard } from "@/components/dashboard/cards/performance-chart-card"
import { PredictiveAnalysisCard } from "@/components/dashboard/cards/predictive-analysis-card"
import { Logo } from "@/components/icons/logo"
import { Separator } from "@/components/ui/separator"

export default function AnalysisPage() {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="md:grid md:grid-cols-[auto,1fr]">
        <Sidebar collapsible="icon" className="group-data-[collapsible=icon]:border-r">
          <SidebarHeader>
            <div className="flex h-10 items-center gap-2.5 px-2">
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
              <Logo />
              <h1 className="font-headline text-lg font-bold group-data-[collapsible=icon]:hidden">
                F&O Edge
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <Nav />
          </SidebarContent>
          <SidebarFooter className="group-data-[collapsible=icon]:hidden">
            <Separator className="mb-2" />
            <p className="px-2 text-xs text-muted-foreground">
              © {new Date().getFullYear()} F&O Edge
            </p>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="p-4 lg:p-6">
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Analysis</h2>
                <PerformanceChartCard />
                <PredictiveAnalysisCard />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
