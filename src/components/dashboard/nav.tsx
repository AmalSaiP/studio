
"use client"

import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  CandlestickChart,
  BrainCircuit,
  History,
  Settings,
} from "lucide-react"

const menuItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/analysis",
    label: "Analysis",
    icon: CandlestickChart,
  },
  {
    href: "/analyzer",
    label: "AI Analyzer",
    icon: BrainCircuit,
  },
  {
    href: "/backtesting",
    label: "Backtesting",
    icon: History,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
]

export function Nav() {
  const pathname = usePathname()
  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={{ children: item.label }}
          >
            <a href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
