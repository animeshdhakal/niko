
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"
  import { FileText, Eye, CheckCircle2, XCircle } from "lucide-react"
  import QRCode from "react-qr-code";
  import Link from "next/link";
  import { LabReport } from "./columns"; // We will update columns.tsx to export this type with more fields or define it here if circular dep issues

  export function LabReportDialog({ report }: { report: LabReport }) {
    const isSigned = !!report.signature && !!report.signer_hospital_id && !!report.id;
    let verificationLink = "";

    if (isSigned) {
         const params = new URLSearchParams({
            id: report.id,
            s: report.signature || "",
            hid: report.signer_hospital_id || "",
          });
          // Assuming window.location.origin is not available on server, but this is a client component
          // We can use a relative path or strict absolute path if we knew the domain.
          // For now, let's use relative for the link text but we might need absolute for QR code if it's scanned by external device?
          // Actually QR code usually contains the full URL.
          // Since we are in a browser, we can use window.location.origin, but hydration mismatch might occur.
          // Safer to just assume generic or construct it in useEffect.
          // For now let's use a hardcoded domain or just relative path for the Link component,
          // but for QR code we probably want full URL.

          // Let's just use the relative path for display purposes or a "valid" string.
          verificationLink = `/dashboard/verify?${params.toString()}`;
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {report.report_name}
            </DialogTitle>
            <DialogDescription>
                Report generated on {new Date(report.report_date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                  <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Status</p>
                      <div className="pt-1">
                        {isSigned ? (
                           <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                                <CheckCircle2 className="w-3 h-3"/> Digitally Signed
                           </Badge>
                        ) : (
                            <Badge variant="outline" className="gap-1 text-gray-500">
                                <XCircle className="w-3 h-3"/> Unsigned
                            </Badge>
                        )}
                      </div>
                  </div>
                  <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Type</p>
                      <p className="text-sm text-muted-foreground capitalize">{report.report_type.replace('_', ' ')}</p>
                  </div>
                  <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Result</p>
                       {/* This implies we need to see items. The basic report view might not have them unless we fetched them.
                           The `getLabReports` action fetches `*, lab_report_items(*)`.
                           So likely `report.lab_report_items` is available.
                       */}
                      <p className="text-sm text-muted-foreground">{report.lab_report_items?.length || 0} items</p>
                  </div>
              </div>

              {/* Items List */}
              {report.lab_report_items && report.lab_report_items.length > 0 && (
                <div className="border rounded-md p-4 bg-muted/50 text-sm space-y-2">
                    <div className="font-semibold grid grid-cols-2">
                        <span>Test</span>
                        <span className="text-right">Result</span>
                    </div>
                    {report.lab_report_items.map((item, i) => (
                        <div key={i} className="grid grid-cols-2 border-t pt-2 mt-2">
                            <span>{item.test_name}</span>
                            <span className="text-right font-mono">
                                {item.result} {item.unit}
                                {item.is_abnormal && <span className="text-red-500 ml-2 text-xs">(Abnormal)</span>}
                            </span>
                        </div>
                    ))}
                </div>
              )}

              {isSigned && (
                  <div className="mt-4 p-4 border rounded-lg bg-white flex flex-col md:flex-row gap-6 items-center">
                      <div className="bg-white p-2 rounded border shadow-sm">
                          <QRCode
                              size={128}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              value={typeof window !== 'undefined' ? `${window.location.origin}${verificationLink}` : verificationLink}
                              viewBox={`0 0 128 128`}
                          />
                      </div>
                      <div className="flex-1 space-y-2 text-center md:text-left">
                          <h4 className="font-semibold text-sm">Verification Code</h4>
                          <p className="text-xs text-muted-foreground break-all">
                             Scan the QR code or use the link below to verify the authenticity of this report.
                          </p>
                           <Link href={verificationLink} target="_blank" className="text-xs text-blue-600 underline break-all block">
                              Open Verification Page
                           </Link>
                      </div>
                  </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
