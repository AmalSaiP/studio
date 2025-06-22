
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

type Props = {
  children: React.ReactNode
}

export function SettingsSheet({ children }: Props) {
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
        </div>
         <Button className="w-full">
            <Save className="mr-2 size-4" />
            Save Changes
        </Button>
      </SheetContent>
    </Sheet>
  )
}
