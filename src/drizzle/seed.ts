import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error("SUPABASE_DATABASE_URL is not set");
}

const nepalHospitals = [
  {
    name: "Bir Hospital",
    latitude: 27.7052,
    longitude: 85.3123,
    contactNumber: "+977-1-4221119",
    email: "info@birhospital.gov.np",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["General Medicine", "Surgery", "Emergency", "Orthopedics"],
  },
  {
    name: "Patan Hospital",
    latitude: 27.6685,
    longitude: 85.3206,
    contactNumber: "+977-1-5522295",
    email: "info@pahs.edu.np",
    province: "Bagmati",
    district: "Lalitpur",
    city: "Lalitpur",
    departments: ["Pediatrics", "Gynecology", "ENT", "Dermatology"],
  },
  {
    name: "Bhaktapur Hospital",
    latitude: 27.6731,
    longitude: 85.4223,
    contactNumber: "+977-1-6610798",
    email: "info@bhaktapurhospital.gov.np",
    province: "Bagmati",
    district: "Bhaktapur",
    city: "Bhaktapur",
    departments: ["General Medicine", "Cardiology", "Dental"],
  },
  {
    name: "Tribhuvan University Teaching Hospital (TUTH)",
    latitude: 27.7344,
    longitude: 85.3315,
    contactNumber: "+977-1-4412303",
    email: "info@tuth.org.np",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["Neurology", "Nephrology", "Oncology", "Psychiatry"],
  },
  {
    name: "Paropakar Maternity and Women's Hospital",
    latitude: 27.6893,
    longitude: 85.3189,
    contactNumber: "+977-1-4260405",
    email: "info@pmwh.gov.np",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["Obstetrics", "Gynecology", "Neonatology"],
  },
  {
    name: "B.P. Koirala Institute of Health Sciences",
    latitude: 26.8126,
    longitude: 87.2831,
    contactNumber: "+977-25-525555",
    email: "info@bpkihs.edu",
    province: "Koshi",
    district: "Sunsari",
    city: "Dharan",
    departments: ["Internal Medicine", "Surgery", "Pediatrics", "Radiology"],
  },
  {
    name: "Dhulikhel Hospital",
    latitude: 27.6253,
    longitude: 85.5398,
    contactNumber: "+977-11-490497",
    email: "dhulikhelhospital@kusms.edu.np",
    province: "Bagmati",
    district: "Kavrepalanchok",
    city: "Dhulikhel",
    departments: ["Community Medicine", "Ophthalmology", "Physiotherapy"],
  },
  {
    name: "Gandaki Medical College",
    latitude: 28.2255,
    longitude: 83.9961,
    contactNumber: "+977-61-538595",
    email: "info@gmc.edu.np",
    province: "Gandaki",
    district: "Kaski",
    city: "Pokhara",
    departments: ["Pathology", "Forensic Medicine", "Anesthesiology"],
  },
  {
    name: "Nepal Mediciti Hospital",
    latitude: 27.6635,
    longitude: 85.3045,
    contactNumber: "+977-1-4217766",
    email: "info@nepalmediciti.com",
    province: "Bagmati",
    district: "Lalitpur",
    city: "Lalitpur",
    departments: ["Cardiology", "Neurology", "Gastroenterology", "Urology"],
  },
  {
    name: "Norvic International Hospital",
    latitude: 27.6917,
    longitude: 85.3198,
    contactNumber: "+977-1-4258554",
    email: "info@norvichospital.com",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["Cardiology", "Pulmonology", "Endocrinology", "Orthopedics"],
  },
  {
    name: "Shahid Gangalal National Heart Centre",
    latitude: 27.7369,
    longitude: 85.3331,
    contactNumber: "+977-1-4371374",
    email: "info@sgnhc.org.np",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["Cardiology", "Cardiothoracic Surgery"],
  },
  {
    name: "Grande International Hospital",
    latitude: 27.7516,
    longitude: 85.3275,
    contactNumber: "+977-1-5159266",
    email: "info@grandehospital.com",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["Neuroscience", "Orthopedics", "Wellness", "Dermatology"],
  },
  {
    name: "Civil Service Hospital",
    latitude: 27.6896,
    longitude: 85.34,
    contactNumber: "+977-1-4107000",
    email: "info@civilservicehospital.org",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["General Surgery", "Medicine", "ENT", "Ophthalmology"],
  },
  {
    name: "Kanti Children's Hospital",
    latitude: 27.735,
    longitude: 85.332,
    contactNumber: "+977-1-4411550",
    email: "info@kantichildrenhospital.gov.np",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["Pediatrics", "Pediatric Surgery", "Oncology"],
  },
  {
    name: "Bhaktapur Cancer Hospital",
    latitude: 27.673136,
    longitude: 85.422302,
    contactNumber: "+977-1-6611532",
    email: "info@bhaktapurcancerhospital.org",
    province: "Bagmati",
    district: "Bhaktapur",
    city: "Bhaktapur",
    departments: ["Oncology", "Radiotherapy", "Chemotherapy"],
  },
  {
    name: "Nepal Eye Hospital",
    latitude: 27.695,
    longitude: 85.315,
    contactNumber: "+977-1-4260813",
    email: "info@nepaleye.org.np",
    province: "Bagmati",
    district: "Kathmandu",
    city: "Kathmandu",
    departments: ["Ophthalmology", "Optometry"],
  },
  {
    name: "Lumbini Provincial Hospital",
    latitude: 27.7006,
    longitude: 83.4484,
    contactNumber: "+977-71-540304",
    email: "lphospital@lumbini.gov.np",
    province: "Lumbini",
    district: "Rupandehi",
    city: "Butwal",
    departments: ["Emergency", "Medicine", "Surgery"],
  },
  {
    name: "Seti Provincial Hospital",
    latitude: 28.6926,
    longitude: 80.5905,
    contactNumber: "+977-91-521271",
    email: "info@setihospital.gov.np",
    province: "Sudurpashchim",
    district: "Kailali",
    city: "Dhangadhi",
    departments: ["General Medicine", "Pediatrics", "Orthopedics"],
  },
];

async function seed() {
  console.log("Seeding hospitals...");

  const client = postgres(process.env.SUPABASE_DATABASE_URL!, {
    prepare: false,
  });
  const db = drizzle(client, { schema });

  for (const hospitalData of nepalHospitals) {
    const { departments, ...hospital } = hospitalData;

    try {
      // Insert hospital
      const [insertedHospital] = await db
        .insert(schema.hospitals)
        .values(hospital)
        .returning({ id: schema.hospitals.id });

      console.log(`Inserted ${hospital.name} with ID: ${insertedHospital.id}`);

      // Insert departments
      if (departments.length > 0) {
        const departmentValues = departments.map((deptName) => ({
          hospitalId: insertedHospital.id,
          name: deptName,
        }));

        await db.insert(schema.hospitalDepartments).values(departmentValues);
        console.log(
          `  Inserted ${departments.length} departments for ${hospital.name}`
        );
      }
    } catch (error) {
      console.error(`Error inserting ${hospital.name}:`, error);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
