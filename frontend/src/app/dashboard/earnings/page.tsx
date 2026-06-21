"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";

const STOCKS = [
  { name: "NVDA", sector: "Technology", date: "May 22", pre: -2.1, beat: 18.5, post: 12.3, eps_est: 5.52, eps_act: 6.56, rev_est: 24.6, rev_act: 26.0 },
  { name: "AAPL", sector: "Technology", date: "May 2", pre: 1.2, beat: 2.1, post: -3.8, eps_est: 1.43, eps_act: 1.52, rev_est: 90.3, rev_act: 90.8 },
  { name: "META", sector: "Communication", date: "Apr 24", pre: 3.4, beat: 5.7, post: 4.2, eps_est: 5.12, eps_act: 5.71, rev_est: 36.2, rev_act: 36.5 },
  { name: "MSFT", sector: "Technology", date: "Apr 25", pre: -0.8, beat: 1.3, post: 2.1, eps_est: 3.10, eps_act: 3.23, rev_est: 60.9, rev_act: 61.9 },
  { name: "GOOGL", sector: "Communication", date: "Apr 25", pre: 2.1, beat: 4.8, post: 3.2, eps_est: 2.01, eps_act: 2.12, rev_est: 78.7, rev_act: 80.5 },
  { name: "AMZN", sector: "Consumer Disc.", date: "Apr 30", pre: 0.9, beat: -0.5, post: -2.3, eps_est: 1.36, eps_act: 1.59, rev_est: 142.6, rev_act: 143.3 },
  { name: "TSLA", sector: "Consumer Disc.", date: "Apr 23", pre: -4.2, beat: -8.1, post: -12.3, eps_est: 0.55, eps_act: 0.27, rev_est: 23.5, rev_act: 21.3 },
  { name: "JPM", sector: "Financials", date: "Apr 12", pre: 1.4, beat: 6.2, post: 3.1, eps_est: 4.11, eps_act: 4.44, rev_est: 41.8, rev_act: 42.5 },
];

function buildTimeline(stock: typeof STOCKS[0]) {
  return [
    { t: -10, v: 0 }, { t: -5, v: -stock.pre * 0.3 }, { t: -1, v: stock.pre },
    { t: 0, v: stock.pre + stock.beat }, { t: 1, v: stock.post + stock.beat },
    { t: 5, v: stock.post * 0.7 + stock.beat }, { t: 10, v: stock.post * 0.4 + stock.beat },
  ];
}

function ChartTT({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <span style={{ fontWeight: 700, color: v >= 0 ? "#16a34a" : "#dc2626" }}>{v >= 0 ? "+" : ""}{Number(v).toFixed(2)}%</span>
    </div>
  );
}

export default function EarningsPage() {
  const [sel, setSel] = useState(STOCKS[0]);
  const tlData = buildTimeline(sel);
  const surprise = ((sel.eps_act - sel.eps_est) / sel.eps_est * 100);
  const revSurprise = ((sel.rev_act - sel.rev_est) / sel.rev_est * 100);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 5 }}>DASHBOARD · EARNINGS</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Earnings Review</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Stock performance before & after earnings. EPS beat/miss analysis — Q1 2024 season.</p>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
          {/* Stock list */}
          <div className="card" style={{ padding: "14px 0", height: "fit-content" }}>
            <div style={{ padding: "0 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
              <div className="section-label">RECENT EARNINGS</div>
            </div>
            {STOCKS.map(s => (
              <button key={s.name} onClick={() => setSel(s)} style={{
                width: "100%", padding: "10px 14px", border: "none",
                background: sel.name === s.name ? "#eff6ff" : "transparent",
                borderLeft: `2px solid ${sel.name === s.name ? "#1e3a5f" : "transparent"}`,
                textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit",
                borderBottom: "1px solid #f8fafc",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{s.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.beat >= 0 ? "#16a34a" : "#dc2626", background: s.beat >= 0 ? "#f0fdf4" : "#fef2f2", padding: "2px 7px", borderRadius: 3 }}>
                    {s.beat >= 0 ? "BEAT" : "MISS"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.sector} · {s.date}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>EPS {s.eps_act} vs {s.eps_est}E</div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                { label: "Pre-ER Move", value: `${sel.pre >= 0 ? "+" : ""}${sel.pre.toFixed(1)}%`, color: "#b45309" },
                { label: "Reaction", value: `${sel.beat >= 0 ? "+" : ""}${sel.beat.toFixed(1)}%`, color: sel.beat >= 0 ? "#16a34a" : "#dc2626" },
                { label: "Post-ER Drift", value: `${sel.post >= 0 ? "+" : ""}${sel.post.toFixed(1)}%`, color: sel.post >= 0 ? "#16a34a" : "#dc2626" },
                { label: "EPS Surprise", value: `${surprise >= 0 ? "+" : ""}${surprise.toFixed(1)}%`, color: surprise >= 0 ? "#16a34a" : "#dc2626" },
                { label: "Rev Surprise", value: `${revSurprise >= 0 ? "+" : ""}${revSurprise.toFixed(1)}%`, color: revSurprise >= 0 ? "#16a34a" : "#dc2626" },
              ].map(m => (
                <div key={m.label} className="card" style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 5 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Timeline chart */}
            <div className="card" style={{ padding: "18px 20px" }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{sel.name} · STOCK TIMELINE AROUND EARNINGS</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Days relative to earnings date (0 = report day, ER = earnings release)</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={tlData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <XAxis dataKey="t" tickFormatter={(v: number) => v === 0 ? "ER" : `${v > 0 ? "+" : ""}${v}d`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTT />} />
                  <ReferenceLine x={0} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: "ER", position: "top", fill: "#dc2626", fontSize: 10 }} />
                  <ReferenceLine y={0} stroke="#f1f5f9" />
                  <Line type="monotone" dataKey="v" stroke={sel.beat >= 0 ? "#16a34a" : "#dc2626"} strokeWidth={2.5} dot={{ r: 4, fill: sel.beat >= 0 ? "#16a34a" : "#dc2626", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* EPS / Revenue breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="card" style={{ padding: "16px 18px" }}>
                <div className="section-label" style={{ marginBottom: 12 }}>EPS BREAKDOWN</div>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                  {[{ label: "Estimate", value: sel.eps_est, dim: true }, { label: "Actual", value: sel.eps_act, dim: false }].map(x => (
                    <div key={x.label}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{x.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: x.dim ? "#94a3b8" : sel.eps_act >= sel.eps_est ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>${x.value.toFixed(2)}</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: "auto", textAlign: "right" as const }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>SURPRISE</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: surprise >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>{surprise >= 0 ? "+" : ""}{surprise.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: "16px 18px" }}>
                <div className="section-label" style={{ marginBottom: 12 }}>REVENUE BREAKDOWN ($B)</div>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                  {[{ label: "Estimate", value: sel.rev_est, dim: true }, { label: "Actual", value: sel.rev_act, dim: false }].map(x => (
                    <div key={x.label}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{x.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: x.dim ? "#94a3b8" : sel.rev_act >= sel.rev_est ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>${x.value.toFixed(1)}B</div>
                    </div>
                  ))}
                  <div style={{ marginLeft: "auto", textAlign: "right" as const }}>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>SURPRISE</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: revSurprise >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>{revSurprise >= 0 ? "+" : ""}{revSurprise.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
