"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AppointmentDetailsDialog } from "@/components/appointments/appointment-details-dialog";

export type Appointment = {
  id: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "deleted";
  initial_symptoms?: string | null;
  diagnosis?: string | null;
  final_diagnosis?: string | null;
  doctor_notes?: string | null;
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
              : status === "completed"
              ? "secondary"
              : "secondary"
          }
        >
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <AppointmentDetailsDialog appointmentId={row.original.id} />;
    },
  },
];

