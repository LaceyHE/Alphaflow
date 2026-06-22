"use client";
import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, ReferenceLine } from "recharts";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DATA: Record<string, number[][]> = {
  SPY: [
    [1.1,-0.2,1.3,1.5,0.2,0.8,1.8,-0.3,-0.8,1.2,2.1,1.4],
    [0.8, 0.3,1.2,2.1,1.8,1.1,2.3, 0.9,-0.2,0.8,3.2,2.5],
    [1.3,-0.6,1.4,0.9,-0.4,0.5,1.2,-0.8,-1.3,1.6,1.0,0.3],
  ],
  QQQ: [
    [2.1, 0.8,1.9,2.3,-0.3,1.2,2.6,-0.1,-1.4,1.8,3.2,2.1],
    [1.4, 0.5,1.8,3.1,2.2,1.4,3.0, 1.2,-0.4,1.2,4.1,3.2],
    [2.7, 1.1,2.0,1.5,-0.9,1.0,2.2,-0.5,-2.3,2.4,2.3,1.0],
  ],
  GLD: [
    [1.8, 0.4,-0.3,0.2, 0.8,-0.2,1.2,1.4,0.6,0.1,-0.8,1.3],
    [2.1, 0.8,-0.1,0.5, 1.2, 0.3,1.8,1.9,0.9,0.4,-0.4,1.7],
    [1.5, 0.1,-0.5,-0.1,0.4,-0.7,0.6,0.9,0.3,-0.2,-1.2,0.9],
  ],
  TLT: [
    [1.4, 0.8, 0.2,-0.3, 0.6, 0.4, 0.3, 1.8, 0.9,-1.2,-0.4,1.1],
    [1.0, 0.4,-0.1,-0.8, 0.2,-0.1,-0.2, 1.2, 0.4,-1.8,-1.0,0.7],
    [1.8, 1.2, 0.5, 0.2, 1.0, 0.9, 0.8, 2.4, 1.4,-0.6, 0.2,1.5],
  ],
};

function BarTT({ active, payload, label }: any) {
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

export default function SeasonalPage() {
  const [asset, setAsset] = useState("SPY");
  const [spx, election, nonElection] = DATA[asset];
  const chartData = MONTHS.map((m, i) => ({ month: m, spx: spx[i], election: election[i], nonElection: nonElection[i] }));
  const best = [...chartData].sort((a, b) => b.spx - a.spx).slice(0, 3);
  const worst = [...chartData].sort((a, b) => a.spx - b.spx).slice(0, 3);
  const annualAvg = spx.reduce((a, b) => a + b, 0);
  const sellInMay = spx.slice(4, 10).reduce((a, b) => a + b, 0);
  const buyInNov = [...spx.slice(0, 4), ...spx.slice(10)].reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 5 }}>CANVAS · SEASONAL PATTERNS</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Historical Seasonality</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Average monthly return patterns across election and non-election years. <span style={{ color: "#b45309", fontWeight: 600 }}>Illustrative historical averages — for reference only, not live data.</span></p>

        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {Object.keys(DATA).map(a => (
            <button key={a} onClick={() => setAsset(a)} style={{
              padding: "6px 16px", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              background: asset === a ? "#1e3a5f" : "#f1f5f9",
              color: asset === a ? "#fff" : "#475569",
              border: "none", borderRadius: 5, cursor: "pointer",
            }}>{a}</button>
          ))}
        </div>

        <div className="card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>AVERAGE MONTHLY RETURN — ALL YEARS</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip content={<BarTT />} />
              <ReferenceLine y={0} stroke="#e2e8f0" />
              <Bar dataKey="spx" name="Avg Return" radius={[3, 3, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.spx >= 0 ? "#16a34a" : "#dc2626"} fillOpacity={0.7 + Math.min(0.3, Math.abs(d.spx) / 5)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: "20px 24px", marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>ELECTION YEAR vs NON-ELECTION YEAR</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v: number) => `${v}%`} domain={["auto", "auto"]} />
              <Tooltip content={<BarTT />} />
              <ReferenceLine y={0} stroke="#e2e8f0" />
              <Line type="monotone" dataKey="election" name="Election Yr" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3, fill: "#1e3a5f" }} />
              <Line type="monotone" dataKey="nonElection" name="Non-Election Yr" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>BEST MONTHS</div>
            {best.map(m => (
              <div key={m.month} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{m.month}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a", fontVariantNumeric: "tabular-nums" }}>+{m.spx.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>WORST MONTHS</div>
            {worst.map(m => (
              <div key={m.month} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{m.month}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", fontVariantNumeric: "tabular-nums" }}>{m.spx.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>SUMMARY</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.9 }}>
              <div>Positive months: <strong>{chartData.filter(d => d.spx > 0).length}/12</strong></div>
              <div>Best: <strong style={{ color: "#16a34a" }}>+{Math.max(...spx).toFixed(1)}%</strong></div>
              <div>Worst: <strong style={{ color: "#dc2626" }}>{Math.min(...spx).toFixed(1)}%</strong></div>
              <div>Annual avg: <strong>{annualAvg.toFixed(1)}%</strong></div>
            </div>
          </div>
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="section-label" style={{ marginBottom: 8 }}>SELL IN MAY?</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.9 }}>
              <div>May–Oct avg: <strong style={{ color: sellInMay < buyInNov ? "#dc2626" : "#16a34a" }}>{sellInMay.toFixed(1)}%</strong></div>
              <div>Nov–Apr avg: <strong style={{ color: buyInNov > sellInMay ? "#16a34a" : "#dc2626" }}>{buyInNov.toFixed(1)}%</strong></div>
              <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>{buyInNov > sellInMay ? "Seasonal pattern holds" : "No significant seasonal edge"}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
