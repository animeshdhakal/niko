
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Siren, AlertTriangle, ShieldAlert } from "lucide-react";
import { activateBreakGlass } from "@/app/actions/security.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BreakGlassDialogProps {
  patientId: string;
  patientName: string;
  trigger?: React.ReactNode;
}

export function BreakGlassDialog({ patientId, patientName, trigger }: BreakGlassDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const router = useRouter();

  const handleBreakGlass = async () => {
    if (!reason || !acknowledged) return;

    setLoading(true);
    try {
      const result = await activateBreakGlass(patientId, reason);
      if (result.success) {
        toast.error("Emergency Protocol Activated. Admins have been notified.", {
            description: `Access granted for 30 minutes. ID: ${result.grant.id}`,
            duration: 5000,
        });
        setOpen(false);
        router.refresh();
      }
    } catch (e: unknown) {
      toast.error("Failed to activate protocol", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" className="gap-2">
            <Siren className="w-4 h-4" /> Emergency Access
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-red-500 bg-red-50 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-red-700 flex items-center gap-2 text-xl">
             <ShieldAlert className="w-6 h-6" /> BREAK-GLASS PROTOCOL
          </DialogTitle>
          <DialogDescription className="text-red-800 font-medium">
             You are initiating an EMERGENCY OVERRIDE for patient: {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
             <div className="bg-white p-4 rounded-md border border-red-200 text-sm text-red-700 shadow-sm">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold mb-1">WARNING: THIS ACTION IS AUDITED.</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Your identity and IP address will be logged immediately.</li>
                            <li>Hospital Administration and Medical Council will be notified.</li>
                            <li>Misuse of this feature may result in license revocation.</li>
                        </ul>
                    </div>
                </div>
             </div>

             <div className="space-y-2">
                <Label htmlFor="reason" className="text-red-900">Medical Reason for Override</Label>
                <Input
                    id="reason"
                    placeholder="E.g. Patient unconscious, severe trauma, immediate history required..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="border-red-300 focus-visible:ring-red-500"
                />
             </div>

             <div className="flex items-center space-x-2 pt-2">
                <input
                    type="checkbox"
                    id="ack"
                    className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                />
                <label
                  htmlFor="ack"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-900"
                >
                  I acknowledge legal responsibility for this access.
                </label>
             </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-900">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBreakGlass}
            disabled={!reason || !acknowledged || loading}
            className="bg-red-600 hover:bg-red-700 font-bold"
          >
            {loading ? "Activating..." : "CONFIRM OVERRIDE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
