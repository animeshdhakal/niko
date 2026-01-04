"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { updateAppointmentStatus } from "./actions";
import { toast } from "sonner";

export type PatientAppointment = {
  id: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "deleted";
  initial_symptoms: string | null;
  diagnosis: string | null;
  final_diagnosis: string | null;
  doctor_notes: string | null;
  patient: {
    id: string;
    name: string | null;
    email: string;
    national_id_no: string | null;
  } | null;
};

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "outline",
    confirmed: "default",
    completed: "secondary",
    cancelled: "destructive",
  };

  return (
    <Badge variant={variants[status] || "secondary"}>
      {status.toUpperCase()}
    </Badge>
  );
};

const StatusActions = ({ appointment }: { appointment: PatientAppointment }) => {
  const handleStatusChange = async (status: "confirmed" | "cancelled" | "completed") => {
    try {
      await updateAppointmentStatus({ appointmentId: appointment.id, status });
      toast.success(`Appointment ${status}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            // Open diagnosis dialog - handled by parent
            window.dispatchEvent(
              new CustomEvent("openDiagnosis", { detail: appointment })
            );
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View / Edit Diagnosis
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {appointment.status === "pending" && (
          <DropdownMenuItem onClick={() => handleStatusChange("confirmed")}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
            Confirm Appointment
          </DropdownMenuItem>
        )}
        {(appointment.status === "pending" || appointment.status === "confirmed") && (
          <>
            <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
              <Clock className="mr-2 h-4 w-4 text-blue-600" />
              Mark as Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("cancelled")}
              className="text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Appointment
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<PatientAppointment>[] = [
  {
    accessorKey: "patient.name",
    header: "Patient Name",
    cell: ({ row }) => {
      const patient = row.original.patient;
      return (
        <div>
          <div className="font-medium">{patient?.name || "Unknown"}</div>
          <div className="text-xs text-muted-foreground">{patient?.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "patient.national_id_no",
    header: "National ID",
    cell: ({ row }) => {
      return row.original.patient?.national_id_no || "-";
    },
  },
  {
    accessorKey: "date",
    header: "Appointment Date",
    cell: ({ row }) => {
      return format(new Date(row.original.date), "PPP p");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "initial_symptoms",
    header: "Initial Symptoms",
    cell: ({ row }) => {
      const symptoms = row.original.initial_symptoms;
      if (!symptoms) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="max-w-[200px] truncate block" title={symptoms}>
          {symptoms}
        </span>
      );
    },
  },
  {
    accessorKey: "diagnosis",
    header: "Diagnosis",
    cell: ({ row }) => {
      const diagnosis = row.original.final_diagnosis || row.original.diagnosis;
      if (!diagnosis) return <span className="text-muted-foreground">Not yet</span>;
      return (
        <span className="max-w-[200px] truncate block" title={diagnosis}>
          {diagnosis}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <StatusActions appointment={row.original} />,
  },
];
