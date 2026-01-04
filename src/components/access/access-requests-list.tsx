
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { approveAccess, rejectAccess } from "@/app/actions/access.actions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AccessRequest {
  id: string;
  doctor: {
    name: string | null;
    email: string;
  };
  created_at: string;
}

interface AccessRequestsListProps {
  requests: AccessRequest[];
}

export function AccessRequestsList({ requests }: AccessRequestsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (requests.length === 0) return null;

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveAccess(id);
      toast.success("Access granted for 3 days.");
      router.refresh();
    } catch (e: unknown) {
      toast.error("Failed to approve", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
        setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectAccess(id);
      toast.info("Request rejected.");
      router.refresh();
    } catch (e: unknown) {
      toast.error("Failed to reject", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 rounded-full">
            <Clock className="w-5 h-5 text-amber-600" />
        </div>
        <div>
            <h3 className="text-lg font-semibold tracking-tight text-gray-900">
                Access Requests
            </h3>
            <p className="text-sm text-muted-foreground">
                Doctors requesting access to your medical history
            </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((req) => (
          <Card key={req.id} className="group relative overflow-hidden transition-all hover:shadow-md border-muted">
            {/* Accent Bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

            <CardHeader className="pl-6 pb-2 space-y-1">
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">
                        {req.doctor.name || "Unknown Doctor"}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-amber-600 mt-0.5">
                        Requesting Access
                    </CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="pl-6 pb-3">
                <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Email:</span> {req.doctor.email}
                    </p>
                    <p className="flex items-center gap-2">
                         <span className="font-medium text-foreground">Date:</span> {new Date(req.created_at).toLocaleDateString()}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="pl-6 bg-muted/40 py-3 flex justify-between gap-3">
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -ml-2"
                onClick={() => handleReject(req.id)}
                disabled={processingId === req.id}
              >
                <XCircle className="w-4 h-4 mr-1.5" /> Decline
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white shadow-none"
                onClick={() => handleApprove(req.id)}
                disabled={processingId === req.id}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Access
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
