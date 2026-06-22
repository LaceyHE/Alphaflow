"use client";
import { useEffect, useState, useCallback } from "react";
import { api, type Timeframe, type NarrativeData, type SankeyData } from "@/lib/api";
import { useLang } from "@/contexts/LangContext";
import dynamic from "next/dynamic";

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
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 28px", minHeight: "calc(100vh - 56px)" }}>

      {/* Page header row */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 5 }}>GLOBAL CAPITAL FLOW MONITOR</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            {t("page_title")}
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 5 }}>
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

      {/* Key signals row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 190px", gap: 12, marginTop: 16 }}>
        {narrative ? (
          <>
            <MetricCard label={t("leading")} item={narrative.signals.leading} />
            <MetricCard label={t("lagging")} item={narrative.signals.lagging} />
            <MetricCard label={t("top_region")} item={narrative.signals.top_region} />
          </>
        ) : Array(3).fill(0).map((_, i) => (
          <div key={i} className="card" style={{ height: 90, background: "#f1f5f9" }} />
        ))}
        <div className="card" style={{
          padding: "14px 16px", textAlign: "center",
          background: bull ? "#f0fdf4" : "#fef2f2",
          borderColor: bull ? "#86efac" : "#fca5a5",
        }}>
          <div style={{ fontSize: 26, marginBottom: 3 }}>{bull ? "🐂" : "🐻"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: bull ? "#16a34a" : "#dc2626" }}>
            {bull ? t("bull_signal") : t("bear_signal")}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            SPX {narrative ? `${narrative.spx_change >= 0 ? "+" : ""}${narrative.spx_change.toFixed(2)}%` : "—"}
          </div>
          <div style={{
            marginTop: 7, display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: bull ? "#dcfce7" : "#fee2e2", color: bull ? "#16a34a" : "#dc2626",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
            {bull ? t("risk_on") : t("risk_off")}
          </div>
        </div>
      </div>

      {/* AI narrative */}
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

      {/* Main 3-column grid: Sankey | Sectors | Regions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginTop: 14 }}>
        {/* Sankey */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="section-label" style={{ marginBottom: 4 }}>{t("capital_flow_map")}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>Asset Classes → Regions → Sectors · Link width ≈ ETF return magnitude</div>
          {loading ? (
            <div style={{ height: 340, background: "#f8fafc", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Loading flow data…</span>
            </div>
          ) : sankey && sankey.nodes.length > 0 ? (
            <SankeyFlow nodes={sankey.nodes} links={sankey.links} />
          ) : (
            <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>
              No data available
            </div>
          )}
        </div>

        {/* Mini tables stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <MiniTable title="TOP SECTORS" items={loading ? [] : sectors.slice(0, 6)} />
          <MiniTable title="TOP REGIONS" items={loading ? [] : regions.slice(0, 5)} />
        </div>
      </div>

      {/* Flow Show Chart — full width */}
      <div className="card" style={{ padding: "16px 18px", marginTop: 14 }}>
        <div className="section-label" style={{ marginBottom: 4 }}>{t("flow_show")} · {tf}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
          All asset classes, regions & sectors — green = positive return, red = negative return
        </div>
        {loading ? (
          <div style={{ height: 380, background: "#f8fafc", borderRadius: 4 }} />
        ) : (
          <FlowShowChart items={allItems} />
        )}
      </div>

      {/* Top movers table */}
      <div className="card" style={{ marginTop: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="section-label">{t("top_movers")} · {tf}</div>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{allItems.length} instruments tracked</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("name")}</th><th>{t("ticker")}</th><th>{t("category")}</th>
              <th className="right">{t("performance")}</th><th className="right">{t("signal")}</th>
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
  );
}

function MacroStrip() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api.macro().then(d => setData(d.indicators)).catch(console.error); }, []);
  const items = data ? [
    { label: "S&P 500", ...data["S&P 500"] }, { label: "Nasdaq", ...data["Nasdaq"] },
    { label: "Dow Jones", ...data["Dow Jones"] }, { label: "VIX", ...data["VIX"] },
    { label: "10Y Yield", ...data["10Y Treasury"] }, { label: "Gold", ...data["Gold"] },
    { label: "Oil", ...data["Oil (WTI)"] }, { label: "DXY", ...data["DXY"] },
  ] : [];
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
      {!data ? Array(8).fill(0).map((_, i) => (
        <div key={i} style={{ width: 118, height: 68, background: "#f1f5f9", borderRadius: 7, flexShrink: 0 }} />
      )) : items.map((item: any) => {
        if (!item.price) return null;
        const pos = (item.change || 0) >= 0;
        return (
          <div key={item.label} className="card" style={{ padding: "10px 14px", flexShrink: 0, minWidth: 112 }}>
            <div className="section-label" style={{ marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
              {item.label === "10Y Yield" || item.label === "VIX" || item.label === "DXY"
                ? (item.price).toFixed(2)
                : (item.price) >= 1000
                ? (item.price).toLocaleString(undefined, { maximumFractionDigits: 0 })
                : `$${(item.price).toFixed(2)}`}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: pos ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
              {pos ? "▲" : "▼"} {Math.abs(item.change || 0).toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ label, item }: { label: string; item: { name: string; change: number } }) {
  const pos = item.change >= 0;
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div className="section-label" style={{ marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", lineHeight: 1.3, marginBottom: 5 }}>{item.name}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: pos ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
        {pos ? "+" : ""}{item.change.toFixed(2)}%
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>by ETF price return</div>
    </div>
  );
}

function MiniTable({ title, items }: { title: string; items: any[] }) {
  return (
    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        <div className="section-label">{title}</div>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: "20px 14px" }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ height: 14, background: "#f1f5f9", borderRadius: 3, marginBottom: 10 }} />
          ))}
        </div>
      ) : (
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.name}>
                  <td style={{ padding: "7px 14px", fontSize: 13, fontWeight: 500, color: "#0f172a", borderBottom: "1px solid #f8fafc" }}>{item.name}</td>
                  <td style={{ padding: "7px 14px", textAlign: "right" as const, borderBottom: "1px solid #f8fafc" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.change >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                      {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
