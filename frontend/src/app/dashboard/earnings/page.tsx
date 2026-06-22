"use client";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useLang } from "@/contexts/LangContext";

const STOCKS = [
  { name: "NVDA", sector: "Technology", date: "May 22", pre: -2.1, beat: 18.5, post: 12.3, eps_est: 5.52, eps_act: 6.56, rev_est: 24.6, rev_act: 26.0 },
  { name: "AAPL", sector: "Technology", date: "May 2", pre: 1.2, beat: 2.1, post: -3.8, eps_est: 1.43, eps_act: 1.52, rev_est: 90.3, rev_act: 90.8 },
  { name: "META", sector: "Communication", date: "Apr 24", pre: 3.4, beat: 5.7, post: 4.2, eps_est: 5.12, eps_act: 5.71, rev_est: 36.2, rev_act: 36.5 },
  { name: "MSFT", sector: "Technology", date: "Apr 25", pre: -0.8, beat: 1.3, post: 2.1, eps_est: 3.10, eps_act: 3.23, rev_est: 60.9, rev_act: 61.9 },
  { name: "GOOGL", sector: "Communication", date: "Apr 25", pre: 2.1, beat: 4.8, post: 3.2, eps_est: 2.01, eps_act: 2.12, rev_est: 78.7, rev_act: 80.5 },
  { name: "AMZN", sector: "Consumer Disc.", date: "Apr 30", pre: 0.9, beat: -0.5, post: -2.3, eps_est: 1.36, eps_act: 1.59, rev_est: 142.6, rev_act: 143.3 },
  { name: "TSLA", sector: "Consumer Disc.", date: "Apr 23", pre: -4.2, beat: -8.1, post: -12.3, eps_est: 0.55, eps_act: 0.27, rev_est: 23.5, rev_act: 21.3 },
  { name: "JPM", sector: "Financials", date: "Apr 12", pre: 1.4, beat: 6.2, post: 3.1, eps_est: 4.11, eps_act: 4.44, rev_est: 41.8, rev_act: 42.5 },
  { name: "BAC", sector: "Financials", date: "Apr 16", pre: 0.8, beat: 3.1, post: 1.9, eps_est: 0.76, eps_act: 0.83, rev_est: 25.5, rev_act: 25.8 },
  { name: "GS", sector: "Financials", date: "Apr 15", pre: 2.1, beat: 7.4, post: 2.8, eps_est: 8.56, eps_act: 11.58, rev_est: 12.9, rev_act: 14.2 },
  { name: "V", sector: "Financials", date: "Apr 23", pre: 0.4, beat: 2.3, post: 1.1, eps_est: 2.40, eps_act: 2.51, rev_est: 8.6, rev_act: 8.8 },
  { name: "UNH", sector: "Healthcare", date: "Apr 16", pre: -1.2, beat: -18.4, post: -22.1, eps_est: 7.29, eps_act: 3.98, rev_est: 111.2, rev_act: 109.6 },
  { name: "JNJ", sector: "Healthcare", date: "Apr 15", pre: 0.3, beat: 1.8, post: 0.9, eps_est: 2.51, eps_act: 2.71, rev_est: 21.8, rev_act: 21.9 },
  { name: "XOM", sector: "Energy", date: "Apr 26", pre: 1.1, beat: 4.2, post: 2.3, eps_est: 1.93, eps_act: 2.06, rev_est: 83.1, rev_act: 88.4 },
  { name: "CVX", sector: "Energy", date: "May 3", pre: 0.6, beat: 2.8, post: 1.4, eps_est: 2.58, eps_act: 2.93, rev_est: 47.0, rev_act: 48.3 },
  { name: "WMT", sector: "Consumer Staples", date: "May 16", pre: 1.8, beat: 3.2, post: 4.1, eps_est: 0.52, eps_act: 0.60, rev_est: 159.1, rev_act: 161.5 },
  { name: "HD", sector: "Consumer Disc.", date: "May 14", pre: -0.5, beat: 1.1, post: -1.8, eps_est: 3.60, eps_act: 3.67, rev_est: 36.7, rev_act: 36.4 },
  { name: "AMD", sector: "Technology", date: "Apr 30", pre: 3.2, beat: 9.1, post: 6.8, eps_est: 0.62, eps_act: 0.62, rev_est: 3.5, rev_act: 3.5 },
  { name: "INTC", sector: "Technology", date: "Apr 25", pre: -1.4, beat: -9.2, post: -15.4, eps_est: 0.13, eps_act: 0.18, rev_est: 12.8, rev_act: 12.7 },
  { name: "CRM", sector: "Technology", date: "May 29", pre: 2.3, beat: -7.1, post: -10.2, eps_est: 2.37, eps_act: 2.44, rev_est: 9.15, rev_act: 9.13 },
  { name: "NFLX", sector: "Communication", date: "Apr 18", pre: 4.1, beat: 5.2, post: 3.8, eps_est: 4.49, eps_act: 5.28, rev_est: 9.27, rev_act: 9.37 },
  { name: "DIS", sector: "Communication", date: "May 7", pre: 0.9, beat: 2.4, post: 1.2, eps_est: 1.10, eps_act: 1.21, rev_est: 22.1, rev_act: 22.1 },
];

const SECTORS = ["All", "Technology", "Financials", "Healthcare", "Communication", "Energy", "Consumer Disc.", "Consumer Staples"];

function buildTimeline(stock: typeof STOCKS[0]) {
  return [
    { t: -10, v: 0 }, { t: -5, v: -stock.pre * 0.3 }, { t: -1, v: stock.pre },
    { t: 0, v: stock.pre + stock.beat }, { t: 1, v: stock.post + stock.beat },
    { t: 5, v: stock.post * 0.7 + stock.beat }, { t: 10, v: stock.post * 0.4 + stock.beat },
  ];
}

export default function EarningsPage() {
  const { lang } = useLang();
  const [sel, setSel] = useState(STOCKS[0]);
  const [sectorFilter, setSectorFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    STOCKS.filter(s =>
      (sectorFilter === "All" || s.sector === sectorFilter) &&
      (!search || s.name.toLowerCase().includes(search.toLowerCase()))
    ), [sectorFilter, search]);

  const tlData = buildTimeline(sel);
  const surprise = ((sel.eps_act - sel.eps_est) / sel.eps_est * 100);
  const revSurprise = ((sel.rev_act - sel.rev_est) / sel.rev_est * 100);

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 5 }}>
          {lang === "zh" ? "仪表板 · 财报" : "DASHBOARD · EARNINGS"}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {lang === "zh" ? "财报预览与回顾" : "Earnings Review"}
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
          {lang === "zh" ? "财报前后股票表现 · EPS超预期/不及预期分析 — 2024年Q1季报季" : "Stock performance before & after earnings — Q1 2024 season · Beat/miss analysis"}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
          {/* Stock list */}
          <div className="card" style={{ display: "flex", flexDirection: "column", height: "fit-content", maxHeight: "calc(100vh - 200px)", overflow: "hidden" }}>
            {/* Search + filter */}
            <div style={{ padding: "12px 12px 8px" }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={lang === "zh" ? "搜索股票代码..." : "Search ticker..."}
                style={{ width: "100%", height: 30, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, marginBottom: 8 }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {SECTORS.map(s => (
                  <button key={s} onClick={() => setSectorFilter(s)} style={{
                    padding: "3px 8px", fontSize: 10, fontWeight: 600, fontFamily: "inherit",
                    background: sectorFilter === s ? "#1e3a5f" : "#f1f5f9",
                    color: sectorFilter === s ? "#fff" : "#475569",
                    border: "none", borderRadius: 3, cursor: "pointer",
                  }}>{s === "All" ? (lang === "zh" ? "全部" : "All") : s}</button>
                ))}
              </div>
            </div>
            <div style={{ borderBottom: "1px solid #f1f5f9" }} />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "16px", textAlign: "center" as const, color: "#94a3b8", fontSize: 12 }}>
                  {lang === "zh" ? "无结果" : "No results"}
                </div>
              ) : filtered.map(s => (
                <button key={s.name} onClick={() => setSel(s)} style={{
                  width: "100%", padding: "10px 12px", border: "none",
                  background: sel.name === s.name ? "#eff6ff" : "transparent",
                  borderLeft: `2px solid ${sel.name === s.name ? "#1e3a5f" : "transparent"}`,
                  textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit",
                  borderBottom: "1px solid #f8fafc",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{s.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.beat >= 0 ? "#16a34a" : "#dc2626", background: s.beat >= 0 ? "#f0fdf4" : "#fef2f2", padding: "1px 6px", borderRadius: 3 }}>
                      {s.beat >= 0 ? "BEAT" : "MISS"}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{s.sector} · {s.date}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>EPS {s.eps_act} vs {s.eps_est}E</div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                { label: lang === "zh" ? "财报前走势" : "Pre-ER Move", value: `${sel.pre >= 0 ? "+" : ""}${sel.pre.toFixed(1)}%`, color: "#b45309" },
                { label: lang === "zh" ? "当日反应" : "ER Reaction", value: `${sel.beat >= 0 ? "+" : ""}${sel.beat.toFixed(1)}%`, color: sel.beat >= 0 ? "#16a34a" : "#dc2626" },
                { label: lang === "zh" ? "财报后漂移" : "Post Drift", value: `${sel.post >= 0 ? "+" : ""}${sel.post.toFixed(1)}%`, color: sel.post >= 0 ? "#16a34a" : "#dc2626" },
                { label: lang === "zh" ? "EPS超预期" : "EPS Surprise", value: `${surprise >= 0 ? "+" : ""}${surprise.toFixed(1)}%`, color: surprise >= 0 ? "#16a34a" : "#dc2626" },
                { label: lang === "zh" ? "营收超预期" : "Rev Surprise", value: `${revSurprise >= 0 ? "+" : ""}${revSurprise.toFixed(1)}%`, color: revSurprise >= 0 ? "#16a34a" : "#dc2626" },
              ].map(m => (
                <div key={m.label} className="card" style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 5 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "18px 20px" }}>
              <div className="section-label" style={{ marginBottom: 4 }}>
                {sel.name} · {lang === "zh" ? "财报前后走势" : "STOCK TIMELINE AROUND EARNINGS"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                {lang === "zh" ? "相对于财报日的天数（0=财报日）" : "Days relative to earnings date (0 = report day)"}
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={tlData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <XAxis dataKey="t" tickFormatter={(v: number) => v === 0 ? "ER" : `${v > 0 ? "+" : ""}${v}d`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto", "auto"]} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}%`, lang === "zh" ? "涨跌幅" : "Return"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11 }} />
                  <ReferenceLine x={0} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: "ER", position: "top", fill: "#dc2626", fontSize: 10 }} />
                  <ReferenceLine y={0} stroke="#f1f5f9" />
                  <Line type="monotone" dataKey="v" stroke={sel.beat >= 0 ? "#16a34a" : "#dc2626"} strokeWidth={2.5} dot={{ r: 4, fill: sel.beat >= 0 ? "#16a34a" : "#dc2626", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { title: lang === "zh" ? "EPS分析" : "EPS BREAKDOWN", est: sel.eps_est, act: sel.eps_act, surp: surprise, prefix: "$" },
                { title: lang === "zh" ? "营收分析 ($B)" : "REVENUE BREAKDOWN ($B)", est: sel.rev_est, act: sel.rev_act, surp: revSurprise, prefix: "$", suffix: "B" },
              ].map(item => (
                <div key={item.title} className="card" style={{ padding: "16px 18px" }}>
                  <div className="section-label" style={{ marginBottom: 12 }}>{item.title}</div>
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                    {[
                      { label: lang === "zh" ? "预测值" : "Estimate", value: item.est, dim: true },
                      { label: lang === "zh" ? "实际值" : "Actual", value: item.act, dim: false },
                    ].map(x => (
                      <div key={x.label}>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{x.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: x.dim ? "#94a3b8" : item.surp >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                          {item.prefix}{x.value.toFixed(2)}{item.suffix ?? ""}
                        </div>
                      </div>
                    ))}
                    <div style={{ marginLeft: "auto", textAlign: "right" as const }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{lang === "zh" ? "超预期" : "SURPRISE"}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: item.surp >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                        {item.surp >= 0 ? "+" : ""}{item.surp.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
