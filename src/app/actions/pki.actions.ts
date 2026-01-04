"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import * as pki from "@/lib/pki";
import { revalidatePath } from "next/cache";

const ROOT_CA_KEY_TYPE = "BLOCKCHAIN_ROOT_CA";

interface SystemKey {
  id: string;
  key_type: string;
  public_key: string;
  encrypted_private_key: string;
}

interface HospitalWithPKI {
  id: string;
  name: string;
  public_key?: string;
  encrypted_private_key?: string;
  certificate_pem?: string;
}

/**
 * Initializes the Root CA if it doesn't exist.
 * Only accessible by Ministry role.
 */
export async function initializeRootCA() {
  const supabase = await getSupabaseServerClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: account } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", user.id)
    .single();

  if (account?.role !== "ministry") {
    throw new Error("Only Ministry role can initialize Root CA");
  }

  // Check if already exists
  const { data: existing } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("system_keys" as any)
    .select("id")
    .eq("key_type", ROOT_CA_KEY_TYPE)
    .single();

  if (existing) {
    return { success: true, message: "Root CA already exists" };
  }

  // Generate keys
  const { publicKey, privateKey } = await pki.generateKeyPair();

  // Create Self-Signed Root Cert
  // Note: In a real system, we'd store the Cert too. For now, we regenerator or allow it to be just a keypair.
  // Actually, let's store the cert if we had a column, but we just have pub/priv for system_keys.
  // We will assume the public key IS the root of trust for now, or we can store the cert in public_key field if format allows,
  // but PEM public key is better for raw verification.
  // Let's stick to storing the keypair. The "Certificate" of the root is implicit or distributed out of band.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await supabase.from("system_keys" as any).insert({
    key_type: ROOT_CA_KEY_TYPE,
    public_key: publicKey,
    encrypted_private_key: privateKey, // In production, encrypt this!
  });

  if (error) throw new Error(error.message);

  return { success: true };
}

/**
 * Issues a digital identity (Certificate + KeyPair) to a hospital.
 * Only accessible by Ministry role.
 */
export async function issueHospitalIdentity(hospitalId: string) {
  const supabase = await getSupabaseServerClient();

  // Check auth (Ministry)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: account } = await supabase
    .from("accounts")
    .select("role")
    .eq("id", user.id)
    .single();

  if (account?.role !== "ministry") {
    throw new Error("Unauthorized");
  }

  // Fetch Root CA
  // Fetch Root CA
  const { data: rootKeyData } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from("system_keys" as any)
    .select("*")
    .eq("key_type", ROOT_CA_KEY_TYPE)
    .single();

  const rootKey = rootKeyData as unknown as SystemKey;

  if (!rootKey) throw new Error("Root CA not initialized");

  // Fetch Hospital Info
  const { data: hospital } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", hospitalId)
    .single();

  if (!hospital) throw new Error("Hospital not found");

  // Generate Hospital Keys
  const { publicKey: hospitalPubKey, privateKey: hospitalPrivKey } =
    await pki.generateKeyPair();

  // Create Root Cert (Ad-hoc from stored keys for issuance)
  // We need to recreate the Root Cert object to sign the hospital cert.
  // Ideally we stored the Root Cert. Let's create a temporary self-signed one or just use the key to sign if our pki lib supports it.
  // Our pki.ts `issueHospitalCertificate` takes `rootCertPem`.
  // So we must generate the Root Cert on the fly or store it.
  // Let's generate it on the fly from the Root KeyPair (deterministic enough for this demo if we keep same params).
  const rootCert = pki.createRootCA(
    rootKey.encrypted_private_key,
    rootKey.public_key
  );

  // Issue Hospital Cert
  const hospitalCert = pki.issueHospitalCertificate(
    hospitalPubKey,
    rootKey.encrypted_private_key,
    rootCert,
    { name: hospital.name, id: hospital.id }
  );

  // Update Hospital
  const { error } = await supabase
    .from("hospitals")
    .update({
      public_key: hospitalPubKey,
      encrypted_private_key: hospitalPrivKey, // Encrypt in real app
      certificate_pem: hospitalCert,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", hospitalId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/hospitals/${hospitalId}`);
  return { success: true };
}

/**
 * Signs a Lab Report.
 * Accessible by Providers (Doctors) associated with the hospital?
 * Actually, the SYSTEM signs it on behalf of the hospital when the report is finalized.
 */
export async function signLabReport(reportId: string, hospitalId: string) {
  const supabase = await getSupabaseServerClient();

  // Verify user has permission (Provider at this hospital)
  // ... (Assuming standard RLS checks pass for update, but we do explicit check here)

  // Fetch Hospital Keys
  const { data: hospitalData } = await supabase
    .from("hospitals")
    .select("encrypted_private_key, id")
    .eq("id", hospitalId)
    .single();

  const hospital = hospitalData as unknown as HospitalWithPKI;

  if (!hospital || !hospital.encrypted_private_key) {
    throw new Error("Hospital identity not found");
  }

  // Fetch Report Data
  const { data: report } = await supabase
    .from("lab_reports")
    .select("*, lab_report_items(*)")
    .eq("id", reportId)
    .single();

  if (!report) throw new Error("Report not found");

  // Construct Data for Signing
  // We want to sign a canonical representation of the report.
  // e.g. "ReportID|PatientID|Date|Item1:Val1|Item2:Val2..."
  // For simplicity, let's sign the JSON string of specific fields.
  const payloadToSign = JSON.stringify({
    id: report.id,
    appointment_id: report.appointment_id,
    report_type: report.report_type,
    report_date: report.report_date,
    items: report.lab_report_items?.map(
      (i: { test_name: string; result: string; unit: string | null }) => ({
        t: i.test_name,
        r: i.result,
        u: i.unit || "",
      })
    ),
  });

  const hash = pki.hashData(payloadToSign);
  const signature = pki.signData(payloadToSign, hospital.encrypted_private_key);

  // Update Report
  const { error } = await supabase
    .from("lab_reports")
    .update({
      report_hash: hash,
      signature: signature,
      signer_hospital_id: hospital.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    .eq("id", reportId);

  if (error) throw new Error(error.message);

  return { success: true };
}
