"use client";

import dynamic from "next/dynamic";
import { Hospital } from "@/drizzle/types";

const HospitalMap = dynamic(() => import("@/components/dashboard/hospital-map"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg" />,
});

interface HospitalMapWrapperProps {
  hospitals: Hospital[];
}

export default function HospitalMapWrapper({ hospitals }: HospitalMapWrapperProps) {
  return <HospitalMap hospitals={hospitals} />;
}
