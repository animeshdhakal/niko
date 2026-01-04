import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { AccessRequestsList } from "@/components/access/access-requests-list";
import { getPatientAccessRequests } from "@/app/actions/access.actions";

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile from DB
  let userProfile = null;
  try {
    const adminClient = getSupabaseAdminClient();
    const { data } = await adminClient
      .from("accounts")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = data;
  } catch (e) {
    console.error("Failed to fetch profile", e);
  }

  // Fetch pending access requests if user is a patient (or citizen)
  const pendingRequests =
    userProfile?.role === "citizen" || !userProfile?.role
      ? await getPatientAccessRequests()
      : [];

  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-950/20">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* ACCESS REQUESTS SECTION */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <AccessRequestsList requests={pendingRequests} />
          </div>
        )}

        {/* WELCOME SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Welcome back, {userProfile?.name || user.email?.split("@")[0]}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your health today
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Total Appointments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              12
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Total Appointments
            </p>
          </div>

          {/* Card 2: Upcoming */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              3
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Upcoming This Week
            </p>
          </div>

          {/* Card 3: Lab Reports */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              8
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Lab Reports
            </p>
          </div>

          {/* Card 4: Active Grants */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-nepal-red/10 dark:bg-nepal-red/20 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-nepal-red"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              2
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Active Access Grants
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/dashboard/appointments"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-nepal-blue dark:hover:border-nepal-blue hover:bg-nepal-blue/5 dark:hover:bg-nepal-blue/10 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-nepal-blue/10 flex items-center justify-center group-hover:bg-nepal-blue/20 transition-colors">
                <svg
                  className="h-5 w-5 text-nepal-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  View Appointments
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Check your schedule
                </p>
              </div>
            </a>

            <a
              href="/dashboard/lab-reports"
              className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-nepal-blue dark:hover:border-nepal-blue hover:bg-nepal-blue/5 dark:hover:bg-nepal-blue/10 transition-all group"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <svg
                  className="h-5 w-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Lab Reports
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  View test results
                </p>
              </div>
            </a>

            {userProfile?.role === "doctor" && (
              <a
                href="/dashboard/patients"
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-nepal-blue dark:hover:border-nepal-blue hover:bg-nepal-blue/5 dark:hover:bg-nepal-blue/10 transition-all group"
              >
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    My Patients
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Manage patient records
                  </p>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* USER INFO */}
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-nepal-blue/10 flex items-center justify-center">
              <span className="text-nepal-blue font-bold text-lg">
                {userProfile?.name?.charAt(0) ||
                  user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {userProfile?.name || user.email}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {userProfile?.role || "Patient"}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Account ID:{" "}
              <span className="font-mono">{user.id.slice(0, 8)}...</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
