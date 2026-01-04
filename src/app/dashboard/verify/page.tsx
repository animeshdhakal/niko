import { getSupabaseServerClient } from '@/lib/supabase/server-client';
import { verifySignature } from '@/lib/pki';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { id: reportId, s: signature, hid: hospitalId } = params as Record<string, string>;

  if (!reportId || !signature || !hospitalId) {
    return (
      <div className="container mx-auto max-w-md py-10">
        <Card className="border-red-200">
           <CardHeader>
             <CardTitle className="text-red-600 flex items-center gap-2">
               <XCircle /> Invalid Link
             </CardTitle>
           </CardHeader>
           <CardContent>
             Missing verification parameters.
           </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = await getSupabaseServerClient();

  // 1. Fetch Hospital Public Key
  const { data: hospitalData } = await supabase
    .from('hospitals')
    .select('name, public_key, certificate_pem')
    .eq('id', hospitalId)
    .single();

  const hospital = hospitalData as unknown as { name: string; public_key: string; certificate_pem: string };

  if (!hospital || !hospital.public_key) {
    return <VerificationResult valid={false} message="Issuer identity not found" />;
  }

  // 2. Fetch Report (To verify hash matches current data? Or just verify signature matches hash provided?)
  // Ideally, we fetch the REAL data and re-hash it to ensure it hasn't changed in DB either,
  // BUT the QR code verification is often about "Is this physical paper valid?".
  // If we just check the params, we prove the params were signed.
  // We should verify the report ID exists and the hash matches what's on record IF we have access.
  // For a public page, we might just verify the signature against the hash provided in URL,
  // implying "The signer testified to this hash".
  // But a better check is: Does this signature match the content?
  // We can't reconstructing the content from just a hash.
  // So we will just verify: "Hospital X signed this Hash Y". User must compare Hash Y (or content) with paper.

  // Actually, usually you verify the printed text.
  // Let's do: Verify signature against the payload (hash).

  // Note: pki.ts verifySignature takes (data, signature, publicKey).
  // The 'data' should be the payload that was signed. In our action `signLabReport`, we signed a JSON string.
  // Use `reportHash` from params as a proxy? No, we need the original data to verify the signature if the signature was over the DATA.
  // If the signature was over the HASH, then we can verify with just the hash.
  // In `signLabReport`:
  //   const hash = pki.hashData(payloadToSign);
  //   const signature = pki.signData(payloadToSign, ...);
  // We signed the payload, not the hash.
  // So we CANNOT verify the signature without the payload.
  // If the QR code only has the hash, we can't cryptographically verify the signature without fetching the report data.
  // So this page MUST fetch the report data.

  const { data: report } = await supabase
    .from('lab_reports')
    .select('*, lab_report_items(*)')
    .eq('id', reportId)
    .single();

  if (!report) {
     return <VerificationResult valid={false} message="Report not found in system" />;
  }

  // Reconstruct payload
  const payloadToSign = JSON.stringify({
    id: report.id,
    appointment_id: report.appointment_id,
    report_type: report.report_type,
    report_date: report.report_date,
    items: report.lab_report_items?.map((i: { test_name: string; result: string; unit: string | null }) => ({ t: i.test_name, r: i.result, u: i.unit || "" })),
  });

  const isValid = verifySignature(payloadToSign, signature, hospital.public_key);

  return (
    <div className="container mx-auto max-w-md py-10">
        <VerificationResult
          valid={isValid}
          hospitalName={hospital.name}
          reportDate={new Date(report.report_date).toLocaleDateString()}
          patientId={report.appointment_id} // Just showing ID for now, don't want to leak names publicly unless authorized
        />
    </div>
  );
}

interface VerificationResultProps {
  valid: boolean;
  message?: string;
  hospitalName?: string;
  reportDate?: string;
  patientId?: string;
}

function VerificationResult({
  valid,
  message,
  hospitalName,
  reportDate,
  patientId,
}: VerificationResultProps) {
  if (valid) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" /> Authenticated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-green-800">
            This document is valid and untampered.
          </p>
          <div className="bg-white p-3 rounded border border-green-100 text-sm">
            <p>
              <strong>Issuer:</strong> {hospitalName}
            </p>
            <p>
              <strong>Date:</strong> {reportDate}
            </p>
            <p>
              <strong>Ref:</strong> {patientId}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-700 flex items-center gap-2">
          <XCircle className="w-6 h-6" /> Verification Failed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-800">
          {message ||
            "Digital signature does not match the record. This document may be forged."}
        </p>
      </CardContent>
    </Card>
  );
}
