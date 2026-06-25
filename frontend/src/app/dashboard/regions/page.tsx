"use client";
import { useEffect, useState } from "react";
import { api, type RegionItem, type Timeframe } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useLang } from "@/contexts/LangContext";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useIsMobile } from "@/hooks/useIsMobile";

const TF: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

const FLAGS: Record<string, string> = {
  US:"🇺🇸", Japan:"🇯🇵", Germany:"🇩🇪", Brazil:"🇧🇷",
  Europe:"🇪🇺", China:"🇨🇳", Australia:"🇦🇺", India:"🇮🇳", UK:"🇬🇧", Canada:"🇨🇦",
};

const REGION_ZH: Record<string, string> = {
  US: "美国", Japan: "日本", Germany: "德国", Brazil: "巴西",
  Europe: "欧洲", China: "中国", Australia: "澳大利亚", India: "印度",
  UK: "英国", Canada: "加拿大",
};

// ISO numeric codes for react-simple-maps country highlighting
// Maps region names to arrays of ISO-3166-1 numeric codes as strings
const REGION_ISO: Record<string, string[]> = {
  US:        ["840"],
  Japan:     ["392"],
  Germany:   ["276"],
  Brazil:    ["076"],
  China:     ["156"],
  Australia: ["036"],
  India:     ["356"],
  UK:        ["826"],
  Canada:    ["124"],
  Europe:    ["276","250","380","724","620","528","56","40","756","372","208","246","752","578","300","203","703","705","191","348","616","642","756"],
};

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Returns date range string for a given timeframe
function getTFDateRange(tf: Timeframe): string {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (tf === "1D") {
    const from = new Date(now.getTime() - 24 * 3600 * 1000);
    return `${fmt(from)} – Now`;
  }
  if (tf === "3D") {
    const from = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
    return `${fmt(from)} – Now`;
  }
  if (tf === "7D") {
    const from = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    return `${fmt(from)} – Now`;
  }
  if (tf === "1M") {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 1);
    return `${fmt(from)} – Now`;
  }
  if (tf === "YTD") {
    const from = new Date(now.getFullYear(), 0, 1);
    return `Jan 1 – Now`;
  }
  return "";
}

function BarchartTooltip({ active, payload }: any) {
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
  const { t, lang } = useLang();
  const isMobile = useIsMobile();
  const [tf, setTf] = useState<Timeframe>("7D");
  const [data, setData] = useState<RegionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.regions(tf).then(d => setData(d.regions)).catch(console.error).finally(() => setLoading(false));
  }, [tf]);

  // Build lookup: iso code → change
  const isoToChange: Record<string, number> = {};
  data.forEach(r => {
    (REGION_ISO[r.name] || []).forEach(iso => {
      isoToChange[iso] = r.change;
    });
  });

  const sortedData = [...data].sort((a, b) => b.change - a.change);
  const top = sortedData[0];
  const bot = sortedData[sortedData.length - 1];
  const avgChange = data.length ? data.reduce((s, d) => s + d.change, 0) / data.length : 0;

  const regionLabel = (name: string) => lang === "zh" ? (REGION_ZH[name] || name) : name;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div className="page-content">
        {/* Header */}
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
          <div>
            <div className="section-label" style={{ marginBottom: 3 }}>{t("region_page_label")}</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{t("region_page_title")}</h1>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>{t("region_page_sub")}</p>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {TF.map(tfOpt => (
              <div key={tfOpt} style={{ position: "relative" }}>
                <button onClick={() => setTf(tfOpt)} className={`tf-btn${tf === tfOpt ? " active" : ""}`}>
                  {tfOpt}
                </button>
                {tf === tfOpt && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: "50%", transform: "translateX(-50%)",
                    whiteSpace: "nowrap", fontSize: 9, color: "#94a3b8", background: "#fff",
                    border: "1px solid #e2e8f0", borderRadius: 3, padding: "2px 5px",
                    pointerEvents: "none", zIndex: 5,
                  }}>
                    {getTFDateRange(tfOpt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        {!loading && top && bot && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: t("top_performer"), name: regionLabel(top.name), change: top.change, ticker: top.ticker, emoji: FLAGS[top.name] },
              { label: t("weakest"), name: regionLabel(bot.name), change: bot.change, ticker: bot.ticker, emoji: FLAGS[bot.name] },
              { label: t("avg_performance"), name: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`, change: avgChange, ticker: "", emoji: "" },
              { label: t("gainers_losers"), name: `${data.filter(d=>d.change>0).length} ↑ · ${data.filter(d=>d.change<0).length} ↓`, change: 0, ticker: "", emoji: "" },
            ].map(({ label, name, change, ticker, emoji }) => (
              <div key={label} className="card" style={{ padding: "14px 16px" }}>
                <div className="section-label" style={{ marginBottom: 6 }}>{label}</div>
                {emoji && <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>}
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

        {/* Toggle: Map / Bar Chart */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>
            {lang === "zh" ? "视图" : "View"}:
          </div>
          {[
            { key: true, label: lang === "zh" ? "🗺 世界地图" : "🗺 World Map" },
            { key: false, label: lang === "zh" ? "📊 柱状图" : "📊 Bar Chart" },
          ].map(({ key, label }) => (
            <button
              key={String(key)}
              onClick={() => setMapView(key as boolean)}
              style={{
                padding: "5px 12px", fontSize: 12, fontWeight: 500,
                border: "1px solid #e2e8f0", borderRadius: 4,
                background: mapView === key ? "#1e3a5f" : "#fff",
                color: mapView === key ? "#fff" : "#64748b",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* World Map */}
        {mapView && (
          <div className="card" style={{ padding: "14px 16px", marginBottom: 14, overflow: "hidden" }}>
            <div className="section-label" style={{ marginBottom: 10 }}>{t("world_map_title")} · {tf} · {getTFDateRange(tf)}</div>
            {loading ? (
              <div style={{ height: 300, background: "#f8fafc", borderRadius: 4 }} />
            ) : (
              <>
                <ComposableMap
                  projectionConfig={{ scale: 145, center: [0, 10] }}
                  style={{ width: "100%", height: 320 }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map(geo => {
                        const isoNum = String(geo.id);
                        const change = isoToChange[isoNum];
                        let fill = "#e2e8f0";
                        if (change !== undefined) {
                          if (change > 3) fill = "#16a34a";
                          else if (change > 1) fill = "#4ade80";
                          else if (change > 0) fill = "#86efac";
                          else if (change > -1) fill = "#fca5a5";
                          else if (change > -3) fill = "#ef4444";
                          else fill = "#dc2626";
                        }
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fill}
                            stroke="#fff"
                            strokeWidth={0.4}
                            style={{
                              default: { outline: "none" },
                              hover: { fill: change !== undefined ? fill : "#cbd5e1", outline: "none", opacity: 0.8 },
                              pressed: { outline: "none" },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
                {/* Map legend */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                  {[
                    { color: "#16a34a", label: ">+3%" },
                    { color: "#4ade80", label: "+1~3%" },
                    { color: "#86efac", label: "0~+1%" },
                    { color: "#fca5a5", label: "-1~0%" },
                    { color: "#ef4444", label: "-3~-1%" },
                    { color: "#dc2626", label: "<-3%" },
                    { color: "#e2e8f0", label: lang === "zh" ? "暂无数据" : "No data" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#64748b" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, border: "1px solid #e2e8f0" }} />
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Bar chart */}
        {!mapView && (
          <div className="card" style={{ padding: "16px 18px", marginBottom: 14 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>
              {t("perf_by_region")} ({tf}) · {getTFDateRange(tf)}
            </div>
            {loading ? (
              <div style={{ height: 280, background: "#f8fafc", borderRadius: 4 }} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedData} layout="vertical" margin={{ left: 90, right: 80, top: 4, bottom: 4 }} barSize={13}>
                  <XAxis type="number" tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                    tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={90}
                    tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v: string) => `${FLAGS[v] || ""} ${lang === "zh" ? (REGION_ZH[v] || v) : v}`} />
                  <Tooltip content={<BarchartTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <ReferenceLine x={0} stroke="#cbd5e1" />
                  <Bar dataKey="change" radius={[0, 2, 2, 0]}>
                    {sortedData.map((d, i) => <Cell key={i} fill={d.change >= 0 ? "#16a34a" : "#dc2626"} fillOpacity={0.75} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Region cards grid */}
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fill, minmax(155px, 1fr))" }}>
          {loading
            ? Array(10).fill(0).map((_, i) => <div key={i} style={{ height: 100, background: "#f1f5f9", borderRadius: 6 }} />)
            : sortedData.map(r => {
              const pos = r.change >= 0;
              return (
                <div key={r.name} className="card" style={{ padding: "14px 16px", borderColor: pos ? "#86efac" : "#fca5a5" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{FLAGS[r.name] || "🌐"}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: "#0f172a" }}>{regionLabel(r.name)}</div>
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
