"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { Separator } from "@/components/ui/separator";
import { EmergencyPatientDialog } from "@/components/security/emergency-patient-dialog";
import { Siren } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Simple breadcrumb logic
  const getBreadcrumbs = () => {
    if (!pathname) return [];
    const segments = pathname.split("/").filter(Boolean);
    return segments.map(
      (segment) => segment.charAt(0).toUpperCase() + segment.slice(1)
    );
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {breadcrumbs.map((breadcrumb, index) => (
            <span key={breadcrumb} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "text-foreground font-semibold"
                    : ""
                }
              >
                {breadcrumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Emergency Access Button - Only for Doctors */}
        {user && (user as { role?: string }).role === "doctor" && (
          <EmergencyPatientDialog
            trigger={
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <Siren className="w-4 h-4" />
                <span className="hidden sm:inline">Emergency Access</span>
              </Button>
            }
          />
        )}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline-block">
                  {user.email}
                </span>
                <div className="h-8 w-8 rounded-full bg-nepal-blue/10 flex items-center justify-center text-nepal-blue font-bold text-xs ring-2 ring-white dark:ring-slate-900 shadow-sm">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 cursor-pointer"
                onSelect={() => signOut()}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Separator orientation="vertical" className="h-4" />
        <ModeToggle />
      </div>
    </header>
  );
}
