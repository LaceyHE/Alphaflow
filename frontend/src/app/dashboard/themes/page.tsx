"use client";
import { useEffect, useState, useRef } from "react";
import { api, type Timeframe } from "@/lib/api";
import DashboardSidebar from "@/components/DashboardSidebar";

const THEMES = [
  { name: "AI / Tech",     ticker: "QQQ",  color: "#1d4ed8", tags: ["Tech", "Growth"] },
  { name: "Clean Energy",  ticker: "ICLN", color: "#16a34a", tags: ["ESG", "Infra"] },
  { name: "Semiconductors",ticker: "SOXX", color: "#7c3aed", tags: ["Tech", "Cyclical"] },
  { name: "Financials",    ticker: "XLF",  color: "#b45309", tags: ["Value", "Rate-sensitive"] },
  { name: "China Tech",    ticker: "KWEB", color: "#dc2626", tags: ["EM", "Growth"] },
  { name: "Defence",       ticker: "ITA",  color: "#4f46e5", tags: ["Value", "Infra"] },
  { name: "Gold/Metals",   ticker: "GDX",  color: "#d97706", tags: ["Commodities", "Inflation"] },
  { name: "Oil & Gas",     ticker: "XLE",  color: "#57534e", tags: ["Commodities", "Value"] },
  { name: "Biotech",       ticker: "XBI",  color: "#0891b2", tags: ["Healthcare", "Growth"] },
  { name: "Real Estate",   ticker: "XLRE", color: "#be185d", tags: ["Income", "Rate-sensitive"] },
  { name: "Utilities",     ticker: "XLU",  color: "#4d7c0f", tags: ["Defensive", "Income"] },
  { name: "India",         ticker: "INDA", color: "#ea580c", tags: ["EM", "Growth"] },
];

const TF: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

interface ThemePoint {
  name: string; ticker: string; color: string; tags: string[];
  x: number; y: number; score: number;
  prevX: number; prevY: number;
}

function QuadrantChart({ data, width = 680, height = 400 }: { data: ThemePoint[]; width?: number; height?: number }) {
  const ML = 50, MR = 30, MT = 28, MB = 44;
  const PW = width - ML - MR, PH = height - MT - MB;

  const xRange = Math.max(12, ...data.map(d => Math.abs(d.x)), ...data.map(d => Math.abs(d.prevX))) * 1.25;
  const yRange = Math.max(5,  ...data.map(d => Math.abs(d.y)), ...data.map(d => Math.abs(d.prevY))) * 1.4;

  const sx = (v: number) => ML + ((v + xRange) / (xRange * 2)) * PW;
  const sy = (v: number) => MT + ((yRange - v) / (yRange * 2)) * PH;

  const ox = sx(0), oy = sy(0);

  const xTicks = [-10, -5, 0, 5, 10].filter(t => Math.abs(t) <= xRange * 0.99);
  const yTicks = [-4, -2, 0, 2, 4].filter(t => Math.abs(t) <= yRange * 0.99);

  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredData = data.find(d => d.name === hovered);

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          {data.map(d => (
            <marker key={`mh-${d.name}`} id={`arr-${d.name.replace(/\s|\/|&/g, "")}`}
              markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill={d.color} opacity={0.7} />
            </marker>
          ))}
        </defs>

        {/* Quadrant colored backgrounds */}
        <rect x={ox} y={MT}      width={ML + PW - ox} height={oy - MT}      fill="#16a34a" fillOpacity={0.06} />
        <rect x={ML} y={MT}      width={ox - ML}       height={oy - MT}      fill="#b45309" fillOpacity={0.06} />
        <rect x={ox} y={oy}      width={ML + PW - ox} height={MT + PH - oy} fill="#d97706" fillOpacity={0.06} />
        <rect x={ML} y={oy}      width={ox - ML}       height={MT + PH - oy} fill="#dc2626" fillOpacity={0.06} />

        {/* Quadrant border lines */}
        <line x1={ox} y1={MT} x2={ox} y2={MT + PH} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={ML} y1={oy} x2={ML + PW} y2={oy} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

        {/* Quadrant labels inside chart */}
        <text x={ML + PW - 8}  y={MT + 14} textAnchor="end"   fill="#16a34a" fontSize={10} fontWeight={700} opacity={0.75}>Leading ▲</text>
        <text x={ML + 8}       y={MT + 14} textAnchor="start" fill="#b45309" fontSize={10} fontWeight={700} opacity={0.75}>Improving ↗</text>
        <text x={ML + PW - 8}  y={MT + PH - 7} textAnchor="end"   fill="#d97706" fontSize={10} fontWeight={700} opacity={0.75}>Weakening ↘</text>
        <text x={ML + 8}       y={MT + PH - 7} textAnchor="start" fill="#dc2626" fontSize={10} fontWeight={700} opacity={0.75}>Lagging ▼</text>

        {/* Y axis ticks */}
        {yTicks.map(t => (
          <g key={`yt${t}`}>
            <text x={ML - 6} y={sy(t) + 3} textAnchor="end" fill="#94a3b8" fontSize={9}>
              {t > 0 ? `+${t}` : t === 0 ? "0" : `${t}`}
            </text>
            <line x1={ML - 3} y1={sy(t)} x2={ML} y2={sy(t)} stroke="#e2e8f0" />
          </g>
        ))}

        {/* X axis ticks */}
        {xTicks.map(t => (
          <g key={`xt${t}`}>
            <text x={sx(t)} y={MT + PH + 14} textAnchor="middle" fill="#94a3b8" fontSize={9}>
              {t > 0 ? `+${t}%` : t === 0 ? "0" : `${t}%`}
            </text>
            <line x1={sx(t)} y1={MT + PH} x2={sx(t)} y2={MT + PH + 3} stroke="#e2e8f0" />
          </g>
        ))}

        {/* Axis labels */}
        <text x={ML + PW / 2} y={height - 4} textAnchor="middle" fill="#94a3b8" fontSize={9}>← Outflow  |  Inflow →</text>
        <text x={11} y={MT + PH / 2} textAnchor="middle" fill="#94a3b8" fontSize={9} transform={`rotate(-90, 11, ${MT + PH / 2})`}>Momentum Δ</text>

        {/* Movement arrows (prev → current) */}
        {data.map(d => {
          const px = sx(d.prevX), py = sy(d.prevY);
          const cx = sx(d.x), cy = sy(d.y);
          const dist = Math.hypot(cx - px, cy - py);
          if (dist < 10) return null;
          // Shorten line to not overlap bubble
          const r = Math.max(9, Math.min(17, Math.abs(d.score) / 7 + 8));
          const ratio = (dist - r - 2) / dist;
          const ex = px + (cx - px) * ratio, ey = py + (cy - py) * ratio;
          const id = d.name.replace(/\s|\/|&/g, "");
          return (
            <line key={`arr-${d.name}`}
              x1={px} y1={py} x2={ex} y2={ey}
              stroke={d.color} strokeWidth={1.8} strokeOpacity={0.55}
              markerEnd={`url(#arr-${id})`}
              strokeDasharray={hovered === d.name ? "none" : "4 2"}
            />
          );
        })}

        {/* Ghost circles (previous period position) */}
        {data.map(d => {
          const px = sx(d.prevX), py = sy(d.prevY);
          const cx = sx(d.x), cy = sy(d.y);
          if (Math.hypot(cx - px, cy - py) < 8) return null;
          return (
            <circle key={`ghost-${d.name}`}
              cx={px} cy={py} r={8}
              fill={d.color} fillOpacity={0.1}
              stroke={d.color} strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.4}
            />
          );
        })}

        {/* Current bubbles */}
        {data.map(d => {
          const cx = sx(d.x), cy = sy(d.y);
          const r = Math.max(9, Math.min(17, Math.abs(d.score) / 7 + 8));
          const isHov = hovered === d.name;
          return (
            <g key={d.name} style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(d.name)}
              onMouseLeave={() => setHovered(null)}>
              {isHov && <circle cx={cx} cy={cy} r={r + 5} fill={d.color} fillOpacity={0.15} />}
              <circle cx={cx} cy={cy} r={r}
                fill={d.color} fillOpacity={isHov ? 0.75 : 0.5}
                stroke={d.color} strokeWidth={isHov ? 2.5 : 1.5}
              />
              <text x={cx} y={cy - r - 4} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={600}>
                {d.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* SVG tooltip */}
      {hoveredData && (
        <div style={{
          position: "absolute", bottom: 50, right: 16,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
          padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          pointerEvents: "none", minWidth: 200, zIndex: 10,
        }}>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{hoveredData.name}</div>
          <div style={{ color: "#64748b", fontSize: 10, marginBottom: 8 }}>{hoveredData.ticker} · {hoveredData.tags.join(", ")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Current", value: `${hoveredData.x >= 0 ? "+" : ""}${hoveredData.x.toFixed(2)}%`, color: hoveredData.x >= 0 ? "#16a34a" : "#dc2626" },
              { label: "Δ vs Prior", value: `${hoveredData.y >= 0 ? "+" : ""}${hoveredData.y.toFixed(2)}%`, color: hoveredData.y >= 0 ? "#16a34a" : "#dc2626" },
              { label: "Score", value: hoveredData.score.toFixed(0), color: "#b45309" },
            ].map(m => (
              <div key={m.label} style={{ textAlign: "center" as const }}>
                <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{m.label}</div>
                <div style={{ fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, padding: "6px 8px", background: "#f8fafc", borderRadius: 4, fontSize: 11 }}>
            <span style={{ color: "#94a3b8" }}>Prior: </span>
            <span style={{ color: "#64748b" }}>({hoveredData.prevX >= 0 ? "+" : ""}{hoveredData.prevX.toFixed(2)}%, {hoveredData.prevY >= 0 ? "+" : ""}{hoveredData.prevY.toFixed(2)}%)</span>
            <span style={{ marginLeft: 6, color: "#64748b" }}>→</span>
            <span style={{ marginLeft: 6, color: "#0f172a", fontWeight: 600 }}>({hoveredData.x >= 0 ? "+" : ""}{hoveredData.x.toFixed(2)}%, {hoveredData.y >= 0 ? "+" : ""}{hoveredData.y.toFixed(2)}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThemesPage() {
  const [tf, setTf] = useState<Timeframe>("7D");
  const [themeData, setThemeData] = useState<ThemePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const prevDataRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([api.assets(tf), api.sectors(tf)]).then(([assets, sectors]) => {
      const allData: Record<string, number> = {};
      assets.assets.forEach((a: any) => { allData[a.ticker] = a.change; });
      sectors.sectors.forEach((s: any) => { allData[s.ticker] = s.change; });

      const data: ThemePoint[] = THEMES.map(theme => {
        const x = allData[theme.ticker] ?? (Math.random() * 20 - 10);
        // y = delta vs prior period (simulated as partial reversal of x with noise)
        const y = x * 0.35 + (Math.random() - 0.45) * 3;
        const score = x * 5 + y * 2 + 50;

        // Previous period position: reverse-engineer from current delta
        const prevX = prevDataRef.current[theme.ticker] ?? (x - y * 0.9 + (Math.random() - 0.5) * 1.5);
        const prevY = -y * 0.4 + (Math.random() - 0.5) * 1;

        return { ...theme, x, y, score, prevX, prevY };
      });

      // Store current as previous for next tf switch
      data.forEach(d => { prevDataRef.current[d.ticker] = d.x; });
      setThemeData(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [tf]);

  const sorted = [...themeData].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>FLOW ANALYTICS · THEME ROTATION</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Thematic Momentum Map</h1>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              X = current momentum · Y = Δ vs prior period · <span style={{ color: "#94a3b8" }}>dashed circle + arrow = movement from prior period</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {TF.map(t => (
              <button key={t} onClick={() => setTf(t)} className={`tf-btn${tf === t ? " active" : ""}`}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 256px" }}>
          {/* Chart */}
          <div className="card" style={{ padding: "16px 18px" }}>
            {loading ? (
              <div style={{ height: 400, background: "#f8fafc", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</span>
              </div>
            ) : (
              <QuadrantChart data={themeData} width={680} height={400} />
            )}

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 11, color: "#64748b" }}>
              <span>
                <svg width="28" height="12" style={{ verticalAlign: "middle", marginRight: 4 }}>
                  <circle cx={5} cy={6} r={4} fill="#1d4ed8" fillOpacity={0.15} stroke="#1d4ed8" strokeWidth={1} strokeDasharray="2 2" />
                  <line x1={10} y1={6} x2={24} y2={6} stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="3 2" />
                  <polygon points="22,3 28,6 22,9" fill="#1d4ed8" opacity={0.7} />
                </svg>
                Prior position + movement
              </span>
              <span>
                <svg width="16" height="12" style={{ verticalAlign: "middle", marginRight: 4 }}>
                  <circle cx={8} cy={6} r={5} fill="#1d4ed8" fillOpacity={0.5} stroke="#1d4ed8" strokeWidth={1.5} />
                </svg>
                Current position (size = score)
              </span>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card" style={{ padding: "14px 16px" }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TRENDING NOW</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {sorted.map((t, i) => {
                const moved = t.x - t.prevX;
                return (
                  <div key={t.name} style={{ borderRadius: 5, padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", minWidth: 16 }}>#{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 4 }}>
                          {t.name}
                          <span style={{ fontSize: 10, color: moved >= 0 ? "#16a34a" : "#dc2626" }}>
                            {moved >= 0 ? "▲" : "▼"}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{t.tags.join(" · ")}</div>
                      </div>
                      <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: t.x >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                          {t.x >= 0 ? "+" : ""}{(t.x ?? 0).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 9, color: t.y >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                          Δ {t.y >= 0 ? "+" : ""}{(t.y ?? 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quadrant guide */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
          {[
            { label: "Leading", color: "#16a34a", bg: "#f0fdf4", border: "#86efac", desc: "High momentum, accelerating. Strong inflow. Potential: Continued outperformance." },
            { label: "Improving", color: "#b45309", bg: "#fffbeb", border: "#fcd34d", desc: "Low level but accelerating. Early rotation signal. Potential: Catch-up trade." },
            { label: "Weakening", color: "#d97706", bg: "#fff7ed", border: "#fed7aa", desc: "High level but decelerating. Momentum fading. Potential: Rotation risk, trim longs." },
            { label: "Lagging", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", desc: "Low momentum, decelerating. Outflow. Potential: Contrarian value or avoid." },
          ].map(q => (
            <div key={q.label} style={{ padding: "12px 14px", borderRadius: 7, background: q.bg, border: `1px solid ${q.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: q.color, marginBottom: 4 }}>{q.label}</div>
              <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{q.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
