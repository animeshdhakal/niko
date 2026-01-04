import { NikoPulseMap } from "../../../components/dashboard/niko-pulse-map";

export default function NikoPulsePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Niko Pulse (Epidemic Radar)
        </h1>
        <p className="text-muted-foreground">
          Real-time geospatial analytics for disease surveillance. Detects
          symptom spikes and triggers potential outbreak alerts.
        </p>
      </div>

      <NikoPulseMap />
    </div>
  );
}
