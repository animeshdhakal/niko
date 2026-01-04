import { DataTable } from "@/components/ui/data-table";
import { getLabReports } from "./actions";
import { columns } from "./columns";

export default async function LabReportsPage() {
  const reports = await getLabReports();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Lab Reports</h1>
      </div>
      <DataTable columns={columns} data={reports} />
    </div>
  );
}
