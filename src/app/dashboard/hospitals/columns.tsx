"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Hospital = {
  id: string;
  name: string;
  email: string;
  contact_number: string;
  latitude: number;
  longitude: number;
  province: string | null;
  district: string | null;
  city: string | null;
  created_at: string;
};

export const columns: ColumnDef<Hospital>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "district",
    header: "District",
  },
  {
    accessorKey: "province",
    header: "Province",
  },
  {
    accessorKey: "contact_number",
    header: "Contact",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "coordinates",
    header: "Coordinates",
    cell: ({ row }) => {
      const lat = row.original.latitude;
      const lng = row.original.longitude;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    },
  },
];
