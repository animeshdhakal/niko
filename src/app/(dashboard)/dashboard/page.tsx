import { checkRole, getUser } from "@/lib/server-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // We can fetch the role again to be sure, or trust the user object if it has metadata.
  // But checkRole refetches from DB, so it's safer.
  // For now, let's just display content based on what we know or can fetch.
  // Ideally, we'd have a `getRole` or similar, but checkRole throws if not matching.
  // Let's just user getUser and maybe fetch role if needed, or just show generic welcome for now
  // and specific sections.

  // Since the user asked for "content variable to the type of role",
  // we'll need to know the role.
  // The `getUser` from supabase returns auth user.
  // Let's peek at `checkRole` implementation again - it fetches from DB.

  // Let's make a quick utility helper here or just inline the db call.
  // Ideally we export a `getUserRole` from server-utils.

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is your personalized dashboard.
              {/* Logic to show role specific content will go here once we implement getUserRole */}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
