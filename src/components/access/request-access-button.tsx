
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileClock, Loader2 } from "lucide-react";
import { requestAccess } from "@/app/actions/access.actions";
import { toast } from "sonner";

interface RequestAccessButtonProps {
  patientId: string;
}

export function RequestAccessButton({ patientId }: RequestAccessButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      const result = await requestAccess(patientId);
      if (result.success) {
        toast.success(result.message || "Access request sent to patient.");
      }
    } catch (e: unknown) {
      toast.error("Failed to request access", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleRequest}
      disabled={loading}
      className="gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileClock className="w-4 h-4" />}
      Request History Access
    </Button>
  );
}
