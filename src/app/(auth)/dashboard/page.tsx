import { logout } from "../lib/auth.actions";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { users } from "@/drizzle/schema";
import { getDrizzleSupabaseAdminClient } from "@/lib/drizzle-client";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile from DB
  let userProfile = null;
  try {
    const db = getDrizzleSupabaseAdminClient();
    const result = await db.select().from(users).where(eq(users.id, user.id));
    userProfile = result[0];
  } catch (e) {
      console.error("Failed to fetch profile", e);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex items-center">
                    <span className="text-xl font-bold text-gray-800 dark:text-white">Niko Dashboard</span>
                </div>
                <div className="flex items-center">
                    <form action={logout}>
                        <button type="submit" className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-96 p-4 flex flex-col items-center justify-center space-y-4">
             <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Welcome, {userProfile?.name || user.email}</h2>
             <p className="text-gray-500 dark:text-gray-400">Role: <span className="font-bold capitalize">{userProfile?.role || 'Unknown'}</span></p>
             <p className="text-gray-500 dark:text-gray-400 text-sm">User ID: {user.id}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
