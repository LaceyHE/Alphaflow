"use client";
import { useEffect, useState } from "react";
import { api, type NarrativeData } from "@/lib/api";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useLang } from "@/contexts/LangContext";

const CALENDAR = [
  { date: "Mon", event: "ISM Manufacturing PMI", importance: "high", consensus: "49.8", prior: "49.2" },
  { date: "Tue", event: "JOLTS Job Openings", importance: "med", consensus: "8.35M", prior: "8.49M" },
  { date: "Wed", event: "ADP Employment", importance: "med", consensus: "+173K", prior: "+192K" },
  { date: "Wed", event: "FOMC Minutes", importance: "high", consensus: "—", prior: "—" },
  { date: "Thu", event: "Initial Jobless Claims", importance: "med", consensus: "220K", prior: "218K" },
  { date: "Fri", event: "Non-Farm Payrolls", importance: "high", consensus: "+190K", prior: "+175K" },
  { date: "Fri", event: "Unemployment Rate", importance: "high", consensus: "3.9%", prior: "3.9%" },
];

const WATCHLIST = [
  { name: "SPY", label: "S&P 500 ETF", theme: "US Equity" },
  { name: "QQQ", label: "Nasdaq 100", theme: "Tech" },
  { name: "TLT", label: "20Y Treasury", theme: "Bonds" },
  { name: "GLD", label: "Gold ETF", theme: "Commodity" },
  { name: "VXX", label: "VIX Short-Term", theme: "Volatility" },
  { name: "EWJ", label: "Japan ETF", theme: "EM Asia" },
];

export default function DailyReportPage() {
  const { lang } = useLang();
  const [narrative, setNarrative] = useState<NarrativeData | null>(null);
  const [macro, setMacro] = useState<any>({});
  const [sectors, setSectors] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.narrative("7D"),
      api.macro(),
      api.sectors("7D"),
      api.regions("7D"),
    ]).then(([n, m, s, r]) => {
      setNarrative(n);
      setMacro(m.indicators);
      setSectors(s.sectors);
      setRegions(r.regions);
    }).catch(console.error);
  }, []);

  const today = new Date().toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const bull = narrative?.bull_bear === "bull";
  const macroItems = [
    { key: "S&P 500", short: "SPX" }, { key: "Nasdaq", short: "NDX" },
    { key: "VIX", short: "VIX" }, { key: "10Y Treasury", short: "10Y" },
    { key: "Gold", short: "Gold" }, { key: "Oil (WTI)", short: "Oil" }, { key: "DXY", short: "DXY" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 32px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 5 }}>
              {lang === "zh" ? "研究中心 · 每日流向报告" : "RESEARCH HUB · DAILY FLOW REPORT"}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>
              {lang === "zh" ? "每日流向报告" : "Daily Flow Report"}
            </h1>
            <div style={{ fontSize: 13, color: "#64748b" }}>{today}</div>
          </div>
          {narrative && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
              borderRadius: 8, border: `1px solid ${bull ? "#86efac" : "#fca5a5"}`,
              background: bull ? "#f0fdf4" : "#fef2f2",
            }}>
              <span style={{ fontSize: 20 }}>{bull ? "🐂" : "🐻"}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: bull ? "#16a34a" : "#dc2626" }}>
                  {bull ? (lang === "zh" ? "牛市 · 风险偏好" : "BULL · Risk ON") : (lang === "zh" ? "熊市 · 避险情绪" : "BEAR · Risk OFF")}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  SPX {narrative.spx_change >= 0 ? "+" : ""}{narrative.spx_change.toFixed(2)}% · VIX {(narrative.vix ?? 0).toFixed(1)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Macro strip */}
        <div className="card" style={{ padding: "14px 18px", marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>
            {lang === "zh" ? "市场概览" : "MARKET SNAPSHOT"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
            {macroItems.map(({ key, short }) => {
              const d = macro[key];
              const pos = (d?.change ?? 0) >= 0;
              return (
                <div key={key} style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", marginBottom: 4 }}>{short}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                    {d ? (d.price >= 1000 ? d.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : d.price.toFixed(2)) : "—"}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: pos ? "#16a34a" : "#dc2626", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                    {d ? `${pos ? "▲" : "▼"}${Math.abs(d.change).toFixed(2)}%` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-col: narrative + signals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, marginBottom: 14 }}>
          {/* AI narrative */}
          <div className="card" style={{ padding: "18px 20px" }}>
            <div className="section-label" style={{ marginBottom: 12 }}>
              {lang === "zh" ? "AI 资金流向摘要 · 7D" : "AI FLOW NARRATIVE · 7D"}
            </div>
            {narrative ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {narrative.lines.map((line, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", background: "#eff6ff",
                      border: "1px solid #93c5fd", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, color: "#1d4ed8", flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7 }}>{line}</p>
                  </div>
                ))}
              </div>
            ) : (
              Array(3).fill(0).map((_, i) => <div key={i} style={{ height: 16, background: "#f1f5f9", borderRadius: 3, marginBottom: 10 }} />)
            )}
          </div>

          {/* Key signals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {narrative ? [
              { icon: "🔥", label: lang === "zh" ? "最拥挤交易" : "Most Crowded", item: narrative.signals.most_crowded },
              { icon: "❄️", label: lang === "zh" ? "最冷门资产" : "Most Hated", item: narrative.signals.most_hated },
              { icon: "🚀", label: lang === "zh" ? "新兴轮动" : "Emerging", item: narrative.signals.emerging },
            ].map(({ icon, label, item }) => (
              <div key={label} className="card" style={{ padding: "13px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span className="section-label">{label}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{item.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: item.change >= 0 ? "#16a34a" : "#dc2626", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                  {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
                </div>
              </div>
            )) : Array(3).fill(0).map((_, i) => <div key={i} style={{ height: 80, background: "#f1f5f9", borderRadius: 6 }} />)}
          </div>
        </div>

        {/* Sector + Region tables */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div className="section-label">{lang === "zh" ? "板块表现 · 7D" : "SECTOR PERFORMANCE · 7D"}</div>
            </div>
            <table className="data-table">
              <thead><tr><th>{lang === "zh" ? "板块" : "Sector"}</th><th className="right">{lang === "zh" ? "涨跌幅" : "Change"}</th><th className="right">{lang === "zh" ? "信号" : "Signal"}</th></tr></thead>
              <tbody>
                {(sectors.length ? sectors : Array(6).fill({ name: "—", change: 0 })).slice(0, 8).map((s: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td className="right" style={{ fontWeight: 700, color: s.change >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                      {s.change !== 0 ? `${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%` : "—"}
                    </td>
                    <td className="right">
                      {s.change !== 0 && <span className={`badge ${s.change > 0.5 ? "badge-up" : s.change < -0.5 ? "badge-down" : "badge-neu"}`}>
                        {s.change > 0.5 ? (lang === "zh" ? "流入" : "IN") : s.change < -0.5 ? (lang === "zh" ? "流出" : "OUT") : (lang === "zh" ? "中性" : "NEU")}
                      </span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
              <div className="section-label">{lang === "zh" ? "地区表现 · 7D" : "REGION PERFORMANCE · 7D"}</div>
            </div>
            <table className="data-table">
              <thead><tr><th>{lang === "zh" ? "地区" : "Region"}</th><th className="right">{lang === "zh" ? "涨跌幅" : "Change"}</th><th className="right">{lang === "zh" ? "信号" : "Signal"}</th></tr></thead>
              <tbody>
                {(regions.length ? regions : Array(6).fill({ name: "—", change: 0 })).slice(0, 8).map((r: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.name}</td>
                    <td className="right" style={{ fontWeight: 700, color: r.change >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                      {r.change !== 0 ? `${r.change >= 0 ? "+" : ""}${r.change.toFixed(2)}%` : "—"}
                    </td>
                    <td className="right">
                      {r.change !== 0 && <span className={`badge ${r.change > 0.5 ? "badge-up" : r.change < -0.5 ? "badge-down" : "badge-neu"}`}>
                        {r.change > 0.5 ? (lang === "zh" ? "流入" : "IN") : r.change < -0.5 ? (lang === "zh" ? "流出" : "OUT") : (lang === "zh" ? "中性" : "NEU")}
                      </span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Economic calendar */}
        <div className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
            <div className="section-label">{lang === "zh" ? "本周经济日历" : "THIS WEEK'S ECONOMIC CALENDAR"}</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>{lang === "zh" ? "日期" : "Day"}</th>
                <th>{lang === "zh" ? "事件" : "Event"}</th>
                <th>{lang === "zh" ? "重要性" : "Impact"}</th>
                <th className="right">{lang === "zh" ? "预测" : "Forecast"}</th>
                <th className="right">{lang === "zh" ? "前值" : "Prior"}</th>
              </tr>
            </thead>
            <tbody>
              {CALENDAR.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "#64748b" }}>{c.date}</td>
                  <td style={{ fontWeight: 500 }}>{c.event}</td>
                  <td>
                    <span style={{
                      padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 700,
                      background: c.importance === "high" ? "#fef2f2" : "#fffbeb",
                      color: c.importance === "high" ? "#dc2626" : "#b45309",
                    }}>
                      {c.importance === "high" ? (lang === "zh" ? "高" : "HIGH") : (lang === "zh" ? "中" : "MED")}
                    </span>
                  </td>
                  <td className="right" style={{ fontVariantNumeric: "tabular-nums", fontSize: 12 }}>{c.consensus}</td>
                  <td className="right" style={{ fontVariantNumeric: "tabular-nums", fontSize: 12, color: "#94a3b8" }}>{c.prior}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Watch list */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="section-label" style={{ marginBottom: 12 }}>
            {lang === "zh" ? "监控列表 · 今日关注" : "WATCHLIST · INSTRUMENTS TO WATCH"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {WATCHLIST.map(w => (
              <div key={w.name} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 5, border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{w.name}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{w.label}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, background: "#e2e8f0", display: "inline-block", padding: "1px 6px", borderRadius: 3 }}>{w.theme}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
