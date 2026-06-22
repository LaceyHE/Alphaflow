"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";

function generateHistory(price: number, change: number): number[] {
  const startPrice = price / (1 + change / 100);
  return Array.from({ length: 30 }, (_, i) => {
    const t = i / 29;
    const noise = Math.sin(i * 1.7) * price * 0.003;
    return +(startPrice + (price - startPrice) * t + noise).toFixed(4);
  });
}

const MACRO_META: Record<string, { icon: string; unit: string; color: string; commentary?: string }> = {
  "S&P 500":      { icon: "📈", unit: "pts", color: "#1d4ed8", commentary: "US large-cap benchmark. Leading risk-appetite indicator." },
  "Nasdaq":       { icon: "💻", unit: "pts", color: "#7c3aed", commentary: "Tech-heavy. Sensitive to rate expectations and AI narrative." },
  "Dow Jones":    { icon: "🏭", unit: "pts", color: "#0891b2", commentary: "30 blue-chips. More defensive than Nasdaq." },
  "VIX":          { icon: "😱", unit: "%",   color: "#dc2626", commentary: "Fear index. >30 = high fear. >20 = elevated. <15 = complacent." },
  "10Y Treasury": { icon: "🏛️", unit: "%",   color: "#b45309", commentary: "Key rate benchmark. Rising = risk-off pressure on equities." },
  "2Y Treasury":  { icon: "💰", unit: "%",   color: "#d97706", commentary: "Fed policy proxy. Tracks expected overnight rates." },
  "Gold":         { icon: "🥇", unit: "$",   color: "#ca8a04", commentary: "Safe haven & inflation hedge. Inverse USD often." },
  "Oil (WTI)":    { icon: "🛢️", unit: "$",   color: "#57534e", commentary: "Economic activity proxy. Inflation driver." },
  "DXY":          { icon: "💵", unit: "pts", color: "#7c3aed", commentary: "Dollar strength index. Inverse EM equities, commodities." },
};

export default function MacroPage() {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState("S&P 500");

  useEffect(() => {
    api.macro().then(d => setData(d.indicators)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const selData = data[sel];
  const meta = MACRO_META[sel] || { icon: "📊", unit: "", color: "#64748b" };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div className="page-content">
        <div style={{ marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 3 }}>RESEARCH · MACRO INDEX</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Macro Index Dashboard</h1>
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>Key indices and AI commentary. Click any card for details.</p>
        </div>

        {/* Index grid */}
        <div style={{ display: "grid", gap: 10, marginBottom: 16, gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))" }}>
          {loading
            ? Array(9).fill(0).map((_,i) => <div key={i} style={{ height: 88, background: "#f1f5f9", borderRadius: 6 }} />)
            : Object.entries(data).map(([name, d]: [string, any]) => {
              const m = MACRO_META[name] || { icon: "📊", color: "#64748b" };
              const pos = d.change >= 0;
              return (
                <div key={name} className="card" style={{
                  padding: "12px 14px", cursor: "pointer",
                  borderColor: sel === name ? m.color : "#e2e8f0",
                  outline: sel === name ? `1.5px solid ${m.color}` : "none",
                  outlineOffset: -1,
                  background: sel === name ? `${m.color}07` : "#fff",
                }} onClick={() => setSel(name)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{m.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: pos ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                      {pos ? "▲" : "▼"} {Math.abs(d.change).toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", lineHeight: 1.3, marginBottom: 3 }}>{name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                    {name.includes("Treasury") || name === "VIX"
                      ? `${d.price.toFixed(2)}%`
                      : d.price >= 1000
                      ? d.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : d.price.toFixed(2)}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Detail chart + commentary */}
        {selData && (
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 280px" }}>
            <div className="card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 22 }}>{meta.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{sel}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {selData.price.toFixed(2)} {meta.unit} &nbsp;
                    <span style={{ fontWeight: 700, color: selData.change >= 0 ? "#16a34a" : "#dc2626" }}>
                      {selData.change >= 0 ? "+" : ""}{selData.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={(selData.history ?? generateHistory(selData.price, selData.change)).map((v: number, i: number) => ({ i, v }))}>
                  <defs>
                    <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={meta.color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="i" hide />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={55}
                    tickFormatter={v => sel.includes("Treasury") || sel === "VIX" ? `${v.toFixed(2)}%` : v >= 1000 ? (v/1000).toFixed(1)+"k" : v.toFixed(0)} />
                  <Tooltip
                    formatter={(v: any) => [sel.includes("Treasury") || sel === "VIX" ? `${Number(v).toFixed(3)}%` : `${Number(v).toFixed(2)}`, sel]}
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                  />
                  <Area type="monotone" dataKey="v" stroke={meta.color} strokeWidth={1.5} fill="url(#mg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span>🤖</span>
                <div className="section-label">AI COMMENTARY</div>
              </div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                {meta.commentary || "No commentary available."}
              </div>
              <div style={{
                marginTop: 14, borderRadius: 5, padding: "10px 12px",
                background: selData.change >= 0 ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${selData.change >= 0 ? "#86efac" : "#fca5a5"}`,
              }}>
                <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>CTA Signal</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: selData.change >= 0 ? "#16a34a" : "#dc2626" }}>
                  {selData.change >= 2 ? "Strong BUY" : selData.change >= 0 ? "BUY" : selData.change > -2 ? "SELL" : "Strong SELL"}
                </div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>
                  Based on {Math.abs(selData.change).toFixed(2)}% {selData.change >= 0 ? "gain" : "loss"} · Trend following
                </div>
              </div>

              {data["10Y Treasury"] && data["2Y Treasury"] && sel.includes("Treasury") && (
                <div style={{
                  marginTop: 10, borderRadius: 5, padding: "10px 12px",
                  background: "#fffbeb", border: "1px solid #fcd34d",
                }}>
                  <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>Yield Curve</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#b45309" }}>
                    {data["10Y Treasury"].price > data["2Y Treasury"].price ? "Normal ✓" : "Inverted ⚠️"}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                    Spread: {(data["10Y Treasury"].price - data["2Y Treasury"].price).toFixed(2)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
