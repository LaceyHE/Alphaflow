"use client";
import type { Timeframe } from "@/lib/api";

const OPTIONS: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

export default function TimeframePicker({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-card2)" }}>
      {OPTIONS.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className="px-3 py-1 rounded-md text-sm font-medium transition-all"
          style={{
            background: value === tf ? "var(--accent)" : "transparent",
            color: value === tf ? "#000" : "var(--muted)",
          }}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}
