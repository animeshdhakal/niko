"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";



export type LabReport = {
  id: string;
  report_type: string;
  report_name: string;
  report_date: string;
  created_at: string;
  signature?: string | null;
  signer_hospital_id?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lab_report_items?: any[];
  creator?: {
    name: string | null;
  } | null;
  appointments?: {
    user_id: string;
    users?: {
      email: string;
    } | null;
  } | null;
};

import { LabReportDialog } from "./lab-report-dialog";

export const columns: ColumnDef<LabReport>[] = [
  {
    accessorKey: "report_name",
    header: "Report Name",
  },
  {
    accessorKey: "report_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("report_type") as string;
      return <Badge variant="outline">{type.replace("_", " ").toUpperCase()}</Badge>;
    },
  },
  {
    accessorKey: "report_date",
    header: "Date",
    cell: ({ row }) => {
      return format(new Date(row.original.report_date), "PPP");
    },
  },
  {
    accessorKey: "creator.name",
    header: "Ordered By",
    cell: ({ row }) => row.original.creator?.name || "Unknown",
  },
  {
    accessorKey: "appointments.users.email",
    header: "Patient",
    cell: ({ row }) => row.original.appointments?.users?.email || "Unknown",
  },
  {
    id: "actions",
    cell: ({ row }) => {
       return <LabReportDialog report={row.original} />
    },
  },
];
