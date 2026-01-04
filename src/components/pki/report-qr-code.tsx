'use client';

import QRCode from 'react-qr-code';

interface ReportQRCodeProps {
  reportId: string;
  reportHash: string;
  signature: string;
  hospitalId: string;
}

export function ReportQRCode({ reportId, reportHash, signature, hospitalId }: ReportQRCodeProps) {
  // Construct a small payload for the QR
  // Format: "v1|reportId|hashPrefix|signaturePrefix..."
  // Or just a URL to verify page
  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify?id=${reportId}&h=${reportHash}&s=${signature}&hid=${hospitalId}`;

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border w-fit">
      <QRCode value={verificationUrl} size={128} />
      <span className="text-xs text-muted-foreground font-mono">Scan to Verify</span>
    </div>
  );
}
