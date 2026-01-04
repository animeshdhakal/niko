"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Eye,
  Loader2,
  Pill,
  FileText,
  Stethoscope,
  AlertTriangle,
  User,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { getAppointmentDetails } from "@/app/dashboard/appointments/actions";
import { ReportQRCode } from "@/components/pki/report-qr-code";

interface AppointmentDetailsDialogProps {
  appointmentId: string;
}

type AppointmentDetails = Awaited<ReturnType<typeof getAppointmentDetails>>;

// Temporary type extension for PKI fields
type LabReportWithPKI = {
  signature?: string;
  signer_hospital_id?: string;
  report_hash?: string;
  id: string;
  notes: string | null;
  report_name: string;
  report_type: string;
  created_by_account?: { name: string | null };
  items?: {
    id: string;
    test_name: string;
    result: string;
    unit: string | null;
    is_abnormal: boolean | null;
    normal_range: string | null;
  }[];
  checked_by_account?: { name: string | null } | null;
  report_date: string;
  file_url: string | null;
};

export function AppointmentDetailsDialog({
  appointmentId,
}: AppointmentDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<AppointmentDetails | null>(null);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !details) {
      setLoading(true);
      try {
        const data = await getAppointmentDetails(appointmentId);
        setDetails(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to load appointment details");
        } else {
          toast.error("Failed to load appointment details");
        }
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blood_test: "Blood Test",
      urine_test: "Urine Test",
      xray: "X-Ray",
      ct_scan: "CT Scan",
      mri: "MRI",
      ultrasound: "Ultrasound",
      other: "Other",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View complete appointment information including diagnosis and reports.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Appointment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Doctor:</span>
                    <p className="font-medium">{details.appointment.doctor?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <p className="font-medium">
                      {details.appointment.doctor?.department?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hospital:</span>
                    <p className="font-medium">
                      {details.appointment.doctor?.department?.hospital?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">
                      {format(new Date(details.appointment.date), "PPP p")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        details.appointment.status === "confirmed"
                          ? "default"
                          : details.appointment.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                      }
                      className="ml-2"
                    >
                      {details.appointment.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnosis Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Diagnosis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {details.appointment.initial_symptoms && (
                  <div>
                    <span className="text-sm text-muted-foreground">Initial Symptoms:</span>
                    <p className="mt-1">{details.appointment.initial_symptoms}</p>
                  </div>
                )}
                {details.appointment.diagnosis && (
                  <div>
                    <span className="text-sm text-muted-foreground">Diagnosis:</span>
                    <p className="mt-1">{details.appointment.diagnosis}</p>
                  </div>
                )}
                {details.appointment.final_diagnosis && (
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Final Diagnosis:
                    </span>
                    <p className="mt-1">{details.appointment.final_diagnosis}</p>
                  </div>
                )}
                {details.appointment.doctor_notes && (
                  <div>
                    <span className="text-sm text-muted-foreground">Doctor&apos;s Notes:</span>
                    <p className="mt-1 text-sm">{details.appointment.doctor_notes}</p>
                  </div>
                )}
                {!details.appointment.initial_symptoms &&
                  !details.appointment.diagnosis &&
                  !details.appointment.final_diagnosis && (
                    <p className="text-muted-foreground text-sm">No diagnosis recorded yet.</p>
                  )}
              </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescriptions ({details.prescriptions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {details.prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {details.prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-3 border rounded-lg space-y-1"
                      >
                        <div className="font-medium">{prescription.medicine_name}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Dosage:</span> {prescription.dosage} •
                          <span className="font-medium ml-2">Frequency:</span> {prescription.frequency}
                          {prescription.duration && (
                            <span className="ml-2">
                              <span className="font-medium">Duration:</span> {prescription.duration}
                            </span>
                          )}
                        </div>
                        {prescription.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {prescription.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No prescriptions recorded.</p>
                )}
              </CardContent>
            </Card>

            {/* Lab Reports */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lab Reports ({details.labReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {details.labReports.length > 0 ? (
                  <div className="space-y-4">
                    {details.labReports.map((r) => {
                      const report = r as LabReportWithPKI;
                      return (
                        <div
                          key={report.id}
                          className="border rounded-lg overflow-hidden"
                        >
                        <div className="p-3 bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{report.report_name}</div>
                            <Badge variant="outline">
                              {getReportTypeLabel(report.report_type)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Created by: {report.created_by_account?.name || "Unknown"}
                            </span>
                            {report.checked_by_account && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                Verified by: {report.checked_by_account.name}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(report.report_date), "PPP")}
                          </div>
                        </div>

                        {/* For imaging reports with file URL */}
                        {report.file_url && (
                          <div className="p-3">
                            <a
                              href={report.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View Report File
                            </a>
                          </div>
                        )}

                        {/* Lab report items (for blood tests, etc.) */}
                        {report.items && report.items.length > 0 && (
                          <div className="p-3 border-t">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-muted-foreground">
                                  <th className="pb-2">Test</th>
                                  <th className="pb-2">Result</th>
                                  <th className="pb-2">Normal Range</th>
                                </tr>
                              </thead>
                              <tbody>
                                {report.items && report.items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="py-1">{item.test_name}</td>
                                    <td className={`py-1 ${item.is_abnormal ? "text-red-600 font-medium" : ""}`}>
                                      {item.result}
                                      {item.unit && <span className="text-muted-foreground ml-1">{item.unit}</span>}
                                      {item.is_abnormal && (
                                        <AlertTriangle className="h-3 w-3 inline ml-1" />
                                      )}
                                    </td>
                                    <td className="py-1 text-muted-foreground">
                                      {item.normal_range || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {report.notes && (
                          <div className="p-3 border-t text-sm">
                            <span className="text-muted-foreground">Notes: </span>
                            {report.notes}
                          </div>
                        )}

                        {/* Digital Signature QR */}
                        {report.signature && report.signer_hospital_id && (
                          <div className="p-3 border-t bg-slate-50 flex justify-center">
                            <ReportQRCode
                              reportId={report.id}
                              reportHash={report.report_hash || ""}
                              signature={report.signature}
                              hospitalId={report.signer_hospital_id}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No lab reports recorded.</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
