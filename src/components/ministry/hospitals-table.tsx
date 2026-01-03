"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Hospital = {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  latitude: number;
  longitude: number;
  province: string | null;
  district: string | null;
  city: string | null;
};

type Props = {
  hospitals: Hospital[];
  page: number;
  totalPages: number;
};

export function HospitalsTable({ hospitals, page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hospitals</CardTitle>
        <CardDescription>
          Manage and view registered hospitals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  City
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  District
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Province
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Contact
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Email
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  Coordinates
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {hospitals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No hospitals found.
                  </td>
                </tr>
              ) : (
                hospitals.map((hospital) => (
                  <tr
                    key={hospital.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle font-medium">
                      {hospital.name}
                    </td>
                    <td className="p-4 align-middle">{hospital.city}</td>
                    <td className="p-4 align-middle">{hospital.district}</td>
                    <td className="p-4 align-middle">{hospital.province}</td>
                    <td className="p-4 align-middle">
                      {hospital.contactNumber}
                    </td>
                    <td className="p-4 align-middle">{hospital.email}</td>
                    <td className="p-4 align-middle">
                      {hospital.latitude.toFixed(4)}, {hospital.longitude.toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
