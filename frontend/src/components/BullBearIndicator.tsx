"use client";
import { useEffect, useState } from "react";
import { api, type NarrativeData, type Timeframe } from "@/lib/api";

export default function BullBearIndicator({ timeframe }: { timeframe: Timeframe }) {
  const [data, setData] = useState<NarrativeData | null>(null);

  useEffect(() => {
    api.narrative(timeframe).then(setData).catch(console.error);
  }, [timeframe]);

  if (!data) return <div className="h-32 animate-pulse rounded-xl" style={{ background: "var(--bg-card)" }} />;

  const bull = data.bull_bear === "bull";
  return (
    <div
      className="card flex flex-col items-center justify-center gap-2 text-center"
      style={{ borderColor: bull ? "rgba(0,255,148,0.3)" : "rgba(255,77,109,0.3)" }}
    >
      <div className="text-4xl">{bull ? "🐂" : "🐻"}</div>
      <div
        className="text-lg font-bold"
        style={{ color: bull ? "var(--green)" : "var(--red)" }}
      >
        {bull ? "BULL" : "BEAR"}
      </div>
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        SPX {data.spx_change >= 0 ? "+" : ""}{data.spx_change.toFixed(2)}%
      </div>
      <div className="text-xs px-2 py-0.5 rounded" style={{ background: bull ? "rgba(0,255,148,0.1)" : "rgba(255,77,109,0.1)", color: bull ? "var(--green)" : "var(--red)" }}>
        {bull ? "Risk ON" : "Risk OFF"}
      </div>
    </div>
  );
}
