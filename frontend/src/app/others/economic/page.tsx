"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";

const INDICATORS = [
  { key: "10Y Treasury", label: "10Y Treasury Yield", unit: "%", color: "#f59e0b", desc: "Long-term borrowing benchmark — rising = tightening financial conditions" },
  { key: "VIX", label: "VIX Fear Index", unit: "", color: "#ef4444", desc: "Market volatility gauge — above 20 = elevated fear, above 30 = crisis territory" },
  { key: "Gold", label: "Gold (GC=F)", unit: "$", color: "#eab308", desc: "Safe haven & inflation hedge — rising gold often signals dollar weakness or macro stress" },
  { key: "DXY", label: "US Dollar Index", unit: "", color: "#8b5cf6", desc: "Strength of USD vs major currencies — inversely correlated with most risk assets" },
  { key: "Oil (WTI)", label: "Oil (WTI)", unit: "$", color: "#64748b", desc: "Key input cost & global demand proxy — drives energy sector and inflation expectations" },
];

const UPCOMING = [
  { name: "Fed Funds Rate", value: "5.25–5.50%", change: "—", next: "FOMC Jun 18", source: "Federal Reserve" },
  { name: "CPI YoY", value: "3.4%", change: "▼ 0.1%", next: "May 15", source: "BLS" },
  { name: "Core PCE YoY", value: "2.8%", change: "▼ 0.2%", next: "May 31", source: "BEA" },
  { name: "Unemployment", value: "3.9%", change: "▲ 0.1%", next: "Jun 7", source: "BLS" },
  { name: "ISM Manufacturing", value: "49.2", change: "▼ 0.5", next: "Jun 3", source: "ISM" },
  { name: "Consumer Confidence", value: "97.0", change: "▲ 1.2", next: "Jun 25", source: "Conference Board" },
];

export default function EconomicPage() {
  const [macro, setMacro] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.macro().then(d => setMacro(d.indicators)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 5 }}>RESEARCH HUB · ECONOMIC DATA</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Economic Indicators</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Live macro market signals + key economic calendar releases.</p>

        {/* Live indicators */}
        <div className="section-label" style={{ marginBottom: 12 }}>LIVE MARKET INDICATORS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {INDICATORS.map(ind => {
            const d = macro[ind.key];
            if (!d && !loading) return null;
            const pos = (d?.change ?? 0) >= 0;
            return (
              <div key={ind.key} className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 100px", gap: 20, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#94a3b8", marginBottom: 6 }}>{ind.label}</div>
                    {loading || !d ? (
                      <div style={{ height: 32, width: 120, background: "#f1f5f9", borderRadius: 4 }} />
                    ) : (
                      <>
                        <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                          {ind.unit === "$" ? "$" : ""}{d.price >= 1000 ? d.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : d.price.toFixed(2)}{ind.unit === "%" ? "%" : ""}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3, color: pos ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                          {pos ? "▲" : "▼"} {Math.abs(d.change ?? 0).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{ind.desc}</div>
                      </>
                    )}
                  </div>
                  <div>
                    {loading || !d ? (
                      <div style={{ height: 70, background: "#f8fafc", borderRadius: 4 }} />
                    ) : (
                      <ResponsiveContainer width="100%" height={70}>
                        <AreaChart data={(d.history ?? [d.price, d.price]).map((v: number, i: number) => ({ i, v }))}>
                          <defs>
                            <linearGradient id={`g${ind.key.replace(/\s/g,"")}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={ind.color} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={ind.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="i" hide />
                          <YAxis domain={["auto", "auto"]} hide />
                          <Tooltip formatter={(v: any) => [`${ind.unit === "$" ? "$" : ""}${Number(v).toFixed(2)}${ind.unit === "%" ? "%" : ""}`, ind.label]}
                            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11 }} />
                          <Area type="monotone" dataKey="v" stroke={ind.color} strokeWidth={2} fill={`url(#g${ind.key.replace(/\s/g,"")})`} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: ind.color, display: "inline-block", marginBottom: 4 }} />
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>Live</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Economic calendar */}
        <div className="section-label" style={{ marginBottom: 12 }}>ECONOMIC CALENDAR — KEY RELEASES</div>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th className="right">Current</th>
                <th className="right">MoM Change</th>
                <th>Next Release</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {UPCOMING.map(item => (
                <tr key={item.name}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>{item.name}</td>
                  <td className="right" style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{item.value}</td>
                  <td className="right" style={{ fontSize: 12, color: item.change.includes("▼") ? "#dc2626" : item.change.includes("▲") ? "#16a34a" : "#94a3b8" }}>{item.change}</td>
                  <td style={{ fontSize: 12, color: "#64748b" }}>{item.next}</td>
                  <td><span style={{ fontSize: 11, color: "#475569", background: "#f1f5f9", padding: "2px 8px", borderRadius: 3 }}>{item.source}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
