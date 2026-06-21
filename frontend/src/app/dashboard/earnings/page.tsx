"use client";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

// Static earnings data for demo (Phase 2: connect earnings API)
const STOCKS = [
  { name: "NVDA", sector: "Technology", pre: -2.1, beat: 18.5, post: 12.3, eps_est: 5.52, eps_act: 6.56 },
  { name: "AAPL", sector: "Technology", pre: 1.2, beat: 2.1, post: -3.8, eps_est: 1.43, eps_act: 1.52 },
  { name: "META", sector: "Communication", pre: 3.4, beat: 5.7, post: 4.2, eps_est: 5.12, eps_act: 5.71 },
  { name: "MSFT", sector: "Technology", pre: -0.8, beat: 1.3, post: 2.1, eps_est: 3.10, eps_act: 3.23 },
  { name: "GOOGL", sector: "Communication", pre: 2.1, beat: 4.8, post: 3.2, eps_est: 2.01, eps_act: 2.12 },
  { name: "AMZN", sector: "Consumer Disc.", pre: 0.9, beat: -0.5, post: -2.3, eps_est: 1.36, eps_act: 1.59 },
  { name: "TSLA", sector: "Consumer Disc.", pre: -4.2, beat: -8.1, post: -12.3, eps_est: 0.55, eps_act: 0.27 },
];

const buildTimeline = (stock: typeof STOCKS[0]) =>
  [
    { t: -10, v: 0 }, { t: -5, v: -stock.pre * 0.3 }, { t: -1, v: stock.pre },
    { t: 0, v: stock.pre + stock.beat }, { t: 1, v: stock.post + stock.beat },
    { t: 5, v: stock.post * 0.7 + stock.beat }, { t: 10, v: stock.post * 0.4 + stock.beat },
  ];

export default function EarningsPage() {
  const [sel, setSel] = useState(STOCKS[0]);

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300, margin: "0 auto", marginLeft: 192 }}>
      <div className="section-label mb-1">DASHBOARD · EARNINGS</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Earnings Preview &amp; Review</h1>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>
        Stock performance before &amp; after earnings · Beat/miss analysis
      </p>

      <div className="grid gap-5" style={{ gridTemplateColumns: "280px 1fr" }}>
        {/* Stock list */}
        <div className="glass p-4">
          <div className="section-label mb-3">RECENT EARNINGS</div>
          <div className="space-y-1.5">
            {STOCKS.map(s => (
              <div
                key={s.name}
                className="rounded-lg px-3 py-2.5 cursor-pointer transition-all"
                onClick={() => setSel(s)}
                style={{
                  background: sel.name === s.name ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${sel.name === s.name ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#f1f5f9" }}>{s.name}</span>
                    <span style={{ fontSize: 10, color: "#475569", marginLeft: 6 }}>{s.sector}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.beat >= 0 ? "#10b981" : "#ef4444" }}>
                    {s.beat >= 0 ? "BEAT" : "MISS"}
                  </span>
                </div>
                <div className="flex gap-3 mt-1">
                  <span style={{ fontSize: 10, color: "#64748b" }}>EPS {s.eps_act} vs {s.eps_est}E</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-4">
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="section-label mb-1">{sel.name} · EARNINGS TIMELINE</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  Days relative to earnings date (0 = report day)
                </div>
              </div>
              <div className="flex gap-3">
                {[
                  { label: "Pre", value: sel.pre, color: "#f59e0b" },
                  { label: "Beat/Miss", value: sel.beat, color: sel.beat >= 0 ? "#10b981" : "#ef4444" },
                  { label: "Post", value: sel.post, color: "#3b82f6" },
                ].map(x => (
                  <div key={x.label} className="glass2 rounded-lg px-3 py-2 text-center">
                    <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{x.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: x.color, marginTop: 2 }}>
                      {x.value >= 0 ? "+" : ""}{x.value.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={buildTimeline(sel)} margin={{ left: 10, right: 20 }}>
                <XAxis dataKey="t" tickFormatter={v => v === 0 ? "ER" : `${v > 0 ? "+" : ""}${v}d`}
                  tick={{ fill: "#475569", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                <YAxis tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
                  tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "Return"]} contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <ReferenceLine x={0} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" label={{ value: "ER", fill: "#f59e0b", fontSize: 10 }} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                <Line type="monotone" dataKey="v" stroke={sel.beat >= 0 ? "#10b981" : "#ef4444"} strokeWidth={2.5} dot={{ r: 3, fill: sel.beat >= 0 ? "#10b981" : "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* EPS breakdown */}
          <div className="glass p-5">
            <div className="section-label mb-4">EPS BREAKDOWN</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "EPS Estimate", value: `$${sel.eps_est}`, color: "#64748b" },
                { label: "EPS Actual", value: `$${sel.eps_act}`, color: sel.eps_act > sel.eps_est ? "#10b981" : "#ef4444" },
                { label: "Surprise", value: `${((sel.eps_act - sel.eps_est) / sel.eps_est * 100).toFixed(1)}%`, color: sel.eps_act > sel.eps_est ? "#10b981" : "#ef4444" },
              ].map(x => (
                <div key={x.label} className="glass2 rounded-xl p-4">
                  <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{x.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: x.color, marginTop: 6 }}>{x.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
