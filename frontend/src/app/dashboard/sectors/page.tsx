"use client";
import { useEffect, useState } from "react";
import { api, type SectorItem, type Timeframe } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";

const TF: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

const PE_DATA = [
  { name: "Technology",    current: 28.5, median: 22, low: 14, high: 38, pctile: 68 },
  { name: "Financials",   current: 14.2, median: 13, low: 8,  high: 19, pctile: 55 },
  { name: "Health Care",  current: 19.8, median: 18, low: 12, high: 28, pctile: 52 },
  { name: "Industrials",  current: 22.1, median: 19, low: 13, high: 28, pctile: 65 },
  { name: "Consumer Disc.",current: 26.3, median: 22, low: 14, high: 35, pctile: 60 },
  { name: "Energy",       current: 11.5, median: 14, low: 7,  high: 22, pctile: 28 },
  { name: "Utilities",    current: 17.2, median: 17, low: 12, high: 23, pctile: 50 },
  { name: "Materials",    current: 18.4, median: 16, low: 10, high: 24, pctile: 58 },
  { name: "Real Estate",  current: 35.1, median: 38, low: 22, high: 55, pctile: 38 },
  { name: "Communication",current: 16.8, median: 17, low: 10, high: 27, pctile: 45 },
  { name: "Consumer Staples",current: 20.2, median: 19, low: 14, high: 25, pctile: 55 },
];

const SECTOR_DOTS: Record<string, string> = {
  Technology: "#3b82f6", Financials: "#f59e0b", "Health Care": "#10b981",
  Industrials: "#8b5cf6", "Consumer Disc.": "#ef4444", Energy: "#f97316",
  Utilities: "#22d3ee", Materials: "#84cc16", "Real Estate": "#ec4899",
  Communication: "#a78bfa", "Consumer Staples": "#34d399",
};

function TT({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "9px 13px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, color: "#0f172a" }}>{d.name}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: d.change >= 0 ? "#16a34a" : "#dc2626", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        {d.change >= 0 ? "+" : ""}{d.change.toFixed(2)}%
      </div>
      <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>${d.price.toFixed(2)}</div>
    </div>
  );
}

export default function SectorsPage() {
  const [tf, setTf] = useState<Timeframe>("7D");
  const [data, setData] = useState<SectorItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.sectors(tf).then(d => setData(d.sectors)).catch(console.error).finally(() => setLoading(false));
  }, [tf]);

  const maxAbs = Math.max(...data.map(s => Math.abs(s.change)), 1);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div className="page-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 3 }}>FLOW ANALYTICS · SECTOR ROTATION</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Sector Rotation &amp; Valuation</h1>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>Performance + historical PE range &amp; current percentile</p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {TF.map(t => (
              <button key={t} onClick={() => setTf(t)} className={`tf-btn${tf === t ? " active" : ""}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Heatmap */}
        <div className="card" style={{ padding: "16px 18px", marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>SECTOR HEATMAP · {tf}</div>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {Array(11).fill(0).map((_,i) => <div key={i} style={{ height: 80, background: "#f1f5f9", borderRadius: 5 }} />)}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
              {data.map(s => {
                const intensity = Math.min(Math.abs(s.change) / maxAbs, 1);
                const pos = s.change >= 0;
                return (
                  <div key={s.name} style={{
                    borderRadius: 5, padding: "10px 12px",
                    background: pos
                      ? `rgba(22,163,74,${0.05 + intensity * 0.12})`
                      : `rgba(220,38,38,${0.05 + intensity * 0.12})`,
                    border: `1px solid ${pos ? `rgba(22,163,74,${0.15 + intensity * 0.25})` : `rgba(220,38,38,${0.15 + intensity * 0.25})`}`,
                  }}>
                    <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "monospace" }}>{s.ticker}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a", marginTop: 3, lineHeight: 1.3 }}>{s.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: pos ? "#16a34a" : "#dc2626", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                      {pos ? "+" : ""}{s.change.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Momentum bar chart */}
        <div className="card" style={{ padding: "16px 18px", marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>MOMENTUM COMPARISON · {tf}</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} layout="vertical" margin={{ left: 120, right: 80 }} barSize={13}>
              <XAxis type="number" tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis type="category" dataKey="name" width={120}
                tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: "#f8fafc" }} />
              <ReferenceLine x={0} stroke="#cbd5e1" />
              <Bar dataKey="change" radius={[0, 2, 2, 0]}>
                {data.map((s, i) => <Cell key={i} fill={s.change >= 0 ? "#16a34a" : "#dc2626"} fillOpacity={0.75} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PE Percentile Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
            <div className="section-label" style={{ marginBottom: 2 }}>PE VALUATION PERCENTILE</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Current PE vs. historical range — illustrative data</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                {["Sector", "Current PE", "Median", "10th–90th Range", "Percentile", "Signal"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PE_DATA.map((row) => {
                const cheap = row.pctile < 33;
                const rich = row.pctile > 66;
                const pcolor = cheap ? "#16a34a" : rich ? "#dc2626" : "#b45309";
                return (
                  <tr key={row.name}>
                    <td style={{ fontWeight: 500, color: "#0f172a" }}>
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: SECTOR_DOTS[row.name] || "#64748b", marginRight: 8 }} />
                      {row.name}
                    </td>
                    <td style={{ fontWeight: 700, color: "#0f172a" }}>{row.current}x</td>
                    <td>{row.median}x</td>
                    <td>
                      <div style={{ position: "relative", height: 5, width: 140, background: "#f1f5f9", borderRadius: 3 }}>
                        <div style={{
                          position: "absolute",
                          left: `${((row.current - row.low) / (row.high - row.low)) * 100}%`,
                          top: -2.5, width: 10, height: 10,
                          borderRadius: "50%", background: pcolor,
                          transform: "translateX(-50%)",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{row.low}x – {row.high}x</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ flex: 1, height: 4, background: "#f1f5f9", borderRadius: 2, maxWidth: 80 }}>
                          <div style={{ width: `${row.pctile}%`, height: "100%", background: pcolor, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: pcolor }}>{row.pctile}th</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${cheap ? "badge-up" : rich ? "badge-down" : "badge-neu"}`}
                        style={{ color: pcolor }}>
                        {cheap ? "CHEAP" : rich ? "RICH" : "FAIR"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
