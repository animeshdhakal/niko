"use client"

import { Home, Building2, CalendarDays, Users, FileText } from "lucide-react"
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
      url: "/dashboard/appointments",
      icon: CalendarDays,
    },
    ...(userRole === "doctor"
      ? [
          {
            title: "Patients",
            url: "/dashboard/patients",
            icon: Users,
          },
        ]
      : []),
    ...(userRole === "ministry"
      ? [
          {
            title: "Hospitals",
            url: "/dashboard/hospitals",
            icon: Building2,
          },
        ]
      : []),
    {
      title: "Lab Reports",
      url: "/dashboard/lab-reports",
      icon: FileText,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
             <Image
               src="/nepal-emblem.svg"
               alt="Nepal Govt Logo"
               fill
               className="object-contain"
             />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-baseline gap-1.5">
                <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">NIKO</span>
                <span className="font-bold text-2xl text-nepal-red">निको</span>
            </div>
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
