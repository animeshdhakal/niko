"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generatePatientSummary(patientId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1. Verify Access
  const { data: grant } = await supabase
    .from("access_grants")
    .select("id")
    .eq("doctor_id", user.id)
    .eq("patient_id", patientId)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!grant) {
    throw new Error("Access denied. No active grant found for this patient.");
  }

  // 2. Fetch Patient Data
  // A. Demographics
  const { data: patient } = await supabase
    .from("accounts")
    .select("name, created_at, role")
    .eq("id", patientId)
    .single();

  // B. Recent Appointments & Diagnoses
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      date,
      status,
      initial_symptoms,
      diagnosis,
      final_diagnosis,
      doctor_notes,
      doctor:accounts!appointments_doctor_id_fkey(name)
    `
    )
    .eq("user_id", patientId)
    .order("date", { ascending: false })
    .limit(5);

  // C. Abnormal Lab Reports
  // We explicitly join appointments to ensure we only get reports for this patient.

  const { data: reportsWithItems } = await supabase
    .from("lab_reports")
    .select(
      `
        report_name,
        report_date,
        appointment:appointments!inner(user_id),
        items:lab_report_items(*)
    `
    )
    .eq("appointment.user_id", patientId)
    .order("report_date", { ascending: false })
    .limit(5);

  // Filter for abnormal items
  interface LabItem {
    test_name: string;
    result: string;
    unit: string | null;
    is_abnormal: boolean;
    normal_range: string | null;
  }

  const abnormalFindings =
    reportsWithItems?.flatMap((r) =>
      (r.items as unknown as LabItem[])
        .filter((i) => i.is_abnormal)
        .map((i) => ({
          test: i.test_name,
          result: `${i.result} ${i.unit || ""}`,
          normal: i.normal_range,
          date: new Date(r.report_date).toLocaleDateString(),
        }))
    ) || [];

  // 3. Construct Prompt
  const prompt = `
    You are a clinical assistant AI. Summarize the medical history for patient ${
      patient?.name
    }.

    Patient Context:
    - Account Created: ${
      patient?.created_at
        ? new Date(patient.created_at).toLocaleDateString()
        : "Unknown"
    }

    Recent Appointments:
    ${appointments
      ?.map(
        (a) => `
    - ${new Date(a.date).toLocaleDateString()} (${a.status}): Dr. ${
          a.doctor?.name
        }
      Symptoms: ${a.initial_symptoms || "N/A"}
      Diagnosis: ${a.diagnosis || a.final_diagnosis || "N/A"}
    `
      )
      .join("\n")}

    Abnormal Lab Findings (Critical):
    ${
      abnormalFindings.length > 0
        ? abnormalFindings
            .map(
              (f) => `
    - ${f.date}: ${f.test} = ${f.result} (Normal: ${f.normal})
    `
            )
            .join("\n")
        : "No recent abnormal findings."
    }

    Instructions:
    1. Provide a concise clinical summary (max 150 words).
    2. Highlight any recurring symptoms or patterns.
    3. Explicitly mention any abnormal lab results that need attention.
    4. Use professional medical tone but accessible.
    5. Formatting: Do NOT use Markdown. Use plain text only. Use newlines to separate sections.
  `;

  // 4. Call Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { summary: response.text() };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(
      "Failed to generate AI summary. Please check API configuration."
    );
  }
}
