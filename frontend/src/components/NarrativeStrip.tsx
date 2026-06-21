"use client";
import { useEffect, useState } from "react";
import { api, type NarrativeData, type Timeframe } from "@/lib/api";

export default function NarrativeStrip({ timeframe }: { timeframe: Timeframe }) {
  const [data, setData] = useState<NarrativeData | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.narrative(timeframe).then(setData).catch(console.error);
  }, [timeframe]);

  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % data.lines.length), 4000);
    return () => clearInterval(timer);
  }, [data]);

  if (!data) return <div className="h-12 animate-pulse rounded" style={{ background: "var(--bg-card2)" }} />;

  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4 border"
      style={{ background: "rgba(0,255,148,0.05)", borderColor: "rgba(0,255,148,0.2)" }}
    >
      <span className="text-xl flex-shrink-0">📡</span>
      <div className="flex-1 overflow-hidden">
        <div
          key={idx}
          className="text-sm font-medium transition-all"
          style={{ color: "var(--accent)" }}
        >
          {data.lines[idx]}
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {data.lines.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i === idx ? "var(--accent)" : "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}
