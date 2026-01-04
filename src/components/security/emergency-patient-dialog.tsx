"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Siren,
  AlertTriangle,
  ShieldAlert,
  Search,
  UserPlus,
} from "lucide-react";
import {
  searchPatientByNationalId,
  emergencyAccessByNationalId,
} from "@/app/actions/security.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EmergencyPatientDialogProps {
  trigger?: React.ReactNode;
}

export function EmergencyPatientDialog({
  trigger,
}: EmergencyPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    patient: {
      id: string;
      name: string | null;
      email: string | null;
      nationalIdNo: string | null;
    } | null;
  } | null>(null);
  const router = useRouter();

  const handleSearch = async () => {
    if (!nationalId.trim()) {
      toast.error("Please enter a National ID");
      return;
    }

    setSearching(true);
    try {
      const result = await searchPatientByNationalId(nationalId.trim());
      setSearchResult(result);

      if (result.found && result.patient) {
        toast.success(
          `Patient found: ${result.patient.name || "Name not set"}`,
          {
            description: result.patient.email || "No email on file",
          }
        );
      } else {
        toast.warning("Patient not found", {
          description: "You can create a minimal record for emergency access",
        });
      }
    } catch (e: unknown) {
      toast.error("Search failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleEmergencyAccess = async () => {
    if (!reason || !acknowledged || !nationalId) return;

    setLoading(true);
    try {
      const createIfNotFound = searchResult ? !searchResult.found : false;
      const result = await emergencyAccessByNationalId(
        nationalId.trim(),
        reason,
        createIfNotFound
      );

      if (result.success) {
        const message = result.wasCreated
          ? "Emergency Patient Created & Access Granted"
          : "Emergency Access Granted";
        const description = result.wasCreated
          ? `New patient record created. Access expires in 30 minutes. ID: ${result.grant.id}`
          : `Access granted for ${
              result.patient.name || "patient"
            }. Expires in 30 minutes. ID: ${result.grant.id}`;

        toast.error(message, {
          description,
          duration: 5000,
        });
        setOpen(false);
        router.refresh();
      }
    } catch (e: unknown) {
      toast.error("Failed to activate protocol", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setNationalId("");
    setReason("");
    setSearchResult(null);
    setAcknowledged(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetDialog();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" className="gap-2">
            <Siren className="w-4 h-4" /> Emergency Access
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-red-500 bg-red-50 dark:bg-red-950/20 sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-xl">
            <ShieldAlert className="w-6 h-6" /> EMERGENCY PATIENT ACCESS
          </DialogTitle>
          <DialogDescription className="text-red-800 dark:text-red-300 font-medium">
            Activate emergency protocol by National ID
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-white dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">
                  WARNING: THIS ACTION IS AUDITED.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Your identity and IP address will be logged immediately.
                  </li>
                  <li>
                    Hospital Administration and Medical Council will be
                    notified.
                  </li>
                  <li>
                    Misuse of this feature may result in license revocation.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* National ID Search */}
          <div className="space-y-2">
            <Label
              htmlFor="nationalId"
              className="text-red-900 dark:text-red-200"
            >
              Patient National ID Number
            </Label>
            <div className="flex gap-2">
              <Input
                id="nationalId"
                placeholder="Enter National ID..."
                value={nationalId}
                onChange={(e) => {
                  setNationalId(e.target.value);
                  setSearchResult(null); // Reset search result when ID changes
                }}
                className="border-red-300 dark:border-red-700 focus-visible:ring-red-500"
                disabled={loading}
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !nationalId.trim() || loading}
                variant="outline"
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                {searching ? "Searching..." : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Search Result Display */}
          {searchResult && (
            <div
              className={`p-3 rounded-md border ${
                searchResult.found
                  ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800 text-green-900 dark:text-green-300"
                  : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 dark:border-yellow-800 text-yellow-900 dark:text-yellow-300"
              }`}
            >
              {searchResult.found && searchResult.patient ? (
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Patient Found
                  </p>
                  <p className="text-sm mt-1">
                    Name: {searchResult.patient.name || "(Not set)"}
                  </p>
                  <p className="text-sm">
                    Email: {searchResult.patient.email || "(Not set)"}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold">Patient Not Found</p>
                  <p className="text-sm mt-1">
                    A minimal patient record will be created for emergency
                    access
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reason Input - only show after search */}
          {searchResult && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="reason"
                  className="text-red-900 dark:text-red-200"
                >
                  Medical Reason for Emergency Access
                </Label>
                <Input
                  id="reason"
                  placeholder="E.g. Patient unconscious, severe trauma, immediate history required..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="border-red-300 dark:border-red-700 focus-visible:ring-red-500"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="ack"
                  className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  disabled={loading}
                />
                <label
                  htmlFor="ack"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-900 dark:text-red-200"
                >
                  I acknowledge legal responsibility for this access.
                </label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            disabled={loading}
          >
            Cancel
          </Button>
          {searchResult && (
            <Button
              variant="destructive"
              onClick={handleEmergencyAccess}
              disabled={!reason || !acknowledged || loading}
              className="bg-red-600 hover:bg-red-700 font-bold"
            >
              {loading ? "Activating..." : "CONFIRM EMERGENCY ACCESS"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
