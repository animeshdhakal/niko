"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- Types ---
type Symptom =
  | "High Fever"
  | "Severe Cough"
  | "Respiratory Distress"
  | "Unknown Rash";

interface Case {
  id: string;
  lat: number;
  lng: number;
  symptom: Symptom;
  severity: number; // 1-10
  timestamp: string;
}

interface OutbreakAlert {
  id: string;
  lat: number;
  lng: number;
  symptom: Symptom;
  radius: number; // meters
  caseCount: number;
  severityLevel: "High" | "Critical";
  locationName: string;
}

// --- Data Generation Helpers ---
// Comprehensive list of major Nepal cities/towns to anchor data points
const LOCATIONS = [
  { name: "Kathmandu", lat: 27.7172, lng: 85.324 },
  { name: "Pokhara", lat: 28.2096, lng: 83.9856 },
  { name: "Lalitpur", lat: 27.6602, lng: 85.3241 },
  { name: "Biratnagar", lat: 26.4525, lng: 87.2718 },
  { name: "Birgunj", lat: 27.0177, lng: 84.8788 },
  { name: "Dharan", lat: 26.8126, lng: 87.2835 },
  { name: "Bharatpur", lat: 27.6833, lng: 84.4333 }, // Chitwan area
  { name: "Janakpur", lat: 26.7271, lng: 85.924 },
  { name: "Hetauda", lat: 27.4285, lng: 85.031 },
  { name: "Nepalgunj", lat: 28.05, lng: 81.6167 },
  { name: "Itahari", lat: 26.6667, lng: 87.2833 },
  { name: "Butwal", lat: 27.7, lng: 83.4667 },
  { name: "Dhangadhi", lat: 28.6852, lng: 80.6125 },
  { name: "Bhaktapur", lat: 27.671, lng: 85.4298 },
  { name: "Birendranagar", lat: 28.6019, lng: 81.6337 },
];

const SYMPTOMS: Symptom[] = [
  "High Fever",
  "Severe Cough",
  "Respiratory Distress",
  "Unknown Rash",
];

const generateRandomCoordinate = (
  baseLat: number,
  baseLng: number,
  spread: number
) => {
  const r = spread * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;
  return {
    lat: baseLat + r * Math.cos(theta),
    lng: baseLng + r * Math.sin(theta),
  };
};

// --- Component ---

function NikoPulseMapContent() {
  const { resolvedTheme } = useTheme();
  const [cases, setCases] = useState<Case[]>([]);
  const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);

  // Generate Data & Alerts
  useEffect(() => {
    // Wrap in setTimeout to simulate async processing and avoid synchronous setState in effect warning
    const timer = setTimeout(() => {
      const newCases: Case[] = [];
      const newAlerts: OutbreakAlert[] = [];

      // 1. Generate background noise (scattered cases near cities)
      // Instead of random bounding box, we anchor them to known cities to ensure they are IN Nepal
      for (let i = 0; i < 60; i++) {
        const randomCity =
          LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        // Spread ~0.15 degrees (approx 15km radius) for background noise
        const { lat, lng } = generateRandomCoordinate(
          randomCity.lat,
          randomCity.lng,
          0.15
        );

        newCases.push({
          id: `noise-${i}`,
          lat,
          lng,
          symptom: SYMPTOMS[Math.floor(Math.random() * SYMPTOMS.length)],
          severity: Math.floor(Math.random() * 5) + 1,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Generate Clusters (Outbreaks)
      // Pick 2 random cities for outbreaks
      const outbreakIndices: number[] = [];
      while (outbreakIndices.length < 2) {
        const r = Math.floor(Math.random() * LOCATIONS.length);
        if (outbreakIndices.indexOf(r) === -1) outbreakIndices.push(r);
      }

      const outbreakCenters = [
        { ...LOCATIONS[outbreakIndices[0]], symptom: "High Fever" as Symptom },
        {
          ...LOCATIONS[outbreakIndices[1]],
          symptom: "Unknown Rash" as Symptom,
        },
      ];

      outbreakCenters.forEach((center, idx) => {
        const count = Math.floor(Math.random() * 20) + 15; // 15-35 cases
        const spread = 0.04; // ~4km tightly clustered for outbreak

        // Add cases around center
        for (let i = 0; i < count; i++) {
          const { lat, lng } = generateRandomCoordinate(
            center.lat,
            center.lng,
            spread
          );
          newCases.push({
            id: `cluster-${idx}-${i}`,
            lat,
            lng,
            symptom: center.symptom,
            severity: Math.floor(Math.random() * 4) + 6, // 6-10 severity
            timestamp: new Date().toISOString(),
          });
        }

        // Create Alert
        newAlerts.push({
          id: `alert-${idx}`,
          lat: center.lat,
          lng: center.lng,
          symptom: center.symptom,
          radius: 8000,
          caseCount: count,
          severityLevel: count > 25 ? "Critical" : "High",
          locationName: center.name,
        });
      });

      setCases(newCases);
      setAlerts(newAlerts);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getSymptomColor = (symptom: Symptom) => {
    switch (symptom) {
      case "High Fever":
        return "#ef4444"; // red-500
      case "Severe Cough":
        return "#3b82f6"; // blue-500
      case "Respiratory Distress":
        return "#a855f7"; // purple-500
      case "Unknown Rash":
        return "#eab308"; // yellow-500
      default:
        return "#84cc16";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[800px]">
      {/* Map Area */}
      <div className="lg:col-span-3 h-full rounded-xl overflow-hidden border border-border shadow-md relative group">
        <MapContainer
          center={[28.3949, 84.124]}
          zoom={7}
          scrollWheelZoom={false}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={
              resolvedTheme === "dark"
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
          />

          {/* Render Alerts (Pulsing Circles) */}
          {alerts.map((alert) => (
            <Circle
              key={alert.id}
              center={[alert.lat, alert.lng]}
              pathOptions={{
                color: getSymptomColor(alert.symptom),
                fillColor: getSymptomColor(alert.symptom),
                fillOpacity: 0.1,
                weight: 2,
                className: "animate-pulse-slow",
              }}
              radius={alert.radius}
            >
              <Popup className="custom-popup">
                <div className="p-2">
                  <strong className="text-red-600 block mb-1">
                    POTENTIAL OUTBREAK
                  </strong>
                  <div className="text-sm font-semibold">
                    {alert.locationName}
                  </div>
                  <div className="text-sm">Symptom: {alert.symptom}</div>
                  <div className="text-sm">Cases: {alert.caseCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status: {alert.severityLevel}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Render Cases */}
          {cases.map((c) => (
            <CircleMarker
              key={c.id}
              center={[c.lat, c.lng]}
              radius={3}
              pathOptions={{
                color: getSymptomColor(c.symptom),
                fillColor: getSymptomColor(c.symptom),
                fillOpacity: 0.6,
                weight: 0,
              }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>{c.symptom}</strong> <br />
                  Severity: {c.severity}/10
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Floating Legend / Info */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg z-[400] text-xs">
          <h4 className="font-semibold mb-2">Live Monitor</h4>
          <div className="flex flex-col gap-1.5">
            {SYMPTOMS.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getSymptomColor(s) }}
                />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Sidebar */}
      <div className="lg:col-span-1 h-full flex flex-col gap-4">
        <Card className="flex-1 flex flex-col h-full border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full px-4 pb-4 overflow-y-auto">
              <div className="flex flex-col gap-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-background rounded-lg border border-red-200 dark:border-red-900 shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">
                        {alert.locationName}
                      </span>
                      <Badge
                        variant={
                          alert.severityLevel === "Critical"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {alert.severityLevel}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Detected sudden spike in {alert.symptom}
                    </div>
                    <div className="text-xs font-mono bg-muted/50 p-1.5 rounded flex items-center justify-between mt-1">
                      <span>Count: {alert.caseCount}</span>
                      <span>Radius: {(alert.radius / 1000).toFixed(1)}km</span>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">
                    No active outbreaks detected.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Real-time Feed</span>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Anomoly Detection</span>
                </div>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Dynamic Import to disable SSR for Leaflet
export const NikoPulseMap = dynamic(
  () => Promise.resolve(NikoPulseMapContent),
  {
    ssr: false,
    loading: () => (
      <div className="h-[800px] w-full rounded-xl border border-border bg-muted/20 animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">
          Initializing Niko Pulse System...
        </span>
      </div>
    ),
  }
);
