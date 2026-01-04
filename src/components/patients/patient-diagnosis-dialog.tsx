"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateAppointmentDiagnosis } from "@/app/dashboard/patients/actions";

type PatientAppointment = {
  id: string;
  initial_symptoms: string | null;
  diagnosis: string | null;
  final_diagnosis: string | null;
  doctor_notes: string | null;
  patient: {
    name: string | null;
    national_id_no: string | null;
  } | null;
};

export function PatientDiagnosisDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<PatientAppointment | null>(null);
  const [formData, setFormData] = useState({
    initialSymptoms: "",
    diagnosis: "",
    finalDiagnosis: "",
    doctorNotes: "",
  });

  useEffect(() => {
    const handleOpen = (event: CustomEvent<PatientAppointment>) => {
      setAppointment(event.detail);
      setFormData({
        initialSymptoms: event.detail.initial_symptoms || "",
        diagnosis: event.detail.diagnosis || "",
        finalDiagnosis: event.detail.final_diagnosis || "",
        doctorNotes: event.detail.doctor_notes || "",
      });
      setOpen(true);
    };

    window.addEventListener("openDiagnosis", handleOpen as EventListener);
    return () => {
      window.removeEventListener("openDiagnosis", handleOpen as EventListener);
    };
  }, []);

  const handleSubmit = async () => {
    if (!appointment) return;

    setLoading(true);
    try {
      await updateAppointmentDiagnosis({
        appointmentId: appointment.id,
        initialSymptoms: formData.initialSymptoms || null,
        diagnosis: formData.diagnosis || null,
        finalDiagnosis: formData.finalDiagnosis || null,
        doctorNotes: formData.doctorNotes || null,
      });
      toast.success("Diagnosis updated successfully");
      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update diagnosis");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Patient Diagnosis</DialogTitle>
          <DialogDescription>
            {appointment?.patient?.name && (
              <span>
                Patient: <strong>{appointment.patient.name}</strong>
                {appointment.patient.national_id_no && (
                  <> • ID: {appointment.patient.national_id_no}</>
                )}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="initialSymptoms">Initial Symptoms</Label>
            <Textarea
              id="initialSymptoms"
              placeholder="Patient's reported symptoms..."
              value={formData.initialSymptoms}
              onChange={(e) =>
                setFormData({ ...formData, initialSymptoms: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="diagnosis">Preliminary Diagnosis</Label>
            <Textarea
              id="diagnosis"
              placeholder="Initial diagnosis based on examination..."
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="finalDiagnosis">Final Diagnosis</Label>
            <Textarea
              id="finalDiagnosis"
              placeholder="Confirmed diagnosis after tests/examination..."
              value={formData.finalDiagnosis}
              onChange={(e) =>
                setFormData({ ...formData, finalDiagnosis: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="doctorNotes">Doctor&apos;s Notes</Label>
            <Textarea
              id="doctorNotes"
              placeholder="Additional notes, recommendations, follow-up instructions..."
              value={formData.doctorNotes}
              onChange={(e) =>
                setFormData({ ...formData, doctorNotes: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
