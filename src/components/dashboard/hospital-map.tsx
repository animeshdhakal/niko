"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Hospital } from "@/drizzle/types";
import { useTheme } from "next-themes";
import { renderToStaticMarkup } from "react-dom/server";
import { Hospital as HospitalIcon, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

interface HospitalMapProps {
  hospitals: Hospital[];
}

// Custom hook to fix leaflet icon issues and create dynamic icons
const useHospitalIcon = () => {
  // const { theme } = useTheme(); // Removed unused variable but keeping hook structure for future


  const createIcon = (color: string) => {
    const iconHtml = renderToStaticMarkup(
      <div className="relative flex items-center justify-center w-10 h-10">
        <div className={`absolute inset-0 bg-${color}-500 opacity-20 rounded-full animate-ping`} />
        <div className={`relative flex items-center justify-center w-8 h-8 bg-sky-500 rounded-full shadow-lg border-2 border-white dark:border-gray-800`}>
          <HospitalIcon className="w-4 h-4 text-white" />
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-sky-500" />
      </div>
    );

    return L.divIcon({
      html: iconHtml,
      className: "bg-transparent",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  return createIcon("sky");
};

function HospitalMapContent({ hospitals }: HospitalMapProps) {
  const { resolvedTheme } = useTheme();
  const customIcon = useHospitalIcon();

  // Default center of Nepal
  const center: [number, number] = [28.3949, 84.1240];
  const zoom = 7;

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border shadow-md">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-[600px] w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            resolvedTheme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.latitude, hospital.longitude]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="min-w-[200px] p-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="shrink-0 p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <HospitalIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight text-foreground">
                      {hospital.name}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Hospital
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="leading-snug">
                      {hospital.city}, {hospital.district}
                    </span>
                  </div>

                  {hospital.contactNumber && (
                    <div className="px-2 py-1.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-medium text-center">
                      {hospital.contactNumber}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay gradient for better integration */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/20 to-transparent pointer-events-none z-[400]" />
    </div>
  );
}

const HospitalMap = dynamic(() => Promise.resolve(HospitalMapContent), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-xl border border-border bg-muted/20 animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground">Loading Map...</span>
    </div>
  ),
});

export default HospitalMap;
