"use client"

import { Home, Settings, Building2, CalendarDays } from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ userRole }: { userRole: string }) {
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: CalendarDays,
    },
    ...(userRole === "ministry"
      ? [
          {
            title: "Hospitals",
            url: "/hospitals",
            icon: Building2,
          },
        ]
      : []),
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
             <Image
               src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Nepal.svg"
               alt="Nepal Govt Logo"
               fill
               className="object-contain"
             />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">Niko</span>
            <span className="text-xs text-muted-foreground font-medium">निको</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
