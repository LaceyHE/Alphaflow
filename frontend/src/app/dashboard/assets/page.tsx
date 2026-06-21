"use client";
import { useEffect, useState } from "react";
import { api, type AssetItem, type Timeframe } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, AreaChart, Area } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";

const TF: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

const ASSET_META: Record<string, { icon: string; cat: string; color: string }> = {
  "US Equities": { icon: "📈", cat: "Equities", color: "#1d4ed8" },
  Bonds:         { icon: "🏛️", cat: "Fixed Income", color: "#0891b2" },
  Gold:          { icon: "🥇", cat: "Commodity", color: "#b45309" },
  Bitcoin:       { icon: "₿",  cat: "Crypto", color: "#ea580c" },
  "USD Index":   { icon: "💵", cat: "FX", color: "#7c3aed" },
  Oil:           { icon: "🛢️", cat: "Commodity", color: "#57534e" },
  "Emerging Mkts":{ icon: "🌏", cat: "Equities", color: "#16a34a" },
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
    </div>
  );
}

export default function AssetsPage() {
  const [tf, setTf] = useState<Timeframe>("7D");
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.assets(tf).then(d => setAssets(d.assets)).catch(console.error).finally(() => setLoading(false));
  }, [tf]);

  const selectedAsset = assets.find(a => a.name === selected);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div className="page-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 3 }}>FLOW ANALYTICS · ASSET CLASS ROTATION</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Cross-Asset Flow Overview</h1>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>Equities · Bonds · Commodities · Crypto · FX</p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {TF.map(t => (
              <button key={t} onClick={() => setTf(t)} className={`tf-btn${tf === t ? " active" : ""}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Asset cards */}
        <div style={{ display: "grid", gap: 10, marginBottom: 14, gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))" }}>
          {loading
            ? Array(7).fill(0).map((_,i) => <div key={i} style={{ height: 110, background: "#f1f5f9", borderRadius: 6 }} />)
            : assets.map(a => {
              const meta = ASSET_META[a.name] || { icon: "📊", cat: "", color: "#64748b" };
              const pos = a.change >= 0;
              const isActive = selected === a.name;
              return (
                <div key={a.name} className="card" style={{
                  padding: "14px 16px", cursor: "pointer",
                  borderColor: isActive ? meta.color : pos ? "#86efac" : "#fca5a5",
                  outline: isActive ? `2px solid ${meta.color}` : "none",
                  outlineOffset: -1,
                }} onClick={() => setSelected(selected === a.name ? null : a.name)}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 20 }}>{meta.icon}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", background: "#f8fafc", padding: "2px 6px", borderRadius: 20, fontWeight: 600, border: "1px solid #e2e8f0" }}>
                      {meta.cat}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginTop: 8 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{a.ticker}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: pos ? "#16a34a" : "#dc2626", marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                    {pos ? "+" : ""}{a.change.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>${a.price.toFixed(2)}</div>
                </div>
              );
            })}
        </div>

        {/* Selected asset chart */}
        {selectedAsset && (
          <div className="card" style={{ padding: "16px 18px", marginBottom: 14 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>{selectedAsset.name} · PRICE HISTORY</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={(selectedAsset.history ?? []).map((v, i) => ({ i, v }))}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedAsset.change >= 0 ? "#16a34a" : "#dc2626"} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={selectedAsset.change >= 0 ? "#16a34a" : "#dc2626"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="i" hide />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={60} tickFormatter={v => `$${v.toFixed(0)}`} />
                <Tooltip formatter={(v: any) => [`$${Number(v).toFixed(2)}`, selectedAsset.name]}
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="v" stroke={selectedAsset.change >= 0 ? "#16a34a" : "#dc2626"} strokeWidth={1.5} fill="url(#ag)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Inflow/Outflow bar */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="section-label" style={{ marginBottom: 14 }}>OVERALL INFLOW / OUTFLOW · {tf}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={assets} layout="vertical" margin={{ left: 110, right: 80 }} barSize={14}>
              <XAxis type="number" tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`}
                tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110}
                tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TT />} cursor={{ fill: "#f8fafc" }} />
              <ReferenceLine x={0} stroke="#cbd5e1" />
              <Bar dataKey="change" radius={[0, 3, 3, 0]}>
                {assets.map((a, i) => {
                  const meta = ASSET_META[a.name] || { color: "#64748b" };
                  return <Cell key={i} fill={a.change >= 0 ? meta.color : "#dc2626"} fillOpacity={0.75} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
