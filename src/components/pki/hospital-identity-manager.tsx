'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { issueHospitalIdentity } from '@/app/actions/pki.actions';
import { toast } from 'sonner';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface HospitalIdentityManagerProps {
  hospitalId: string;
  hasIdentity: boolean;
}

export function HospitalIdentityManager({ hospitalId, hasIdentity }: HospitalIdentityManagerProps) {
  const [loading, setLoading] = useState(false);

  const handleIssueIdentity = async () => {
    try {
      setLoading(true);
      await issueHospitalIdentity(hospitalId);
      toast.success('Digital Identity Issued Successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to issue identity';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (hasIdentity) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
        <ShieldCheck className="w-5 h-5" />
        <span className="font-medium">Digital Identity Verified</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-yellow-50 px-4 py-3 rounded-md border border-yellow-200">
      <div className="flex items-center gap-2 text-yellow-700">
        <ShieldAlert className="w-5 h-5" />
        <span className="font-medium">No Digital Identity</span>
      </div>
      <Button
        onClick={handleIssueIdentity}
        disabled={loading}
        variant="outline"
        className="ml-auto"
      >
        {loading ? 'Issuing...' : 'Issue Identity'}
      </Button>
    </div>
  );
}
