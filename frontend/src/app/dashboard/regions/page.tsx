"use client";
import { useEffect, useState } from "react";
import { api, type RegionItem, type Timeframe } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";

const TF: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];
const FLAGS: Record<string, string> = {
  US:"🇺🇸", Japan:"🇯🇵", Germany:"🇩🇪", Brazil:"🇧🇷",
  Europe:"🇪🇺", China:"🇨🇳", Australia:"🇦🇺", India:"🇮🇳", UK:"🇬🇧", Canada:"🇨🇦",
};

function TT({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "9px 13px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, color: "#0f172a" }}>{FLAGS[d.name]} {d.name}</div>
      <div style={{ color: "#64748b", fontSize: 10 }}>{d.ticker}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: d.change >= 0 ? "#16a34a" : "#dc2626", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        {d.change >= 0 ? "+" : ""}{d.change.toFixed(2)}%
      </div>
      <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>${d.price.toFixed(2)}</div>
    </div>
  );
}

export default function RegionsPage() {
  const [tf, setTf] = useState<Timeframe>("7D");
  const [data, setData] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.regions(tf).then(d => setData(d.regions)).catch(console.error).finally(() => setLoading(false));
  }, [tf]);

  const top = data[0];
  const bot = data[data.length - 1];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div className="page-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 3 }}>FLOW ANALYTICS · REGION ROTATION</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Global Capital Flow by Region</h1>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>Regional ETF performance as proxy for capital flow direction</p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {TF.map(t => (
              <button key={t} onClick={() => setTf(t)} className={`tf-btn${tf === t ? " active" : ""}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        {!loading && top && bot && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Top Inflow", name: top.name, change: top.change, ticker: top.ticker },
              { label: "Top Outflow", name: bot.name, change: bot.change, ticker: bot.ticker },
              { label: "Avg Performance", name: `${(data.reduce((s,d)=>s+d.change,0)/data.length) >= 0 ? "+" : ""}${(data.reduce((s,d)=>s+d.change,0)/data.length).toFixed(2)}%`, change: data.reduce((s,d)=>s+d.change,0)/data.length, ticker: "" },
              { label: "Gainers / Losers", name: `${data.filter(d=>d.change>0).length} up · ${data.filter(d=>d.change<0).length} down`, change: 0, ticker: "" },
            ].map(({ label, name, change, ticker }) => (
              <div key={label} className="card" style={{ padding: "14px 16px" }}>
                <div className="section-label" style={{ marginBottom: 6 }}>{label}</div>
                {FLAGS[name] && <div style={{ fontSize: 22, marginBottom: 4 }}>{FLAGS[name]}</div>}
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{name}</div>
                {ticker && (
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3, color: change >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bar chart */}
        <div className="card" style={{ padding: "16px 18px", marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>INFLOW / OUTFLOW BY REGION ({tf})</div>
          {loading ? (
            <div style={{ height: 280, background: "#f8fafc", borderRadius: 4 }} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} layout="vertical" margin={{ left: 80, right: 80, top: 4, bottom: 4 }} barSize={13}>
                <XAxis type="number" tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                  tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                <YAxis type="category" dataKey="name" width={80}
                  tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v: string) => `${FLAGS[v] || ""} ${v}`} />
                <Tooltip content={<TT />} cursor={{ fill: "#f8fafc" }} />
                <ReferenceLine x={0} stroke="#cbd5e1" />
                <Bar dataKey="change" radius={[0, 2, 2, 0]}>
                  {data.map((d, i) => <Cell key={i} fill={d.change >= 0 ? "#16a34a" : "#dc2626"} fillOpacity={0.75} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Region cards grid */}
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))" }}>
          {loading
            ? Array(10).fill(0).map((_,i) => <div key={i} style={{ height: 100, background: "#f1f5f9", borderRadius: 6 }} />)
            : data.map(r => {
              const pos = r.change >= 0;
              return (
                <div key={r.name} className="card" style={{ padding: "14px 16px", borderColor: pos ? "#86efac" : "#fca5a5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{FLAGS[r.name] || "🌐"}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "#0f172a" }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{r.ticker}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: pos ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                    {pos ? "+" : ""}{r.change.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>${r.price.toFixed(2)}</div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
