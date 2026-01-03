"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { Separator } from "@/components/ui/separator";

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Simple breadcrumb logic
  const getBreadcrumbs = () => {
    if (!pathname) return [];
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));
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
                    <span className={index === breadcrumbs.length - 1 ? "text-foreground font-semibold" : ""}>
                        {breadcrumb}
                    </span>
                </span>
            ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
            <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                    {user.email}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    Sign Out
                </Button>
            </div>
        )}
        <Separator orientation="vertical" className="h-4" />
        <ModeToggle />
      </div>
    </header>
  );
}
