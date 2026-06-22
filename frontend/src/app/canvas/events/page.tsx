"use client";
import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

const PRESET_EVENTS = [
  { id: "ukraine", label: "Russia-Ukraine War (Feb 2022)", category: "Geopolitical", summary: "Oil +40%, Gold +8%, SPX -12%, VIX +60%" },
  { id: "fed_hike", label: "Fed Rate Hike Cycle (Mar 2022)", category: "Monetary Policy", summary: "TLT -30%, SPX -18%, USD +15%, Gold -5%" },
  { id: "svb", label: "SVB Collapse (Mar 2023)", category: "Credit Event", summary: "Regional Banks -30%, TLT +5%, Gold +7%" },
  { id: "chatgpt", label: "ChatGPT Launch (Nov 2022)", category: "Technology", summary: "AI/Tech +80% over 12m, NVDA +400%" },
  { id: "election24", label: "2024 US Election (Nov 2024)", category: "Political", summary: "Bitcoin +40%, DXY +5%, SPX +4%, TLT -5%" },
  { id: "covid", label: "COVID Crash (Feb 2020)", category: "Black Swan", summary: "SPX -34%, Gold +25%, Oil -60%, BTC -50%" },
  { id: "custom", label: "Custom Event", category: "Custom", summary: "Enter your own event details below" },
];
const EVENTS = PRESET_EVENTS;

const PAIRS = [
  { key: "safe_haven",   label: "Safe Haven (Gold / TLT)" },
  { key: "risk_on",      label: "Risk Assets (SPX / Tech)" },
  { key: "commodities",  label: "Commodities (Oil / Gold)" },
  { key: "custom_pair",  label: "Custom Pair (A / B)" },
];

const MULTIPLIERS: Record<string, [number, number]> = {
  ukraine:    [1, -0.7],
  fed_hike:   [-1.2, 0.5],
  svb:        [-0.8, 0.6],
  chatgpt:    [1.5, 0.4],
  election24: [0.6, -0.3],
  covid:      [-2.1, 1.2],
};

function makeData(eventId: string) {
  const [m1, m2] = MULTIPLIERS[eventId] ?? [1, -0.5];
  const days = [-20,-15,-10,-5,-3,-1,0,1,3,5,10,15,20,30];
  return days.map((d, i) => {
    const shock = d >= 0 ? 1 : 0;
    const drift = Math.max(0, d) / 30;
    const noise1 = Math.sin(i * 2.3 + 1) * 0.4;
    const noise2 = Math.sin(i * 1.7 + 2) * 0.35;
    return {
      label: d === 0 ? "Event" : `T${d >= 0 ? "+" : ""}${d}`,
      asset1: +( m1 * (shock * 2.5 + drift * 3 + noise1)).toFixed(2),
      asset2: +( m2 * (shock * 1.8 + drift * 1.5 + noise2)).toFixed(2),
    };
  });
}

function ChartTT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "9px 13px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.value >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          {p.name}: {p.value >= 0 ? "+" : ""}{p.value}%
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  const [selEvent, setSelEvent] = useState("ukraine");
  const [selPair, setSelPair] = useState("risk_on");
  const [customName, setCustomName] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customSummary, setCustomSummary] = useState("");

  const [customTickerA, setCustomTickerA] = useState("NVDA");
  const [customTickerB, setCustomTickerB] = useState("TLT");

  const isCustom = selEvent === "custom";
  const isCustomPair = selPair === "custom_pair";
  const event = EVENTS.find(e => e.id === selEvent)!;
  const pair = PAIRS.find(p => p.key === selPair)!;
  const data = makeData(isCustom ? "ukraine" : selEvent);
  const pairLabels = isCustomPair
    ? [customTickerA || "Asset A", customTickerB || "Asset B"]
    : (pair.label.match(/\((.+)\)/)?.[1].split(" / ") ?? ["Asset 1", "Asset 2"]);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 5 }}>CANVAS · EVENT STUDY</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Event-Driven Analysis</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>How asset classes react before, during, and after major macro events.</p>

        <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>SELECT EVENT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {EVENTS.map(e => (
              <button key={e.id} onClick={() => setSelEvent(e.id)} style={{
                padding: "12px 14px", border: `1px solid ${selEvent === e.id ? "#1e3a5f" : "#e2e8f0"}`,
                borderRadius: 8, textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit",
                background: selEvent === e.id ? "#eff6ff" : "#fff",
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: selEvent === e.id ? "#1e3a5f" : "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>{e.category}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{e.label}</div>
              </button>
            ))}
          </div>
          {isCustom ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 4 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Event Name</label>
                <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. China Stimulus (Sep 2024)" style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Event Date</label>
                <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Known Asset Reactions</label>
                <input value={customSummary} onChange={e => setCustomSummary(e.target.value)} placeholder="e.g. MCHI +15%, Gold -2%" style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
              </div>
            </div>
          ) : (
            <div style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 6, fontSize: 13, color: "#475569" }}>
              <strong>{event.label}</strong> — Typical reactions: {event.summary}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>PRICE REACTION — Days Before/After Event</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Cumulative % change relative to T-20 days · <span style={{ color: "#b45309", fontWeight: 600 }}>Illustrative scenario — not backtested data</span></div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {PAIRS.map(p => (
                <button key={p.key} onClick={() => setSelPair(p.key)} style={{
                  padding: "5px 12px", fontSize: 11, fontWeight: 600, fontFamily: "inherit",
                  background: selPair === p.key ? "#1e3a5f" : "#f1f5f9",
                  color: selPair === p.key ? "#fff" : "#475569",
                  border: "none", borderRadius: 4, cursor: "pointer",
                }}>{p.label}</button>
              ))}
              {isCustomPair && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input value={customTickerA} onChange={e => setCustomTickerA(e.target.value.toUpperCase())}
                    placeholder="NVDA" style={{ width: 80, height: 28, padding: "0 8px", border: "1px solid #1e3a5f", borderRadius: 4, fontSize: 12, fontFamily: "monospace", outline: "none", textTransform: "uppercase" as const }} />
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>vs</span>
                  <input value={customTickerB} onChange={e => setCustomTickerB(e.target.value.toUpperCase())}
                    placeholder="TLT" style={{ width: 80, height: 28, padding: "0 8px", border: "1px solid #1e3a5f", borderRadius: 4, fontSize: 12, fontFamily: "monospace", outline: "none", textTransform: "uppercase" as const }} />
                </div>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${v}%`} domain={["auto", "auto"]} />
              <Tooltip content={<ChartTT />} />
              <ReferenceLine x="Event" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: "Event", position: "top", fontSize: 10, fill: "#dc2626" }} />
              <ReferenceLine y={0} stroke="#e2e8f0" />
              <Line type="monotone" dataKey="asset1" name={pairLabels[0] ?? "Asset 1"} stroke="#1e3a5f" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="asset2" name={pairLabels[1] ?? "Asset 2"} stroke="#16a34a" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="section-label" style={{ marginBottom: 12 }}>HISTORICAL PATTERN LIBRARY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { rule: "Fed Hikes → Bond Pain", text: "TLT avg -22% in first 12m of hike cycle since 1980. Short duration outperforms." },
            { rule: "War = Oil Spike (Short-Lived)", text: "Oil averages +18% in month 1 of geopolitical conflict, then fades -8% over 3m as supply adjusts." },
            { rule: "VIX > 30 → Buy Equities", text: "When VIX spikes above 30, SPX avg +18% over the next 12 months (since 1990). Fear = opportunity." },
            { rule: "Election Year Seasonality", text: "S&P 500 positive in 19 of last 24 election years. Q4 particularly strong (+4.3% avg)." },
            { rule: "Black Swans & Gold", text: "Gold outperforms in 80% of major market crises. Acts as portfolio insurance but lags in recovery." },
            { rule: "AI/Tech Catalyst Cycles", text: "Technology adoption waves (internet 1995, mobile 2007, AI 2022) create 5-7 year secular bull runs." },
          ].map(p => (
            <div key={p.rule} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e3a5f", marginBottom: 6 }}>{p.rule}</div>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
