"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";

function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7FFFFFFF;
    return (s >>> 0) / 0x7FFFFFFF;
  };
}

function generateHistory(price: number, change: number, points = 60): number[] {
  const startPrice = price / (1 + change / 100);
  const rng = seededRng(Math.abs(Math.floor(price * 37)) % 99991 + 1);
  const drift = (price - startPrice) / (points - 1);
  const vol = Math.abs(price - startPrice) / points * 1.8 + price * 0.002;
  const values: number[] = [startPrice];
  for (let i = 1; i < points - 1; i++) {
    const prev = values[i - 1];
    values.push(+(prev + drift + (rng() - 0.5) * vol).toFixed(4));
  }
  values.push(price);
  return values;
}

const MACRO_META: Record<string, { icon: string; unit: string; color: string; group: string; commentary: string }> = {
  "S&P 500":     { icon: "📈", unit: "pts", color: "#1d4ed8", group: "US Equity",     commentary: "US large-cap benchmark. Primary risk-appetite indicator. 500 largest public US companies." },
  "Nasdaq":      { icon: "💻", unit: "pts", color: "#7c3aed", group: "US Equity",     commentary: "Tech-heavy composite. Highly sensitive to rate expectations, AI narrative, and growth multiples." },
  "Dow Jones":   { icon: "🏭", unit: "pts", color: "#0891b2", group: "US Equity",     commentary: "30 blue-chip industrials. More defensive than Nasdaq. Less sensitive to tech multiples." },
  "VIX":         { icon: "😱", unit: "%",   color: "#dc2626", group: "US Equity",     commentary: "CBOE Volatility Index — fear gauge. >30 = high fear. 20–30 = elevated. <15 = complacent/bullish." },
  "10Y Treasury":{ icon: "🏛️", unit: "%",  color: "#b45309", group: "Rates",         commentary: "Key rate benchmark. Rising = discount rate pressure on equities, USD strength." },
  "5Y Treasury": { icon: "📋", unit: "%",   color: "#d97706", group: "Rates",         commentary: "Mid-curve rate. Reflects 5-year inflation and Fed expectations. Watch for curve steepening." },
  "30Y Treasury":{ icon: "🏦", unit: "%",   color: "#92400e", group: "Rates",         commentary: "Long-end rate. Driven by inflation and fiscal outlook. Mortgage rates follow." },
  "Gold":        { icon: "🥇", unit: "$",   color: "#ca8a04", group: "Commodities",   commentary: "Safe haven & inflation hedge. Inversely correlated with DXY and real yields." },
  "Silver":      { icon: "🥈", unit: "$",   color: "#94a3b8", group: "Commodities",   commentary: "Dual role: safe haven + industrial metal. More volatile than gold. High beta to risk-on moves." },
  "Oil (WTI)":   { icon: "🛢️", unit: "$",  color: "#57534e", group: "Commodities",   commentary: "West Texas Intermediate crude. Inflation driver, economic activity proxy. Geopolitically sensitive." },
  "Natural Gas":  { icon: "🔥", unit: "$",   color: "#ea580c", group: "Commodities",   commentary: "Energy transition wildcard. EU exposure, LNG exports, weather-driven seasonality." },
  "Copper":      { icon: "🔶", unit: "$",   color: "#c2410c", group: "Commodities",   commentary: "'Dr. Copper' — leading economic indicator. Rising = growth expectations, industrial expansion." },
  "DXY":         { icon: "💵", unit: "pts", color: "#1e40af", group: "FX & Crypto",   commentary: "Dollar strength index vs basket of 6 major currencies. Inversely correlated with EM, commodities." },
  "EUR/USD":     { icon: "🇪🇺", unit: "",  color: "#1d4ed8", group: "FX & Crypto",   commentary: "Most traded FX pair. EUR weakness = ECB dovishness or EU macro stress." },
  "USD/JPY":     { icon: "🇯🇵", unit: "",  color: "#0891b2", group: "FX & Crypto",   commentary: "USD/JPY measures yen strength vs the dollar. High = weak yen (carry trade, BOJ ultra-loose). A key barometer of risk appetite and Japan's reflation trade." },
  "Bitcoin":     { icon: "₿",  unit: "$",   color: "#f59e0b", group: "FX & Crypto",   commentary: "Digital gold narrative + risk asset. High beta to liquidity conditions and Fed policy." },
  "Nikkei 225":  { icon: "🗾", unit: "pts", color: "#16a34a", group: "International", commentary: "Japan's benchmark. Benefiting from yen weakness and domestic reflation. Buffett effect in play." },
  "DAX":         { icon: "🇩🇪", unit: "pts",color: "#0ea5e9", group: "International", commentary: "Germany's index — EU's largest economy. Manufacturing & exports exposure. Energy-sensitive." },
  "FTSE 100":    { icon: "🇬🇧", unit: "pts",color: "#7c3aed", group: "International", commentary: "UK's blue-chips. Heavy in energy/financials. GBP and commodity prices as key drivers." },
  "Hang Seng":   { icon: "🇨🇳", unit: "pts",color: "#dc2626", group: "International", commentary: "HK benchmark — proxy for China growth. Property sector, stimulus policy, geopolitics." },
};

const GROUPS = ["All", "US Equity", "Rates", "Commodities", "FX & Crypto", "International"];

export default function MacroPage() {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState("S&P 500");
  const [group, setGroup] = useState("All");

  useEffect(() => {
    api.macro().then(d => setData(d.indicators)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selData = data[sel];
  const meta = MACRO_META[sel] || { icon: "📊", unit: "", color: "#64748b", group: "", commentary: "" };

  const allEntries = Object.entries(data).filter(([name]) => MACRO_META[name]);
  const filteredEntries = group === "All" ? allEntries : allEntries.filter(([n]) => MACRO_META[n]?.group === group);
  const flowItems = [...filteredEntries]
    .map(([name, d]) => ({ name, change: d.change ?? 0 }))
    .sort((a, b) => b.change - a.change);

  const maxFlow = Math.max(...flowItems.map(i => Math.abs(i.change)), 1);

  const historyData = (selData?.history ?? generateHistory(selData?.price ?? 100, selData?.change ?? 0))
    .map((v: number, i: number) => ({ i, v }));

  // Normalize to index = 100 at start for cleaner chart display
  const base = historyData[0]?.v || 1;
  const indexedData = historyData.map((d: any) => ({ i: d.i, v: +((d.v / base) * 100).toFixed(3) }));

  const yieldCurve = data["10Y Treasury"] && data["30Y Treasury"]
    ? data["30Y Treasury"].price - data["10Y Treasury"].price
    : null;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 4 }}>RESEARCH · MACRO INDEX</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Macro Index Dashboard
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
          {Object.keys(data).length} live indicators across equities, rates, commodities, FX & international.
        </p>

        {/* Group filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {GROUPS.map(g => (
            <button key={g} onClick={() => setGroup(g)} style={{
              padding: "5px 14px", fontSize: 11, fontWeight: 700, fontFamily: "inherit",
              background: group === g ? "#1e3a5f" : "#f1f5f9",
              color: group === g ? "#fff" : "#475569",
              border: "none", borderRadius: 4, cursor: "pointer",
            }}>{g}</button>
          ))}
        </div>

        {/* Flow-show horizontal bar chart */}
        <div className="card" style={{ padding: "14px 18px", marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>FLOW SHOW — % CHANGE (LATEST)</div>
          {loading ? (
            <div style={{ height: 200, background: "#f8fafc", borderRadius: 4 }} />
          ) : (
            <div style={{ height: Math.max(flowItems.length * 24 + 32, 120) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowItems} layout="vertical" margin={{ left: 110, right: 70, top: 2, bottom: 2 }} barSize={10}>
                  <XAxis type="number" domain={[-maxFlow * 1.2, maxFlow * 1.2]}
                    tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                    tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110}
                    tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: any) => [`${Number(v) >= 0 ? "+" : ""}${Number(v).toFixed(3)}%`, "Change"]}
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11 }} />
                  <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
                  <Bar dataKey="change" radius={[0, 2, 2, 0]} onClick={(d: any) => setSel(d.name)} style={{ cursor: "pointer" }}>
                    {flowItems.map((item, i) => (
                      <Cell key={i}
                        fill={item.change >= 0 ? "#16a34a" : "#dc2626"}
                        fillOpacity={sel === item.name ? 1 : 0.55 + Math.min(Math.abs(item.change) / maxFlow, 1) * 0.4}
                        stroke={sel === item.name ? (item.change >= 0 ? "#15803d" : "#b91c1c") : "none"}
                        strokeWidth={1.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Card grid */}
        <div style={{ display: "grid", gap: 8, marginBottom: 16, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          {loading
            ? Array(10).fill(0).map((_, i) => <div key={i} style={{ height: 82, background: "#f1f5f9", borderRadius: 6 }} />)
            : filteredEntries.map(([name, d]) => {
              const m = MACRO_META[name] || { icon: "📊", color: "#64748b" };
              const pos = d.change >= 0;
              const isVIX = name === "VIX";
              const changeColor = isVIX ? (pos ? "#d97706" : "#16a34a") : (pos ? "#16a34a" : "#dc2626");
              return (
                <div key={name} onClick={() => setSel(name)} className="card" style={{
                  padding: "10px 12px", cursor: "pointer",
                  borderColor: sel === name ? m.color : "#e2e8f0",
                  outline: sel === name ? `2px solid ${m.color}` : "none",
                  outlineOffset: -1,
                  background: sel === name ? `${m.color}09` : "#fff",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{m.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: changeColor, fontVariantNumeric: "tabular-nums" }}>
                      {pos ? "▲" : "▼"}{Math.abs(d.change).toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 2, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                    {name.includes("Treasury") || isVIX
                      ? `${d.price.toFixed(2)}${isVIX ? "" : "%"}`
                      : name === "EUR/USD"
                      ? d.price.toFixed(4)
                      : name === "USD/JPY"
                      ? d.price.toFixed(2)
                      : d.price >= 1000
                      ? d.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : `$${d.price.toFixed(2)}`}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Detail panel */}
        {selData && (
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 300px" }}>
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{meta.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>{sel}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      {sel.includes("Treasury")
                        ? `${selData.price.toFixed(3)}%`
                        : sel === "VIX"
                        ? selData.price.toFixed(2)
                        : sel === "EUR/USD"
                        ? selData.price.toFixed(4)
                        : sel === "USD/JPY"
                        ? selData.price.toFixed(2)
                        : selData.price >= 1000
                        ? selData.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : `$${selData.price.toFixed(2)}`}
                      &nbsp;
                      <span style={{ fontWeight: 700, color: sel === "VIX" ? (selData.change >= 0 ? "#d97706" : "#16a34a") : (selData.change >= 0 ? "#16a34a" : "#dc2626") }}>
                        {selData.change >= 0 ? "▲+" : "▼"}{selData.change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 3, background: "#f1f5f9", color: "#64748b" }}>
                  {meta.group}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                Indexed to 100 (start of period) · Estimated 60-day trend · Illustrative only
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={indexedData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <defs>
                    <linearGradient id="mg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={meta.color} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="i" hide />
                  <YAxis domain={["auto", "auto"]}
                    tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => v.toFixed(1)} width={40} />
                  <Tooltip
                    formatter={(v: any) => [`${Number(v).toFixed(2)} (indexed)`, sel]}
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11 }}
                  />
                  <ReferenceLine y={100} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="v" stroke={meta.color} strokeWidth={2} fill="url(#mg2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Commentary */}
              <div className="card" style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                  <span>📋</span>
                  <div className="section-label">INDICATOR CONTEXT</div>
                </div>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{meta.commentary}</p>
              </div>

              {/* Momentum signal */}
              <div className="card" style={{ padding: "14px 16px", background: sel === "VIX" ? (selData.change >= 0 ? "#fffbeb" : "#f0fdf4") : (selData.change >= 0 ? "#f0fdf4" : "#fef2f2"), borderColor: sel === "VIX" ? (selData.change >= 0 ? "#fcd34d" : "#86efac") : (selData.change >= 0 ? "#86efac" : "#fca5a5") }}>
                <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>MOMENTUM SIGNAL</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: sel === "VIX" ? (selData.change >= 0 ? "#d97706" : "#16a34a") : (selData.change >= 0 ? "#16a34a" : "#dc2626") }}>
                  {selData.change >= 3 ? "Strong Uptrend" : selData.change >= 0.5 ? "Uptrend" : selData.change > -0.5 ? "Neutral" : selData.change > -3 ? "Downtrend" : "Strong Downtrend"}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  {Math.abs(selData.change).toFixed(2)}% {selData.change >= 0 ? "gain" : "loss"} · Price momentum only · Not investment advice
                </div>
              </div>

              {/* Yield curve */}
              {yieldCurve !== null && sel.includes("Treasury") && (
                <div className="card" style={{ padding: "14px 16px", background: "#fffbeb", borderColor: "#fcd34d" }}>
                  <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" as const, marginBottom: 6 }}>YIELD CURVE (30Y − 10Y)</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: yieldCurve >= 0 ? "#16a34a" : "#dc2626" }}>
                    {yieldCurve >= 0 ? "Normal ✓" : "Inverted ⚠️"}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Spread: {yieldCurve.toFixed(3)}%</div>
                </div>
              )}

              {/* Stats summary */}
              <div className="card" style={{ padding: "14px 16px" }}>
                <div className="section-label" style={{ marginBottom: 10 }}>QUICK STATS</div>
                {[
                  { label: "Current", value: sel.includes("Treasury") ? `${selData.price.toFixed(3)}%` : sel === "VIX" ? selData.price.toFixed(2) : sel === "EUR/USD" ? selData.price.toFixed(4) : sel === "USD/JPY" ? selData.price.toFixed(2) : selData.price >= 1000 ? selData.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : `$${selData.price.toFixed(2)}` },
                  { label: "Change", value: `${selData.change >= 0 ? "+" : ""}${selData.change.toFixed(3)}%` },
                  { label: "Period Start (est.)", value: (() => { const s = selData.price / (1 + selData.change / 100); return s >= 1000 ? s.toLocaleString(undefined, { maximumFractionDigits: 0 }) : s.toFixed(2); })() },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: "#94a3b8" }}>{r.label}</span>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
