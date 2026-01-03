import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSupabaseServerClient } from "@/lib/supabase/server-client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole = "citizen"
  if (user) {
    const { data } = await supabase
      .from("accounts")
      .select("role")
      .eq("id", user.id)
      .single()
    userRole = data?.role ?? "citizen"
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole={userRole} />
      <main className="w-full flex flex-col">
        <DashboardHeader />
        <div className="flex-1 p-4">
            {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
