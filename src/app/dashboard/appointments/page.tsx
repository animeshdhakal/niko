import { getUserAppointments } from "@/app/dashboard/appointments/actions";
import { BookAppointmentDialog } from "@/components/appointments/book-appointment-dialog";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default async function AppointmentsPage(props: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;

  const { appointments, totalPages } = await getUserAppointments({
    page,
    pageSize,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your scheduled appointments.
          </p>
        </div>
        <BookAppointmentDialog />
      </div>

      <DataTable columns={columns} data={appointments} />
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <PaginationControls page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
