import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getDrizzleSupabaseClient } from "@/lib/drizzle-client"
import { sql } from "drizzle-orm"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { runTransaction } = await getDrizzleSupabaseClient()

  const userRole = await runTransaction(async (tx) => {
    const user = await tx.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, sql`auth.uid()`),
      columns: {
        role: true,
      },
    })
    return user?.role ?? "user"
  })

  return (
    <SidebarProvider>
      <AppSidebar userRole={userRole} />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}
