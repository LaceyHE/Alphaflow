"use client";
import { useEffect, useState, useCallback } from "react";
import { api, type Timeframe, type NarrativeData, type SankeyData } from "@/lib/api";
import { useLang } from "@/contexts/LangContext";
import dynamic from "next/dynamic";
import Link from "next/link";

const SankeyFlow = dynamic(() => import("@/components/SankeyFlow"), { ssr: false });
const FlowShowChart = dynamic(() => import("@/components/FlowShowChart"), { ssr: false });

const TF_OPTIONS: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

export default function HeroPage() {
  const { t } = useLang();
  const [tf, setTf] = useState<Timeframe>("7D");
  const [narrative, setNarrative] = useState<NarrativeData | null>(null);
  const [sankey, setSankey] = useState<SankeyData | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.narrative(tf), api.sankey(tf), api.assets(tf), api.regions(tf), api.sectors(tf),
    ]).then(([n, s, a, r, sec]) => {
      setNarrative(n); setSankey(s);
      setAssets(a.assets); setRegions(r.regions); setSectors(sec.sectors);
    }).catch(console.error).finally(() => setLoading(false));
  }, [tf]);

  useEffect(() => { load(); }, [load]);

  const allItems = [
    ...assets.map(a => ({ name: a.name, ticker: a.ticker, change: a.change, cat: "Asset" })),
    ...regions.map(r => ({ name: r.name, ticker: r.ticker, change: r.change, cat: "Region" })),
    ...sectors.map(s => ({ name: s.name, ticker: s.ticker, change: s.change, cat: "Sector" })),
  ].sort((a, b) => b.change - a.change);

  const bull = narrative?.bull_bear === "bull";

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 200, flexShrink: 0, borderRight: "1px solid #e2e8f0",
        background: "#fff", position: "sticky", top: 56, height: "calc(100vh - 56px)",
        overflowY: "auto", paddingTop: 10,
      }}>
        <SidebarNav activePath="/" t={t} />
      </aside>

      <div style={{ flex: 1, padding: "22px 24px", minWidth: 0 }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 5 }}>GLOBAL CAPITAL FLOW MONITOR</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {t("page_title")}
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
              {tf} {t("page_sub")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {TF_OPTIONS.map(t2 => (
              <button key={t2} onClick={() => setTf(t2)} className={`tf-btn${tf === t2 ? " active" : ""}`}>{t2}</button>
            ))}
          </div>
        </div>

        {/* Macro strip */}
        <MacroStrip />

        {/* 3-col key metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 180px", gap: 12, marginTop: 16 }}>
          {narrative ? (
            <>
              <MetricCard label={t("most_crowded")} item={narrative.signals.most_crowded} accent="#dc2626" />
              <MetricCard label={t("most_hated")} item={narrative.signals.most_hated} accent="#7c3aed" />
              <MetricCard label={t("emerging")} item={narrative.signals.emerging} accent="#16a34a" />
            </>
          ) : (
            Array(3).fill(0).map((_, i) => <div key={i} className="card" style={{ height: 80, background: "#f1f5f9" }} />)
          )}
          {/* Bull/Bear */}
          <div className="card" style={{
            padding: "14px 16px", textAlign: "center",
            background: bull ? "#f0fdf4" : "#fef2f2",
            borderColor: bull ? "#86efac" : "#fca5a5",
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{bull ? "🐂" : "🐻"}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: bull ? "#16a34a" : "#dc2626" }}>
              {bull ? t("bull_signal") : t("bear_signal")}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
              SPX {narrative ? `${narrative.spx_change >= 0 ? "+" : ""}${narrative.spx_change.toFixed(2)}%` : "—"}
            </div>
            <div style={{
              marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: bull ? "#dcfce7" : "#fee2e2",
              color: bull ? "#16a34a" : "#dc2626",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: bull ? "#16a34a" : "#dc2626", display: "inline-block" }} />
              {bull ? t("risk_on") : t("risk_off")}
            </div>
          </div>
        </div>

        {/* AI Narrative */}
        {narrative && (
          <div className="card" style={{ padding: "16px 20px", marginTop: 14 }}>
            <div className="section-label" style={{ marginBottom: 10 }}>{t("ai_summary")} · {tf}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {narrative.lines.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", background: "#eff6ff",
                    border: "1px solid #93c5fd", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#1d4ed8", flexShrink: 0, marginTop: 2,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sankey + Flow table */}
        <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 14, marginTop: 14 }}>
          {/* Sankey */}
          <div className="card" style={{ padding: "16px 18px" }}>
            <div style={{ marginBottom: 14 }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{t("capital_flow_map")}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Asset Classes → Regions → Sectors</div>
            </div>
            {loading ? (
              <div style={{ height: 320, background: "#f8fafc", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Loading flow data…</span>
              </div>
            ) : sankey && sankey.nodes.length > 0 ? (
              <SankeyFlow nodes={sankey.nodes} links={sankey.links} />
            ) : (
              <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>
                Backend offline — start the backend server
              </div>
            )}
          </div>

          {/* Live data mini-tables */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <MiniTable title="TOP SECTORS" items={sectors.slice(0, 5)} />
            <MiniTable title="TOP REGIONS" items={regions.slice(0, 5)} />
          </div>
        </div>

        {/* Flow Show Chart */}
        <div className="card" style={{ padding: "16px 18px", marginTop: 14 }}>
          <div style={{ marginBottom: 14 }}>
            <div className="section-label" style={{ marginBottom: 4 }}>{t("flow_show")} · {tf}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              All asset classes, regions, and sectors — green = inflow, red = outflow
            </div>
          </div>
          {loading ? (
            <div style={{ height: 420, background: "#f8fafc", borderRadius: 4 }} />
          ) : (
            <FlowShowChart items={allItems} />
          )}
        </div>

        {/* Summary table */}
        <div className="card" style={{ marginTop: 14, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="section-label">{t("top_movers")} · {tf}</div>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{allItems.length} instruments tracked</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("name")}</th>
                <th>{t("ticker")}</th>
                <th>{t("category")}</th>
                <th className="right">{t("performance")}</th>
                <th className="right">{t("signal")}</th>
              </tr>
            </thead>
            <tbody>
              {allItems.slice(0, 18).map(item => (
                <tr key={`${item.ticker}-${item.cat}`}>
                  <td style={{ fontWeight: 500, color: "#0f172a" }}>{item.name}</td>
                  <td style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>{item.ticker}</td>
                  <td>
                    <span style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 11, fontWeight: 600,
                      background: item.cat === "Asset" ? "#eff6ff" : item.cat === "Region" ? "#f0fdf4" : "#fffbeb",
                      color: item.cat === "Asset" ? "#1d4ed8" : item.cat === "Region" ? "#16a34a" : "#b45309",
                    }}>{item.cat}</span>
                  </td>
                  <td className="right" style={{ fontWeight: 700, color: item.change >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                    {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
                  </td>
                  <td className="right">
                    <span className={`badge ${item.change > 1 ? "badge-up" : item.change < -1 ? "badge-down" : "badge-neu"}`}>
                      {item.change > 1 ? t("inflow") : item.change < -1 ? t("outflow") : t("neutral")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* ── Sub-components ── */

function MacroStrip() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.macro().then(d => setData(d.indicators)).catch(console.error);
  }, []);

  const items = data ? [
    { label: "S&P 500", ...data["S&P 500"] },
    { label: "Nasdaq", ...data["Nasdaq"] },
    { label: "Dow Jones", ...data["Dow Jones"] },
    { label: "VIX", ...data["VIX"] },
    { label: "10Y Yield", ...data["10Y Treasury"] },
    { label: "Gold", ...data["Gold"] },
    { label: "Oil", ...data["Oil (WTI)"] },
    { label: "DXY", ...data["DXY"] },
  ] : [];

  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
      {!data
        ? Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ width: 120, height: 70, background: "#f1f5f9", borderRadius: 7, flexShrink: 0 }} />
          ))
        : items.map((item: any) => {
          if (!item.price) return null;
          const pos = (item.change || 0) >= 0;
          return (
            <div key={item.label} className="card" style={{ padding: "11px 15px", flexShrink: 0, minWidth: 118 }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
                {item.label === "VIX" || item.label === "10Y Yield"
                  ? `${(item.price || 0).toFixed(2)}`
                  : item.label === "DXY"
                  ? (item.price || 0).toFixed(2)
                  : (item.price || 0) >= 1000
                  ? (item.price || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : `$${(item.price || 0).toFixed(2)}`}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 3, color: pos ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                {pos ? "▲" : "▼"} {Math.abs(item.change || 0).toFixed(2)}%
              </div>
            </div>
          );
        })}
    </div>
  );
}

function MetricCard({ label, item, accent }: { label: string; item: { name: string; change: number }; accent: string }) {
  const pos = item.change >= 0;
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div className="section-label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 5 }}>{item.name}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: pos ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
        {pos ? "+" : ""}{item.change.toFixed(2)}%
      </div>
    </div>
  );
}

function MiniTable({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="card" style={{ flex: 1, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
        <div className="section-label">{title}</div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {items.map((item: any) => (
            <tr key={item.name || item.ticker}>
              <td style={{ padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#0f172a", borderBottom: "1px solid #f8fafc" }}>
                {item.name}
              </td>
              <td style={{ padding: "8px 14px", textAlign: "right", borderBottom: "1px solid #f8fafc" }}>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: item.change >= 0 ? "#16a34a" : "#dc2626",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SIDEBAR_GROUPS = [
  {
    label: "Flow Analytics",
    items: [
      { label: "Overview", href: "/" },
      { label: "Region Flow", href: "/dashboard/regions" },
      { label: "Asset Flow", href: "/dashboard/assets" },
      { label: "Sector Flow", href: "/dashboard/sectors" },
      { label: "Theme Flow", href: "/dashboard/themes" },
      { label: "Earnings", href: "/dashboard/earnings" },
    ],
  },
  {
    label: "Research",
    items: [
      { label: "Macro Index", href: "/others/macro" },
      { label: "Economic Data", href: "/others/economic" },
      { label: "Daily Report", href: "/others/daily" },
      { label: "AI Analysis", href: "/others/chat" },
    ],
  },
  {
    label: "Canvas",
    items: [
      { label: "Backtest", href: "/canvas" },
      { label: "Event Study", href: "/canvas/events" },
      { label: "Seasonality", href: "/canvas/seasonal" },
    ],
  },
];

function SidebarNav({ activePath, t }: { activePath: string; t: (k: any) => string }) {
  return (
    <>
      {SIDEBAR_GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: 2 }}>
          <div style={{
            padding: "10px 16px 5px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#94a3b8",
          }}>
            {group.label}
          </div>
          {group.items.map(item => {
            const active = item.href === activePath;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center",
                padding: "7px 16px", fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#1e3a5f" : "#475569",
                background: active ? "#eff6ff" : "transparent",
                textDecoration: "none",
                borderLeft: `2px solid ${active ? "#1e3a5f" : "transparent"}`,
                marginLeft: 2,
              }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
