import { Suspense } from "react";
import { getHospitals } from "../actions";
import { SearchBar } from "@/components/ministry/search-bar";
import HospitalMap from "@/components/dashboard/hospital-map-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { PaginationControls } from "@/components/ui/pagination-controls";

export const metadata = {
  title: "Hospitals | Ministry Dashboard",
};

export default async function HospitalsPage(props: {
  searchParams: Promise<{ page?: string; search?: string; pageSize?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const search = searchParams.search || "";

  const { hospitals, totalPages } = await getHospitals({ page, search, pageSize });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Hospitals</h1>
        <p className="text-muted-foreground">
          View and manage registered hospitals across the nation.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hospital Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <HospitalMap hospitals={hospitals} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <SearchBar />
          </div>

          <Suspense fallback={<div>Loading hospitals...</div>}>
          <Suspense fallback={<div>Loading hospitals...</div>}>
            <DataTable
              columns={columns}
              data={hospitals}
              // Pagination handling needs to be lifted up or handled via Next.js router in the DataTable if we want to keep server-side pagination.
              // For now, the DataTable component I created is client-side pagination.
              // However, the `getHospitals` action returns paginated data.
              // To support server-side pagination with the current DataTable, I might need to adjust it or wrapping it.
              // But the user request was just "use tanstack table".
              // Let's use the DataTable component but disable its internal pagination if we want server side, OR just pass the current page data.
              // Wait, the current DataTable implementation has `getPaginationRowModel: getPaginationRowModel()`, which means it paginates the *data passed to it*.
              // Since `getHospitals` returns only 10 items (pageSize), the table will show 10 items and think there's only 1 page.
              // To keep the existing "server-side" pagination behavior (using URL params), we should probably NOT use the DataTable's internal pagination UI for "next/prev" if it relies on client data, OR we update DataTable to accept `pageCount` and `onPaginationChange`.
              // Given the `HospitalsTable` had manual Previous/Next buttons invoking `router.push`, I should probably keep those buttons external to the table OR update DataTable.
              // For simplicity and matching the request "change rls to only authenticated. Also use tanstack table for apppointments and hospitals", strict adherence to "use tanstack table" usually implies using its features.
              // However, since we have server actions fetching pages, mixing them is tricky without extra work.
              // Let's stick to replacing the TABLE part with DataTable, and keep the pagination controls OUTSIDE or modify DataTable to support manual pagination control.
              // Actually, simply passing the 10 rows to DataTable will render them. The internal pagination of DataTable will see 10 rows and 1 page.
              // Users won't be able to navigate to page 2 via DataTable's buttons.
              // I will update the DataTable to be more flexible or just control the pagination externally as before but using the table for rendering.
              // Let's render the DataTable, and KEEP the external pagination controls for now (custom buttons below it), OR update DataTable to handle manual pagination.
              // I'll stick to a simple integration: Render data with DataTable. Re-implement external pagination controls simply.
            />
             <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <PaginationControls page={page} totalPages={totalPages} />
             </div>
          </Suspense>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
