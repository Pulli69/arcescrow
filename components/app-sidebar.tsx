'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  Shield,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
  Hexagon,
  Zap,
} from 'lucide-react'
import { useCreateTaskModal } from '@/providers/create-task-provider'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

const mainNavItems = [
  { title: 'Dashboard', icon: Home, href: '/' },
  { title: 'Contracts', icon: FileText, href: '/contracts' },
  { title: 'Escrow', icon: Shield, href: '/escrow' },
  { title: 'Analytics', icon: BarChart3, href: '/analytics' },
]

const secondaryNavItems = [
  { title: 'Settings', icon: Settings, href: '/settings' },
  { title: 'Help', icon: HelpCircle, href: '/help' },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { openModal } = useCreateTaskModal()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary glow-sm">
            <Hexagon className="size-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
            ArcEscrow
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="transition-all duration-200 hover:bg-sidebar-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs uppercase tracking-wider">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="transition-all duration-200 hover:bg-sidebar-accent data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <Button
          className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:px-2"
          size="sm"
          onClick={openModal}
        >
          <Plus className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">New Contract</span>
        </Button>

        {/* Arc Testnet label */}
        <div className="group-data-[collapsible=icon]:hidden flex items-center justify-center gap-1.5 rounded-md border border-border/30 bg-secondary/20 px-2 py-1.5">
          <Zap className="size-3 text-primary/60 shrink-0" />
          <span className="text-[10px] text-muted-foreground/60 tracking-wide">
            Powered by Arc Testnet
          </span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
