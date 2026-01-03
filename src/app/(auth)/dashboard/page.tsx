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
    <div className="min-h-[calc(100vh-160px)] bg-nepal-gray dark:bg-slate-950/20">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-nepal-blue p-8 md:p-14 shadow-md rounded-r-2xl">
          <div className="inline-block mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-nepal-blue-dark dark:text-white pb-2 relative">
              Welcome, {userProfile?.name || user.email}
              <div className="absolute bottom-0 left-0 w-20 h-1 bg-nepal-red rounded-full" />
            </h2>
          </div>

          <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-lg font-medium">
            <div className="flex items-center gap-4 p-4 bg-nepal-gray dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 rounded-full bg-nepal-blue/10 flex items-center justify-center">
                <span className="text-nepal-blue font-bold">Role</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest">User Access Level</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{userProfile?.role || 'Patient'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                System Account ID: <span className="font-mono text-xs">{user.id}</span>
              </p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 italic">
                You are currently logged into the official National Digital Health Infrastructure Platform.
                Your session is secured with end-to-end encryption.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
