import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { Database } from "../src/lib/database.types";
import {
  generateKeyPair,
  createRootCA,
  issueHospitalCertificate,
  hashData,
  signData,
} from "../src/lib/pki";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function seedPKI() {
  console.log("Seeding PKI (Root CA & Hospital Identities)...");

  // 1. Initialize Root CA
  const ROOT_CA_KEY_TYPE = "BLOCKCHAIN_ROOT_CA";
  let rootKey: { public_key: string; encrypted_private_key: string } | null =
    null;

  const { data: existingRoot } = await supabase
    .from("system_keys")
    .select("*")
    .eq("key_type", ROOT_CA_KEY_TYPE)
    .maybeSingle();

  if (existingRoot) {
    console.log("Root CA already exists.");
    rootKey = existingRoot;
  } else {
    console.log("Creating Root CA...");
    const { publicKey, privateKey } = await generateKeyPair();
    const { data: newRoot, error } = await supabase
      .from("system_keys")
      .insert({
        key_type: ROOT_CA_KEY_TYPE,
        public_key: publicKey,
        encrypted_private_key: privateKey,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating Root CA:", error);
      return;
    }
    rootKey = newRoot;
    console.log("Root CA created.");
  }

  if (!rootKey) return;

  // 2. Issue Identity to TUTH (Tribhuvan University Teaching Hospital)
  const { data: hospital } = await supabase
    .from("hospitals")
    .select("*")
    .eq("name", "Tribhuvan University Teaching Hospital")
    .single();

  if (!hospital) {
    console.error("TUTH Hospital not found for PKI seeding.");
    return;
  }

  if (hospital.public_key && hospital.certificate_pem) {
    console.log("TUTH already has PKI identity.");
  } else {
    console.log("Issuing PKI Identity to TUTH...");
    const { publicKey: hospitalPubKey, privateKey: hospitalPrivKey } =
      await generateKeyPair();

    // Create Root Cert object to sign
    const rootCert = createRootCA(
      rootKey.encrypted_private_key,
      rootKey.public_key
    );

    const hospitalCert = issueHospitalCertificate(
      hospitalPubKey,
      rootKey.encrypted_private_key,
      rootCert,
      { name: hospital.name, id: hospital.id }
    );

    const { error: updateError } = await supabase
      .from("hospitals")
      .update({
        public_key: hospitalPubKey,
        encrypted_private_key: hospitalPrivKey,
        certificate_pem: hospitalCert,
      })
      .eq("id", hospital.id);

    if (updateError) {
      console.error("Error updating hospital PKI:", updateError);
    } else {
      console.log("Issued Identity to TUTH.");
    }
  }
}

async function seedHospitalsAndDepartments() {
  console.log("Checking if hospitals already exist...");

  // Check if TUTH already exists
  const { data: existing } = await supabase
    .from("hospitals")
    .select("id")
    .eq("name", "Tribhuvan University Teaching Hospital")
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log(
      "Hospitals appear to be already seeded. Skipping hospital creation."
    );
    return;
  }

  console.log("Seeding hospitals and departments...");

  // Hospitals
  const hospitals = [
    {
      name: "Koshi Hospital",
      latitude: 26.8065,
      longitude: 87.2846,
      contact_number: "+977-21-520111",
      email: "info@koshihospital.gov.np",
      province: "Province 1",
      district: "Morang",
      city: "Biratnagar",
    },
    {
      name: "Koshi Hospital",
      latitude: 26.8065,
      longitude: 87.2846,
      contact_number: "+977-21-520111",
      email: "info@koshihospital.gov.np",
      province: "Province 1",
      district: "Morang",
      city: "Biratnagar",
    },
    {
      name: "B.P. Koirala Institute of Health Sciences",
      latitude: 26.8147,
      longitude: 87.2857,
      contact_number: "+977-21-525555",
      email: "info@bpkihs.edu",
      province: "Province 1",
      district: "Sunsari",
      city: "Dharan",
    },
    {
      name: "Mechi Zonal Hospital",
      latitude: 26.6664,
      longitude: 87.9833,
      contact_number: "+977-23-520111",
      email: "info@mechihospital.gov.np",
      province: "Province 1",
      district: "Jhapa",
      city: "Bhadrapur",
    },
    {
      name: "Nobel Medical College",
      latitude: 26.8088,
      longitude: 87.2809,
      contact_number: "+977-21-460114",
      email: "info@nobelmedical.edu.np",
      province: "Province 1",
      district: "Morang",
      city: "Biratnagar",
    },
    {
      name: "Narayani Hospital",
      latitude: 27.0657,
      longitude: 84.8819,
      contact_number: "+977-56-520111",
      email: "info@narayanihospital.gov.np",
      province: "Madhesh Province",
      district: "Parsa",
      city: "Birgunj",
    },
    {
      name: "Janaki Medical College",
      latitude: 26.7318,
      longitude: 85.9332,
      contact_number: "+977-41-520333",
      email: "info@janakimedical.edu.np",
      province: "Madhesh Province",
      district: "Dhanusha",
      city: "Janakpur",
    },
    {
      name: "Provincial Hospital Janakpur",
      latitude: 26.7288,
      longitude: 85.9261,
      contact_number: "+977-41-520222",
      email: "info@provincialhospital.gov.np",
      province: "Madhesh Province",
      district: "Dhanusha",
      city: "Janakpur",
    },
    {
      name: "Tribhuvan University Teaching Hospital",
      latitude: 27.735,
      longitude: 85.3281,
      contact_number: "+977-1-4412404",
      email: "info@tuth.edu.np",
      province: "Bagmati Province",
      district: "Kathmandu",
      city: "Kathmandu",
    },
    {
      name: "Bir Hospital",
      latitude: 27.7054,
      longitude: 85.3127,
      contact_number: "+977-1-4221988",
      email: "info@birhospital.gov.np",
      province: "Bagmati Province",
      district: "Kathmandu",
      city: "Kathmandu",
    },
    {
      name: "Patan Hospital",
      latitude: 27.6681,
      longitude: 85.3206,
      contact_number: "+977-1-5522266",
      email: "info@patanhospital.gov.np",
      province: "Bagmati Province",
      district: "Lalitpur",
      city: "Lalitpur",
    },
    {
      name: "Kathmandu Medical College",
      latitude: 27.6802,
      longitude: 85.3423,
      contact_number: "+977-1-4476105",
      email: "info@kmc.edu.np",
      province: "Bagmati Province",
      district: "Kathmandu",
      city: "Kathmandu",
    },
    {
      name: "Nepal Medical College",
      latitude: 27.7382,
      longitude: 85.3372,
      contact_number: "+977-1-4911008",
      email: "info@nmc.edu.np",
      province: "Bagmati Province",
      district: "Kathmandu",
      city: "Kathmandu",
    },
    {
      name: "KIST Medical College",
      latitude: 27.6677,
      longitude: 85.4416,
      contact_number: "+977-1-6636199",
      email: "info@kist.edu.np",
      province: "Bagmati Province",
      district: "Lalitpur",
      city: "Imadol",
    },
    {
      name: "Civil Service Hospital",
      latitude: 27.6935,
      longitude: 85.3206,
      contact_number: "+977-1-4107000",
      email: "info@civilhospital.gov.np",
      province: "Bagmati Province",
      district: "Kathmandu",
      city: "Kathmandu",
    },
    {
      name: "Grande International Hospital",
      latitude: 27.6868,
      longitude: 85.3328,
      contact_number: "+977-1-5159266",
      email: "info@grandehospital.com",
      province: "Bagmati Province",
      district: "Kathmandu",
      city: "Kathmandu",
    },
    {
      name: "Norvic International Hospital",
      latitude: 27.6902,
      longitude: 85.3194,
      contact_number: "+977-1-4258554",
      email: "info@norvichospital.com",
      province: "Bagmati Province",
      district: "Kathmandu",
      city: "Kathmandu",
    },
    {
      name: "Om Hospital",
      latitude: 27.6781,
      longitude: 85.3186,
      contact_number: "+977-1-5260404",
      email: "info@omhospital.com.np",
      province: "Bagmati Province",
      district: "Lalitpur",
      city: "Chabahil",
    },
    {
      name: "Bharatpur Hospital",
      latitude: 27.6766,
      longitude: 84.4322,
      contact_number: "+977-56-520111",
      email: "info@bharatpurhospital.gov.np",
      province: "Bagmati Province",
      district: "Chitwan",
      city: "Bharatpur",
    },
    {
      name: "College of Medical Sciences",
      latitude: 27.6678,
      longitude: 84.4301,
      contact_number: "+977-56-524326",
      email: "info@coms.edu.np",
      province: "Bagmati Province",
      district: "Chitwan",
      city: "Bharatpur",
    },
    {
      name: "Chitwan Medical College",
      latitude: 27.6588,
      longitude: 84.4677,
      contact_number: "+977-56-532933",
      email: "info@cmcnepal.edu.np",
      province: "Bagmati Province",
      district: "Chitwan",
      city: "Bharatpur",
    },
    {
      name: "Gandaki Medical College",
      latitude: 28.214,
      longitude: 83.9856,
      contact_number: "+977-61-561497",
      email: "info@gmc.edu.np",
      province: "Gandaki Province",
      district: "Kaski",
      city: "Pokhara",
    },
    {
      name: "Western Regional Hospital",
      latitude: 28.2096,
      longitude: 83.9856,
      contact_number: "+977-61-520066",
      email: "info@westernhospital.gov.np",
      province: "Gandaki Province",
      district: "Kaski",
      city: "Pokhara",
    },
    {
      name: "Manipal Teaching Hospital",
      latitude: 28.218,
      longitude: 83.975,
      contact_number: "+977-61-526416",
      email: "info@manipal.edu.np",
      province: "Gandaki Province",
      district: "Kaski",
      city: "Pokhara",
    },
    {
      name: "Fishtail Hospital",
      latitude: 28.22,
      longitude: 83.988,
      contact_number: "+977-61-465068",
      email: "info@fishtailhospital.com",
      province: "Gandaki Province",
      district: "Kaski",
      city: "Pokhara",
    },
    {
      name: "Bheri Zonal Hospital",
      latitude: 28.4907,
      longitude: 81.6438,
      contact_number: "+977-81-520111",
      email: "info@bherihospital.gov.np",
      province: "Lumbini Province",
      district: "Banke",
      city: "Nepalgunj",
    },
    {
      name: "Lumbini Medical College",
      latitude: 27.4934,
      longitude: 83.4628,
      contact_number: "+977-71-440100",
      email: "info@lmc.edu.np",
      province: "Lumbini Province",
      district: "Rupandehi",
      city: "Palpa",
    },
    {
      name: "Universal College of Medical Sciences",
      latitude: 27.6888,
      longitude: 83.4628,
      contact_number: "+977-71-583111",
      email: "info@ucms.edu.np",
      province: "Lumbini Province",
      district: "Rupandehi",
      city: "Bhairahawa",
    },
    {
      name: "Lumbini Provincial Hospital",
      latitude: 27.5142,
      longitude: 83.4633,
      contact_number: "+977-71-520111",
      email: "info@lumbinihospital.gov.np",
      province: "Lumbini Province",
      district: "Rupandehi",
      city: "Butwal",
    },
    {
      name: "Karnali Academy of Health Sciences",
      latitude: 29.299,
      longitude: 81.611,
      contact_number: "+977-89-520166",
      email: "info@kahs.edu.np",
      province: "Karnali Province",
      district: "Surkhet",
      city: "Jumla",
    },
    {
      name: "Mid-Western Regional Hospital",
      latitude: 28.6002,
      longitude: 81.6303,
      contact_number: "+977-83-520111",
      email: "info@midwesternhospital.gov.np",
      province: "Karnali Province",
      district: "Surkhet",
      city: "Birendranagar",
    },
    {
      name: "Seti Zonal Hospital",
      latitude: 28.6974,
      longitude: 80.5892,
      contact_number: "+977-91-521100",
      email: "info@setihospital.gov.np",
      province: "Sudurpashchim Province",
      district: "Kailali",
      city: "Dhangadhi",
    },
    {
      name: "Far Western Regional Hospital",
      latitude: 28.9631,
      longitude: 80.1659,
      contact_number: "+977-99-520111",
      email: "info@farwesternhospital.gov.np",
      province: "Sudurpashchim Province",
      district: "Kanchanpur",
      city: "Mahendranagar",
    },
  ];

  // Upsert hospitals
  const { data: upsertedHospitals, error: hospitalError } = await supabase
    .from("hospitals")
    .insert(hospitals)
    .select();

  if (hospitalError) {
    console.error("Error seeding hospitals:", hospitalError);
    return;
  }

  console.log(`Seeded ${upsertedHospitals.length} hospitals.`);

  // Departments for TUTH
  const tuth = upsertedHospitals.find(
    (h) => h.name === "Tribhuvan University Teaching Hospital"
  );
  if (tuth) {
    const departments = [
      "Emergency",
      "General Medicine",
      "Cardiology",
      "Orthopedics",
      "Pediatrics",
      "Gynecology & Obstetrics",
      "General Surgery",
      "Neurology",
      "Dermatology",
      "ENT",
      "Ophthalmology",
      "Psychiatry",
    ];

    const departmentData = departments.map((name) => ({
      hospital_id: tuth.id,
      name: name,
    }));

    const { error: deptError } = await supabase
      .from("hospital_departments")
      .insert(departmentData);

    if (deptError) {
      console.error("Error upserting departments:", deptError);
    }

    console.log(`Seeded departments for TUTH.`);
  }
}

async function seedUsers() {
  console.log("Seeding users...");

  const users = [
    {
      email: "animesh@animesh.com",
      nationalIdNo: "1234567890",
      password: "animesh",
      role: "citizen",
      user_metadata: {
        name: "Animesh",
        role: "citizen",
      },
    },
    {
      email: "doctor@doctor.com",
      nationalIdNo: "9876543210",
      password: "animesh",
      role: "doctor",
      user_metadata: {
        name: "Dr Ganga",
        role: "doctor",
      },
    },
  ];

  for (const userData of users) {
    const { data: user, error: createError } =
      await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: userData.user_metadata,
      });

    if (createError) {
      console.error(
        `Error creating user ${userData.email}:`,
        createError.message
      );
      continue;
    }

    if (user.user) {
      console.log(`Created auth user: ${userData.email} (${user.user.id})`);

      // Create profile in accounts table
      const accountData: Database["public"]["Tables"]["accounts"]["Insert"] = {
        id: user.user.id,
        email: userData.email,
        name: userData.user_metadata.name,
        role: userData.role as Database["public"]["Enums"]["user_role"],
        national_id_no: userData.nationalIdNo,
      };

      // Special handling for doctor to add department info
      if (userData.role === "doctor") {
        const { data: tuth } = await supabase
          .from("hospitals")
          .select("id")
          .eq("name", "Tribhuvan University Teaching Hospital")
          .single();

        if (tuth) {
          const { data: dept } = await supabase
            .from("hospital_departments")
            .select("id")
            .eq("hospital_id", tuth.id)
            .eq("name", "General Medicine")
            .single();

          if (dept) {
            accountData.hospital_department_id = dept.id;
          }
        }
      }

      const { error: profileError } = await supabase
        .from("accounts")
        .upsert(accountData, { onConflict: "id" });

      if (profileError) {
        console.error(
          `Error creating profile for ${userData.email}:`,
          profileError.message
        );
      } else {
        console.log(`Created account profile for: ${userData.email}`);
      }
    }
  }
}

async function seedAppointmentsAndMedicalRecords() {
  console.log("Seeding appointments and medical records...");

  // Fetch necessary IDs
  const { data: patient } = await supabase.auth.admin.listUsers();
  const patientUser = patient.users.find(
    (u) => u.email === "animesh@animesh.com"
  );
  const doctorUser = patient.users.find((u) => u.email === "doctor@doctor.com");

  if (!patientUser || !doctorUser) {
    console.error("Patient or Doctor user not found. Skipping appointments.");
    return;
  }

  const { data: hospital, error: hospError } = await supabase
    .from("hospitals")
    .select("id")
    .eq("name", "Tribhuvan University Teaching Hospital")
    .limit(1)
    .single();

  if (hospError || !hospital) {
    console.error("Hospital not found or error fetching:", hospError);
    return;
  }

  const { data: dept } = await supabase
    .from("hospital_departments")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("name", "General Medicine")
    .single();

  if (!dept) {
    console.error("Department not found.");
    return;
  }

  // Create Completed Appointment
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() - 2); // 2 days ago

  const { data: appointment, error: appError } = await supabase
    .from("appointments")
    .insert({
      user_id: patientUser.id,
      doctor_id: doctorUser.id,
      hospital_id: hospital.id,
      department_id: dept.id,
      date: appointmentDate.toISOString(),
      status: "completed",
      reason: "Persistent fever and fatigue",
      initial_symptoms:
        "High fever (102°F), severe body ache, fatigue, loss of appetite since 3 days.",
      diagnosis: "Suspected Viral Fever / Typhoid",
      final_diagnosis: "Typhoid Fever",
      doctor_notes:
        "Patient advised rest and hydration. Antibiotics prescribed. Review after 5 days.",
    })
    .select()
    .single();

  if (appError) {
    console.error("Error creating appointment:", appError);
    return;
  }
  console.log("Created appointment:", appointment.id);

  // Create Prescriptions
  const prescriptions = [
    {
      appointment_id: appointment.id,
      medicine_name: "Cefixime 200mg",
      dosage: "1 tablet",
      frequency: "Twice daily (BD)",
      duration: "7 days",
      notes: "Take after food",
    },
    {
      appointment_id: appointment.id,
      medicine_name: "Paracetamol 500mg",
      dosage: "1 tablet",
      frequency: "SOS (As needed for fever > 100°F)",
      duration: "5 days",
      notes: "Max 4 tablets per day",
    },
    {
      appointment_id: appointment.id,
      medicine_name: "Pantoprazole 40mg",
      dosage: "1 tablet",
      frequency: "Once daily (OD)",
      duration: "7 days",
      notes: "Take empty stomach in morning",
    },
  ];

  const { error: prescError } = await supabase
    .from("prescriptions")
    .insert(prescriptions);

  if (prescError) console.error("Error creating prescriptions:", prescError);
  else console.log("Seeded prescriptions");

  // Create Lab Report (Blood Test)
  const { data: labReport, error: reportError } = await supabase
    .from("lab_reports")
    .insert({
      appointment_id: appointment.id,
      report_type: "blood_test",
      report_name: "Complete Blood Count (CBC) & Widal Test",
      notes: "Widal test positive. Low Hemoglobin.",
      created_by: doctorUser.id,
      checked_by: doctorUser.id,
      report_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (reportError) {
    console.error("Error creating lab report:", reportError);
    return;
  }
  console.log("Created lab report:", labReport.id);

  // Create Lab Report Items
  const reportItems = [
    {
      lab_report_id: labReport.id,
      test_name: "Hemoglobin",
      result: "10.5",
      unit: "g/dL",
      normal_range: "13.0 - 17.0",
      is_abnormal: true,
    },
    {
      lab_report_id: labReport.id,
      test_name: "Total Leukocyte Count (TLC)",
      result: "12,000",
      unit: "/cumm",
      normal_range: "4,000 - 11,000",
      is_abnormal: true,
    },
    {
      lab_report_id: labReport.id,
      test_name: "Platelet Count",
      result: "250,000",
      unit: "/cumm",
      normal_range: "150,000 - 450,000",
      is_abnormal: false,
    },
    {
      lab_report_id: labReport.id,
      test_name: "Neutrophils",
      result: "75",
      unit: "%",
      normal_range: "40 - 70",
      is_abnormal: true,
    },
    {
      lab_report_id: labReport.id,
      test_name: "Lymphocytes",
      result: "20",
      unit: "%",
      normal_range: "20 - 40",
      is_abnormal: false,
    },
    {
      lab_report_id: labReport.id,
      test_name: "Salmonella Typhi O",
      result: "1:160",
      unit: null,
      normal_range: "< 1:80",
      is_abnormal: true,
    },
    {
      lab_report_id: labReport.id,
      test_name: "Salmonella Typhi H",
      result: "1:160",
      unit: null,
      normal_range: "< 1:80",
      is_abnormal: true,
    },
  ];

  const { error: itemsError } = await supabase
    .from("lab_report_items")
    .insert(reportItems);

  if (itemsError) console.error("Error creating lab report items:", itemsError);
  else console.log("Seeded lab report items");

  // Sign the report fully now that items are in
  const { data: hospitalWithKeys } = await supabase
    .from("hospitals")
    .select("encrypted_private_key, id")
    .eq("id", hospital.id)
    .single();

  if (hospitalWithKeys?.encrypted_private_key) {
    const payloadToSign = JSON.stringify({
      id: labReport.id,
      appointment_id: labReport.appointment_id,
      report_type: labReport.report_type,
      report_date: labReport.report_date,
      items: reportItems.map((i) => ({
        t: i.test_name,
        r: i.result,
        u: i.unit || "",
      })),
    });

    const hash = hashData(payloadToSign);
    const signature = signData(
      payloadToSign,
      hospitalWithKeys.encrypted_private_key
    );

    await supabase
      .from("lab_reports")
      .update({
        report_hash: hash,
        signature: signature,
        signer_hospital_id: hospital.id, // Ensure this column is added to schema if not present, but based on actions it is
      })
      .eq("id", labReport.id);

    console.log("Signed seeded lab report.");
  }

  // Create another pending appointment for future
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 5);

  await supabase.from("appointments").insert({
    user_id: patientUser.id,
    doctor_id: doctorUser.id,
    hospital_id: hospital.id,
    department_id: dept.id,
    date: futureDate.toISOString(),
    status: "pending",
    reason: "Follow up checkup",
  });
  console.log("Created pending follow-up appointment");
}

async function main() {
  await seedHospitalsAndDepartments();
  await seedUsers();
  await seedPKI(); // Add PKI seeding
  await seedAppointmentsAndMedicalRecords();
  console.log("Seeding complete.");
}

main().catch(console.error);
