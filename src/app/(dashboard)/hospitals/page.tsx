import { Suspense } from "react";
import { getHospitals } from "../actions";
import { HospitalsTable } from "@/components/ministry/hospitals-table";
import { SearchBar } from "@/components/ministry/search-bar";
import HospitalMap from "@/components/dashboard/hospital-map-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Hospitals | Ministry Dashboard",
};

export default async function HospitalsPage(props: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const { hospitals, totalPages } = await getHospitals({ page, search });

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
            <HospitalsTable
              hospitals={hospitals}
              page={page}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
