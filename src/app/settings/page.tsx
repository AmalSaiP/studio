
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
import { Logo } from "@/components/icons/logo"
import { Separator } from "@/components/ui/separator"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BellRing, KeyRound, Save } from "lucide-react"

export default function SettingsPage() {
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
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                        Manage your integrations and alert preferences.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                        <KeyRound className="size-5 text-primary" />
                        Zerodha Integration
                        </h3>
                        <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input id="api-key" type="password" placeholder="Enter your API key" />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="api-secret">API Secret</Label>
                        <Input id="api-secret" type="password" placeholder="Enter your API secret" />
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                        <BellRing className="size-5 text-primary" />
                        Customizable Alerts
                        </h3>
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>AI Buy/Sell Signals</Label>
                            <p className="text-xs text-muted-foreground">
                            Notify on new high-confidence signals.
                            </p>
                        </div>
                        <Switch />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>Volatility Spike</Label>
                            <p className="text-xs text-muted-foreground">
                            Alert when IV increases significantly.
                            </p>
                        </div>
                        <Switch />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>Price Breakouts</Label>
                            <p className="text-xs text-muted-foreground">
                            Notify when price crosses key levels.
                            </p>
                        </div>
                        <Switch defaultChecked />
                        </div>
                    </div>
                    </CardContent>
                    <CardFooter>
                        <Button>
                            <Save className="mr-2 size-4" />
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
