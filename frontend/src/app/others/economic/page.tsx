"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const INDICATORS = [
  { key: "10Y Treasury", label: "10Y Treasury Yield", unit: "%", color: "#f59e0b", desc: "Long-term rate benchmark" },
  { key: "2Y Treasury", label: "2Y Treasury Yield", unit: "%", color: "#f97316", desc: "Fed policy proxy" },
  { key: "VIX", label: "VIX Fear Index", unit: "", color: "#ef4444", desc: "Market volatility / fear" },
  { key: "Gold", label: "Gold Price", unit: "$", color: "#eab308", desc: "Safe haven, inflation hedge" },
  { key: "DXY", label: "US Dollar Index", unit: "", color: "#8b5cf6", desc: "USD strength" },
];

export default function EconomicPage() {
  const [macro, setMacro] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.macro().then(d => setMacro(d.indicators)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300, margin: "0 auto", marginLeft: 192 }}>
      <div className="section-label mb-1">OTHERS · ECONOMIC INDICATORS</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Economic Indicators</h1>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>
        Key macro signals · FRED data in Phase 2 (Fed Funds Rate, CPI, PCE, Unemployment)
      </p>

      <div className="space-y-3">
        {INDICATORS.map(ind => {
          const d = macro[ind.key];
          if (!d && !loading) return null;
          return (
            <div key={ind.key} className="glass p-5">
              <div className="grid gap-4" style={{ gridTemplateColumns: "200px 1fr 120px" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {ind.label}
                  </div>
                  {loading || !d ? (
                    <div className="animate-pulse rounded h-8" style={{ background: "rgba(255,255,255,0.03)", width: 100 }} />
                  ) : (
                    <>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9" }}>
                        {ind.unit}{d.price >= 1000 ? d.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : d.price.toFixed(2)}{ind.unit === "%" ? "%" : ""}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: d.change >= 0 ? "#10b981" : "#ef4444", marginTop: 2 }}>
                        {d.change >= 0 ? "▲" : "▼"} {Math.abs(d.change).toFixed(2)}%
                      </div>
                      <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{ind.desc}</div>
                    </>
                  )}
                </div>
                <div>
                  {loading || !d ? (
                    <div className="animate-pulse rounded h-20" style={{ background: "rgba(255,255,255,0.03)" }} />
                  ) : (
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={d.history.map((v: number, i: number) => ({ i, v }))}>
                        <defs>
                          <linearGradient id={`g${ind.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ind.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={ind.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="i" hide />
                        <YAxis domain={["auto", "auto"]} hide />
                        <Tooltip formatter={(v: any) => [`${ind.unit}${Number(v).toFixed(2)}${ind.unit === "%" ? "%" : ""}`, ind.label]}
                          contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                        <Area type="monotone" dataKey="v" stroke={ind.color} strokeWidth={2} fill={`url(#g${ind.key})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="flex flex-col items-end justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.2)" }}>
                    Subscribe
                  </span>
                  <span style={{ fontSize: 9, color: "#334155" }}>Push notification</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass p-5 mt-5" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
        <div className="section-label mb-3">PHASE 2: FRED INDICATORS</div>
        <div className="grid grid-cols-3 gap-3">
          {["Fed Funds Rate", "CPI YoY", "Core PCE", "Unemployment", "ISM Manufacturing", "Consumer Confidence"].map(name => (
            <div key={name} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>FRED API · Free with key</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
