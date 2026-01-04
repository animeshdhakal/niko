"use client";

import { useState } from "react";
import { generatePatientSummary } from "@/app/actions/ai.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PatientAiSummaryProps {
  patientId: string;
}

export function PatientAiSummary({ patientId }: PatientAiSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generatePatientSummary(patientId);
      setSummary(result.summary);
      toast.success("AI Summary Generated");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate summary");
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 shadow-sm mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-full">
                <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
          <CardTitle className="text-lg font-bold text-indigo-900">
            AI Clinical Summary
          </CardTitle>
        </div>
        {!summary && !loading && (
          <Button
            onClick={handleGenerate}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Summary
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading && (
            <div className="flex flex-col items-center justify-center py-6 text-indigo-600">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm font-medium animate-pulse">Analyzing medical records...</p>
            </div>
        )}

        {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md border border-red-100 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}

        {summary && (
          <div className="prose prose-sm max-w-none text-indigo-900/80">
            <div className="whitespace-pre-line leading-relaxed">
              {summary}
            </div>
            <div className="mt-4 flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    className="text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
                >
                    <Sparkles className="w-3 h-3 mr-1" /> Regenerate
                </Button>
            </div>
          </div>
        )}

        {!summary && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mb-2 text-indigo-200" />
                <p className="text-sm">
                    Click generate to analyze patient history and lab reports.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
