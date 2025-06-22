
"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { KeyRound, BellRing, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Props = {
  children: React.ReactNode
}

export function SettingsSheet({ children }: Props) {
  const { toast } = useToast()
  const [apiKey, setApiKey] = React.useState("9mhowz0mpnfltqpm")
  const [apiSecret, setApiSecret] = React.useState("qxoqq4ew35qv4xsklg5zk2zvudcfn9zg")
  const [alerts, setAlerts] = React.useState({
    buySell: false,
    volatility: false,
    breakouts: true,
  })

  const handleSave = () => {
    console.log("Saving settings from sheet:", { apiKey, apiSecret, alerts })
    toast({
      title: "Settings Saved",
      description: "Your changes have been successfully saved.",
    })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">Settings</SheetTitle>
          <SheetDescription>
            Manage your integrations and alert preferences.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8 space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <KeyRound className="size-5 text-primary" />
              Zerodha Integration
            </h3>
            <div className="space-y-2">
              <Label htmlFor="sheet-api-key">API Key</Label>
              <Input id="sheet-api-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sheet-api-secret">API Secret</Label>
              <Input id="sheet-api-secret" type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
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
                <Label htmlFor="sheet-buy-sell-switch">AI Buy/Sell Signals</Label>
                <p className="text-xs text-muted-foreground">
                  Notify on new high-confidence signals.
                </p>
              </div>
              <Switch id="sheet-buy-sell-switch" checked={alerts.buySell} onCheckedChange={(checked) => setAlerts(prev => ({...prev, buySell: checked}))} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="sheet-volatility-switch">Volatility Spike</Label>
                <p className="text-xs text-muted-foreground">
                  Alert when IV increases significantly.
                </p>
              </div>
              <Switch id="sheet-volatility-switch" checked={alerts.volatility} onCheckedChange={(checked) => setAlerts(prev => ({...prev, volatility: checked}))} />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="sheet-breakouts-switch">Price Breakouts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when price crosses key levels.
                </p>
              </div>
              <Switch id="sheet-breakouts-switch" checked={alerts.breakouts} onCheckedChange={(checked) => setAlerts(prev => ({...prev, breakouts: checked}))} />
            </div>
          </div>
        </div>
         <Button className="w-full" onClick={handleSave}>
            <Save className="mr-2 size-4" />
            Save Changes
        </Button>
      </SheetContent>
    </Sheet>
  )
}
