"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

const EVENTS = [
  { name: "Russia-Ukraine War (Feb 2022)", asset: "Oil +40%, Gold +8%, SPX -12%" },
  { name: "Fed Rate Hike Cycle Start (Mar 2022)", asset: "TLT -30%, SPX -18%, USD +15%" },
  { name: "SVB Collapse (Mar 2023)", asset: "Regional Banks -30%, TLT +5%" },
  { name: "ChatGPT Launch (Nov 2022)", asset: "AI/Tech +80% in 12m" },
  { name: "2024 US Presidential Election", asset: "Bitcoin +40%, DXY +5%, SPX +4%" },
];

// Simulated before/after data
const buildEventData = (eventIdx: number) => {
  const seeds = [
    [0, -2, -5, -3, 2, 8, 15, 22, 18, 12, 8],
    [0, 3, 7, 10, 5, -3, -8, -15, -12, -10, -8],
    [0, 1, -5, -12, -8, -5, -2, 3, 6, 8, 10],
  ];
  const s = seeds[eventIdx % 3];
  return s.map((v, i) => ({ day: i - 5, asset1: v, asset2: -v * 0.6 + (Math.random() - 0.5) * 3 }));
};

export default function EventsPage() {
  const [selEvent, setSelEvent] = useState(0);
  const data = buildEventData(selEvent);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300, margin: "0 auto", marginLeft: 192 }}>
      <div className="section-label mb-1">CANVAS · EVENT-DRIVEN ANALYSIS</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Historical Event Comparison</h1>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>
        How assets moved before &amp; after major macro events
      </p>

      <div className="grid gap-5" style={{ gridTemplateColumns: "260px 1fr" }}>
        <div className="glass p-4">
          <div className="section-label mb-3">EVENTS</div>
          <div className="space-y-2">
            {EVENTS.map((e, i) => (
              <div
                key={i}
                className="rounded-lg p-3 cursor-pointer transition-all"
                onClick={() => setSelEvent(i)}
                style={{
                  background: selEvent === i ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${selEvent === i ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>{e.name}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{e.asset}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs" style={{ color: "#334155" }}>
            More events in Phase 2 with real historical data
          </div>
        </div>

        <div className="glass p-5">
          <div className="section-label mb-4">{EVENTS[selEvent].name.toUpperCase()}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            Asset performance from -5 days before to +5 days after event (day 0 = event)
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="day" tickFormatter={v => v === 0 ? "EVENT" : `${v > 0 ? "+" : ""}${v}d`}
                tick={{ fill: "#475569", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
              <YAxis tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
                tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any, name: any) => [`${Number(v).toFixed(2)}%`, name === "asset1" ? "Asset A" : "Asset B"]}
                contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <ReferenceLine x={0} stroke="rgba(255,215,0,0.4)" strokeWidth={2} strokeDasharray="4 4" />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
              <Legend formatter={v => v === "asset1" ? "Primary Asset" : "Hedge Asset"} />
              <Line type="monotone" dataKey="asset1" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="asset1" />
              <Line type="monotone" dataKey="asset2" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} strokeDasharray="6 3" name="asset2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
