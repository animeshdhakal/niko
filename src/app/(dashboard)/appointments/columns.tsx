"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export type Appointment = {
  id: string;
  date: Date;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "deleted";
  doctor: {
    name: string;
    department: {
      name: string;
      hospital: {
        name: string;
      };
    } | null;
  } | null;
};

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "doctor.name",
    header: "Doctor",
  },
  {
    accessorKey: "doctor.department.name",
    header: "Department",
  },
  {
    accessorKey: "doctor.department.hospital.name",
    header: "Hospital",
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => {
      return format(new Date(row.original.date), "PPP p");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={
            status === "confirmed"
              ? "default"
              : status === "cancelled"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
];
