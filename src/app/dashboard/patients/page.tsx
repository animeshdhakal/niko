import { getDoctorAppointments } from "./actions";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { PatientDiagnosisDialog } from "@/components/patients/patient-diagnosis-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export default async function PatientsPage(props: {
  searchParams: Promise<{ page?: string; pageSize?: string; status?: string }>;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a doctor
  const { data: account } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!account || account.role !== "doctor") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const status = (searchParams.status || "all") as "all" | "pending" | "confirmed" | "cancelled" | "completed";

  const { appointments, totalPages, totalCount } = await getDoctorAppointments({
    page,
    pageSize,
    status,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground">
            View and manage your patient appointments.
          </p>
        </div>
      </div>

      <Tabs defaultValue={status} className="w-full">
        <TabsList>
          <TabsTrigger value="all" asChild>
            <a href="?status=all">All</a>
          </TabsTrigger>
          <TabsTrigger value="pending" asChild>
            <a href="?status=pending">Pending</a>
          </TabsTrigger>
          <TabsTrigger value="confirmed" asChild>
            <a href="?status=confirmed">Confirmed</a>
          </TabsTrigger>
          <TabsTrigger value="completed" asChild>
            <a href="?status=completed">Completed</a>
          </TabsTrigger>
          <TabsTrigger value="cancelled" asChild>
            <a href="?status=cancelled">Cancelled</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="mt-4">
          <DataTable columns={columns} data={appointments} />

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {appointments.length} of {totalCount} appointments • Page {page} of {totalPages || 1}
            </div>
            <PaginationControls page={page} totalPages={totalPages} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Client component for diagnosis dialog */}
      <PatientDiagnosisDialog />
    </div>
  );
}
