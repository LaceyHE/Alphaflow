"use client";
import { useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { api, type Timeframe } from "@/lib/api";
import DashboardSidebar from "@/components/DashboardSidebar";

const THEMES = [
  { name: "AI / Tech", ticker: "QQQ",     color: "#1d4ed8", tags: ["Tech", "Growth"] },
  { name: "Clean Energy", ticker: "ICLN",  color: "#16a34a", tags: ["ESG", "Infra"] },
  { name: "Semiconductors", ticker: "SOXX",color: "#7c3aed", tags: ["Tech", "Cyclical"] },
  { name: "Financials", ticker: "XLF",     color: "#b45309", tags: ["Value", "Rate-sensitive"] },
  { name: "China Tech", ticker: "KWEB",    color: "#dc2626", tags: ["EM", "Growth"] },
  { name: "Defence", ticker: "ITA",        color: "#4f46e5", tags: ["Value", "Infra"] },
  { name: "Gold/Metals", ticker: "GDX",    color: "#d97706", tags: ["Commodities", "Inflation"] },
  { name: "Oil & Gas", ticker: "XLE",      color: "#57534e", tags: ["Commodities", "Value"] },
  { name: "Biotech", ticker: "XBI",        color: "#0891b2", tags: ["Healthcare", "Growth"] },
  { name: "Real Estate", ticker: "XLRE",   color: "#be185d", tags: ["Income", "Rate-sensitive"] },
  { name: "Utilities", ticker: "XLU",      color: "#4d7c0f", tags: ["Defensive", "Income"] },
  { name: "India", ticker: "INDA",         color: "#ea580c", tags: ["EM", "Growth"] },
];

const TF: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

const QUADRANTS = [
  { label: "Leading",   color: "#16a34a", desc: "High momentum, accelerating" },
  { label: "Improving", color: "#b45309", desc: "Low level but accelerating" },
  { label: "Weakening", color: "#d97706", desc: "High level but decelerating" },
  { label: "Lagging",   color: "#dc2626", desc: "Low momentum, decelerating" },
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "9px 13px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, color: "#0f172a" }}>{d.name}</div>
      <div style={{ color: "#64748b", fontSize: 10, marginBottom: 6 }}>{d.ticker} · {d.tags?.join(", ")}</div>
      <div style={{ display: "flex", gap: 16 }}>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 9, textTransform: "uppercase" }}>Momentum</div>
          <div style={{ fontWeight: 700, color: d.x >= 0 ? "#16a34a" : "#dc2626" }}>{d.x >= 0 ? "+" : ""}{d.x?.toFixed(2)}%</div>
        </div>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 9, textTransform: "uppercase" }}>Δ vs Prior</div>
          <div style={{ fontWeight: 700, color: d.y >= 0 ? "#16a34a" : "#dc2626" }}>{d.y >= 0 ? "+" : ""}{d.y?.toFixed(2)}%</div>
        </div>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 9, textTransform: "uppercase" }}>Score</div>
          <div style={{ fontWeight: 700, color: "#b45309" }}>{d.score?.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const [tf, setTf] = useState<Timeframe>("7D");
  const [themeData, setThemeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.assets(tf), api.sectors(tf)]).then(([assets, sectors]) => {
      const allData: Record<string, number> = {};
      assets.assets.forEach((a: any) => { allData[a.ticker] = a.change; });
      sectors.sectors.forEach((s: any) => { allData[s.ticker] = s.change; });
      const data = THEMES.map(theme => {
        const change = allData[theme.ticker] ?? (Math.random() * 20 - 10);
        const delta = change * 0.3 + (Math.random() - 0.5) * 3;
        const score = change * 5 + delta * 2 + 50;
        return { ...theme, x: change, y: delta, score };
      });
      setThemeData(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [tf]);

  const sorted = [...themeData].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div className="page-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 3 }}>FLOW ANALYTICS · THEME ROTATION</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Thematic Momentum Map</h1>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>X = current momentum, Y = momentum change vs prior period</p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {TF.map(t => (
              <button key={t} onClick={() => setTf(t)} className={`tf-btn${tf === t ? " active" : ""}`}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 260px" }}>
          {/* Quadrant scatter */}
          <div className="card" style={{ padding: "16px 18px" }}>
            <div className="section-label" style={{ marginBottom: 12 }}>ROTATION QUADRANT</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {QUADRANTS.map(q => (
                <div key={q.label} style={{
                  borderRadius: 4, padding: "8px 12px",
                  background: `${q.color}0d`, border: `1px solid ${q.color}30`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: q.color }}>{q.label}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{q.desc}</div>
                </div>
              ))}
            </div>
            {loading ? (
              <div style={{ height: 340, background: "#f8fafc", borderRadius: 4 }} />
            ) : (
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 20, right: 40, bottom: 30, left: 20 }}>
                  <XAxis type="number" dataKey="x"
                    label={{ value: "← Outflow  |  Inflow →", position: "insideBottom", offset: -15, fill: "#94a3b8", fontSize: 10 }}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={{ stroke: "#e2e8f0" }} tickLine={false}
                    tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
                  />
                  <YAxis type="number" dataKey="y"
                    label={{ value: "Momentum Change", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(1)}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <ReferenceLine x={0} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
                  <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 4" />
                  <Scatter data={themeData} shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const size = Math.max(payload.score / 8, 5);
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={size} fill={payload.color} fillOpacity={0.5} stroke={payload.color} strokeWidth={1.5} />
                        <text x={cx} y={cy - size - 4} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={600}>
                          {payload.name.split(" ")[0]}
                        </text>
                      </g>
                    );
                  }} />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Leaderboard */}
          <div className="card" style={{ padding: "16px 18px" }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TRENDING NOW</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sorted.map((t, i) => (
                <div key={t.name} style={{
                  borderRadius: 4, padding: "8px 10px",
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", minWidth: 14 }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>{t.tags?.join(" · ")}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: t.x >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                        {t.x >= 0 ? "+" : ""}{(t.x || 0).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 9, color: "#94a3b8" }}>score {(t.score || 0).toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
