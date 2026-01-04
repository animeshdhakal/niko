import { getPatientLabReports } from "../../actions";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/app/dashboard/lab-reports/columns";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatientAiSummary } from "@/components/patients/patient-ai-summary";

export default async function PatientReportsPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const patientId = params.id;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch patient specific details for header
  const { data: patient } = await supabase
    .from("accounts")
    .select("name, email")
    .eq("id", patientId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reports: any[] = [];
  let totalPages = 0;
  let totalCount = 0;
  let error = null;

  try {
    const result = await getPatientLabReports({
      patientId,
      page,
      pageSize,
    });
    reports = result.reports;
    totalPages = result.totalPages;
    totalCount = result.totalCount;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load reports";
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="font-bold">Access Denied or Error</h3>
          <p>{error}</p>
          <Link href="/dashboard/patients">
            <Button variant="outline" className="mt-4 border-red-200 hover:bg-red-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/patients" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
            </Link>
             <h1 className="text-3xl font-bold tracking-tight">Patient Reports</h1>
          </div>
          <p className="text-muted-foreground">
            Viewing lab reports for <span className="font-semibold text-foreground">{patient?.name || patient?.email || "Unknown Patient"}</span>
          </p>
        </div>
      </div>

      <div className="w-full">
        <PatientAiSummary patientId={patientId} />
      </div>

      <div className="border rounded-md">
        <DataTable columns={columns} data={reports} />
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {reports.length} of {totalCount} reports • Page {page} of {totalPages || 1}
        </div>
        <PaginationControls page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
