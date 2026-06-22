"use client";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useLang } from "@/contexts/LangContext";

function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function sr(ticker: string, n: number): number {
  let h = fnv1a(ticker) ^ (Math.imul(n + 1, 2654435761) >>> 0);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  return (h >>> 0) / 0xFFFFFFFF;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function genStock(ticker: string, sector: string) {
  const beat    = sr(ticker, 0) < 0.62;
  const epsEst  = +(0.5 + sr(ticker, 1) * 9).toFixed(2);
  const epsAct  = +(epsEst * (1 + (beat ? sr(ticker, 2) * 0.20 + 0.01 : -(sr(ticker, 2) * 0.24 + 0.01)))).toFixed(2);
  const revEst  = +(2 + sr(ticker, 3) * 98).toFixed(1);
  const revAct  = +(revEst * (1 + (beat ? sr(ticker, 4) * 0.09 : -(sr(ticker, 4) * 0.10)))).toFixed(1);
  const pre     = +((sr(ticker, 5) - 0.48) * 10).toFixed(1);
  const erRaw   = beat ? +(sr(ticker, 6) * 16 + 0.5).toFixed(1) : -(+(sr(ticker, 6) * 20 + 0.5).toFixed(1));
  const post    = +((sr(ticker, 7) - 0.52) * 9).toFixed(1);
  const date    = `${MONTHS[Math.floor(sr(ticker, 8) * 12)]} ${Math.floor(sr(ticker, 9) * 28) + 1}`;
  return { name: ticker, sector, date, pre, beat: erRaw, post, eps_est: epsEst, eps_act: epsAct, rev_est: revEst, rev_act: revAct };
}

const SP500_RAW: { name: string; sector: string }[] = [
  { name:"NVDA",sector:"Technology"},{ name:"AAPL",sector:"Technology"},{ name:"MSFT",sector:"Technology"},
  { name:"AMD",sector:"Technology"},{ name:"INTC",sector:"Technology"},{ name:"CRM",sector:"Technology"},
  { name:"ORCL",sector:"Technology"},{ name:"ADBE",sector:"Technology"},{ name:"QCOM",sector:"Technology"},
  { name:"TXN",sector:"Technology"},{ name:"AVGO",sector:"Technology"},{ name:"MU",sector:"Technology"},
  { name:"AMAT",sector:"Technology"},{ name:"NOW",sector:"Technology"},{ name:"INTU",sector:"Technology"},
  { name:"ADSK",sector:"Technology"},{ name:"SNPS",sector:"Technology"},{ name:"CDNS",sector:"Technology"},
  { name:"PANW",sector:"Technology"},{ name:"FTNT",sector:"Technology"},{ name:"CRWD",sector:"Technology"},
  { name:"SNOW",sector:"Technology"},{ name:"PLTR",sector:"Technology"},{ name:"DDOG",sector:"Technology"},
  { name:"ZS",sector:"Technology"},{ name:"KLAC",sector:"Technology"},{ name:"LRCX",sector:"Technology"},
  { name:"HPQ",sector:"Technology"},{ name:"IBM",sector:"Technology"},{ name:"ACN",sector:"Technology"},
  { name:"GOOGL",sector:"Comm. Services"},{ name:"META",sector:"Comm. Services"},
  { name:"NFLX",sector:"Comm. Services"},{ name:"DIS",sector:"Comm. Services"},
  { name:"CMCSA",sector:"Comm. Services"},{ name:"T",sector:"Comm. Services"},
  { name:"VZ",sector:"Comm. Services"},{ name:"CHTR",sector:"Comm. Services"},
  { name:"PARA",sector:"Comm. Services"},{ name:"WBD",sector:"Comm. Services"},
  { name:"TTWO",sector:"Comm. Services"},{ name:"EA",sector:"Comm. Services"},
  { name:"AMZN",sector:"Consumer Disc."},{ name:"TSLA",sector:"Consumer Disc."},
  { name:"HD",sector:"Consumer Disc."},{ name:"NKE",sector:"Consumer Disc."},
  { name:"MCD",sector:"Consumer Disc."},{ name:"SBUX",sector:"Consumer Disc."},
  { name:"TJX",sector:"Consumer Disc."},{ name:"LOW",sector:"Consumer Disc."},
  { name:"TGT",sector:"Consumer Disc."},{ name:"CMG",sector:"Consumer Disc."},
  { name:"BKNG",sector:"Consumer Disc."},{ name:"RCL",sector:"Consumer Disc."},
  { name:"CCL",sector:"Consumer Disc."},{ name:"GM",sector:"Consumer Disc."},
  { name:"F",sector:"Consumer Disc."},{ name:"ABNB",sector:"Consumer Disc."},
  { name:"EBAY",sector:"Consumer Disc."},{ name:"ETSY",sector:"Consumer Disc."},
  { name:"WMT",sector:"Consumer Staples"},{ name:"COST",sector:"Consumer Staples"},
  { name:"PG",sector:"Consumer Staples"},{ name:"KO",sector:"Consumer Staples"},
  { name:"PEP",sector:"Consumer Staples"},{ name:"PM",sector:"Consumer Staples"},
  { name:"MO",sector:"Consumer Staples"},{ name:"MDLZ",sector:"Consumer Staples"},
  { name:"KHC",sector:"Consumer Staples"},{ name:"CL",sector:"Consumer Staples"},
  { name:"GIS",sector:"Consumer Staples"},{ name:"K",sector:"Consumer Staples"},
  { name:"JPM",sector:"Financials"},{ name:"BAC",sector:"Financials"},
  { name:"WFC",sector:"Financials"},{ name:"GS",sector:"Financials"},
  { name:"MS",sector:"Financials"},{ name:"C",sector:"Financials"},
  { name:"BLK",sector:"Financials"},{ name:"SCHW",sector:"Financials"},
  { name:"AXP",sector:"Financials"},{ name:"COF",sector:"Financials"},
  { name:"V",sector:"Financials"},{ name:"MA",sector:"Financials"},
  { name:"PYPL",sector:"Financials"},{ name:"SPGI",sector:"Financials"},
  { name:"MCO",sector:"Financials"},{ name:"ICE",sector:"Financials"},
  { name:"USB",sector:"Financials"},{ name:"PNC",sector:"Financials"},
  { name:"TFC",sector:"Financials"},{ name:"MTB",sector:"Financials"},
  { name:"UNH",sector:"Healthcare"},{ name:"JNJ",sector:"Healthcare"},
  { name:"LLY",sector:"Healthcare"},{ name:"PFE",sector:"Healthcare"},
  { name:"ABBV",sector:"Healthcare"},{ name:"MRK",sector:"Healthcare"},
  { name:"BMY",sector:"Healthcare"},{ name:"AMGN",sector:"Healthcare"},
  { name:"GILD",sector:"Healthcare"},{ name:"CVS",sector:"Healthcare"},
  { name:"CI",sector:"Healthcare"},{ name:"HUM",sector:"Healthcare"},
  { name:"TMO",sector:"Healthcare"},{ name:"DHR",sector:"Healthcare"},
  { name:"MDT",sector:"Healthcare"},{ name:"ISRG",sector:"Healthcare"},
  { name:"SYK",sector:"Healthcare"},{ name:"REGN",sector:"Healthcare"},
  { name:"VRTX",sector:"Healthcare"},{ name:"BIIB",sector:"Healthcare"},
  { name:"ZBH",sector:"Healthcare"},{ name:"EW",sector:"Healthcare"},
  { name:"XOM",sector:"Energy"},{ name:"CVX",sector:"Energy"},
  { name:"COP",sector:"Energy"},{ name:"SLB",sector:"Energy"},
  { name:"OXY",sector:"Energy"},{ name:"MPC",sector:"Energy"},
  { name:"VLO",sector:"Energy"},{ name:"DVN",sector:"Energy"},
  { name:"EOG",sector:"Energy"},{ name:"PSX",sector:"Energy"},
  { name:"HES",sector:"Energy"},{ name:"BKR",sector:"Energy"},
  { name:"BA",sector:"Industrials"},{ name:"CAT",sector:"Industrials"},
  { name:"GE",sector:"Industrials"},{ name:"HON",sector:"Industrials"},
  { name:"MMM",sector:"Industrials"},{ name:"UPS",sector:"Industrials"},
  { name:"FDX",sector:"Industrials"},{ name:"RTX",sector:"Industrials"},
  { name:"NOC",sector:"Industrials"},{ name:"LMT",sector:"Industrials"},
  { name:"DE",sector:"Industrials"},{ name:"EMR",sector:"Industrials"},
  { name:"GD",sector:"Industrials"},{ name:"ETN",sector:"Industrials"},
  { name:"NEM",sector:"Materials"},{ name:"FCX",sector:"Materials"},
  { name:"LIN",sector:"Materials"},{ name:"APD",sector:"Materials"},
  { name:"NUE",sector:"Materials"},{ name:"DOW",sector:"Materials"},
  { name:"DD",sector:"Materials"},{ name:"PPG",sector:"Materials"},
  { name:"AMT",sector:"Real Estate"},{ name:"PLD",sector:"Real Estate"},
  { name:"CCI",sector:"Real Estate"},{ name:"EQIX",sector:"Real Estate"},
  { name:"PSA",sector:"Real Estate"},{ name:"O",sector:"Real Estate"},
  { name:"SPG",sector:"Real Estate"},{ name:"VICI",sector:"Real Estate"},
  { name:"NEE",sector:"Utilities"},{ name:"DUK",sector:"Utilities"},
  { name:"SO",sector:"Utilities"},{ name:"D",sector:"Utilities"},
  { name:"AEP",sector:"Utilities"},{ name:"EXC",sector:"Utilities"},
];

const STOCKS = SP500_RAW.map(s => genStock(s.name, s.sector));
const SECTORS_LIST = ["All", ...Array.from(new Set(SP500_RAW.map(s => s.sector)))];

function buildTimeline(stock: ReturnType<typeof genStock>) {
  return [
    { t: -10, v: 0 },
    { t: -5,  v: -stock.pre * 0.3 },
    { t: -1,  v: stock.pre },
    { t: 0,   v: stock.pre + stock.beat },
    { t: 1,   v: stock.post + stock.beat },
    { t: 5,   v: stock.post * 0.7 + stock.beat },
    { t: 10,  v: stock.post * 0.4 + stock.beat },
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

  const tlData    = buildTimeline(sel);
  const surprise  = (sel.eps_act - sel.eps_est) / sel.eps_est * 100;
  const revSurp   = (sel.rev_act - sel.rev_est) / sel.rev_est * 100;

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
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
          {lang === "zh"
            ? `${STOCKS.length} 只标普500成分股 · 点击查看详情`
            : `${STOCKS.length} S&P 500 companies · Click any ticker for full earnings breakdown`}
        </p>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, marginBottom: 16 }}>
          <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <span style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
            <strong>{lang === "zh" ? "演示数据" : "ILLUSTRATIVE DATA"}</strong>
            {" — "}
            {lang === "zh"
              ? "以下EPS和营收数据为演示用途，并非真实历史财报。生产版本请接入 Bloomberg、FactSet 或 Refinitiv 等专业数据源。"
              : "EPS and revenue figures are generated for demonstration only and do not reflect actual reported results. Connect to Bloomberg, FactSet, or Refinitiv for live earnings data in production."}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
          {/* Left: stock list */}
          <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)", overflow: "hidden" }}>
            <div style={{ padding: "12px 12px 8px", flexShrink: 0 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={lang === "zh" ? "搜索代码…" : "Search ticker (e.g. NVDA)…"}
                style={{ width: "100%", height: 32, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const, marginBottom: 8 }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {SECTORS_LIST.map(s => (
                  <button key={s} onClick={() => setSectorFilter(s)} style={{
                    padding: "2px 6px", fontSize: 9, fontWeight: 700, fontFamily: "inherit",
                    background: sectorFilter === s ? "#1e3a5f" : "#f1f5f9",
                    color: sectorFilter === s ? "#fff" : "#475569",
                    border: "none", borderRadius: 3, cursor: "pointer",
                  }}>{s === "All" ? (lang === "zh" ? "全部" : "All") : s}</button>
                ))}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>
                {filtered.length} {lang === "zh" ? "家" : "companies"}
              </div>
            </div>
            <div style={{ borderBottom: "1px solid #f1f5f9", flexShrink: 0 }} />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered.length === 0
                ? <div style={{ padding: 16, textAlign: "center" as const, color: "#94a3b8", fontSize: 12 }}>{lang === "zh" ? "无结果" : "No results"}</div>
                : filtered.map(s => (
                  <button key={s.name} onClick={() => setSel(s)} style={{
                    width: "100%", padding: "8px 12px", border: "none",
                    background: sel.name === s.name ? "#eff6ff" : "transparent",
                    borderLeft: `2px solid ${sel.name === s.name ? "#1e3a5f" : "transparent"}`,
                    textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit",
                    borderBottom: "1px solid #f8fafc",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", fontFamily: "monospace" }}>{s.name}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: s.beat >= 0 ? "#16a34a" : "#dc2626", background: s.beat >= 0 ? "#f0fdf4" : "#fef2f2", padding: "1px 5px", borderRadius: 3 }}>
                        {s.beat >= 0 ? "BEAT" : "MISS"}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{s.sector} · {s.date}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>EPS {s.eps_act} vs {s.eps_est}E</div>
                  </button>
                ))}
            </div>
          </div>

          {/* Right: detail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                { label: lang === "zh" ? "财报前" : "Pre-ER",        value: `${sel.pre >= 0?"+":""}${sel.pre.toFixed(1)}%`,      color: "#b45309" },
                { label: lang === "zh" ? "当日反应" : "ER Day",       value: `${sel.beat >= 0?"+":""}${sel.beat.toFixed(1)}%`,    color: sel.beat >= 0 ? "#16a34a" : "#dc2626" },
                { label: lang === "zh" ? "财报后" : "Post Drift",     value: `${sel.post >= 0?"+":""}${sel.post.toFixed(1)}%`,    color: sel.post >= 0 ? "#16a34a" : "#dc2626" },
                { label: lang === "zh" ? "EPS超预期" : "EPS Beat",    value: `${surprise >= 0?"+":""}${surprise.toFixed(1)}%`,   color: surprise >= 0 ? "#16a34a" : "#dc2626" },
                { label: lang === "zh" ? "营收超预期" : "Rev Beat",   value: `${revSurp >= 0?"+":""}${revSurp.toFixed(1)}%`,     color: revSurp >= 0 ? "#16a34a" : "#dc2626" },
              ].map(m => (
                <div key={m.label} className="card" style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 5 }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "18px 20px" }}>
              <div className="section-label" style={{ marginBottom: 4 }}>
                {sel.name} · {lang === "zh" ? "财报前后走势" : "EARNINGS TIMELINE"} · {sel.date}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                {lang === "zh" ? "0=财报日，正数=财报后天数" : "0 = report day · positive = days after"}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={tlData} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <XAxis dataKey="t" tickFormatter={(v: number) => v === 0 ? "ER" : `${v > 0 ? "+" : ""}${v}d`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={["auto","auto"]} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}%`, lang === "zh" ? "涨跌幅" : "Return"]} contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 11 }} />
                  <ReferenceLine x={0} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: "ER", position: "top", fill: "#dc2626", fontSize: 10 }} />
                  <ReferenceLine y={0} stroke="#f1f5f9" />
                  <Line type="monotone" dataKey="v" stroke={sel.beat >= 0 ? "#16a34a" : "#dc2626"} strokeWidth={2.5} dot={{ r: 4, fill: sel.beat >= 0 ? "#16a34a" : "#dc2626", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { title: lang === "zh" ? "EPS分析" : "EPS BREAKDOWN",          est: sel.eps_est, act: sel.eps_act, surp: surprise,  prefix: "$", suffix: ""  },
                { title: lang === "zh" ? "营收分析 ($B)" : "REVENUE ($B)",      est: sel.rev_est, act: sel.rev_act, surp: revSurp,   prefix: "$", suffix: "B" },
              ].map(item => (
                <div key={item.title} className="card" style={{ padding: "16px 18px" }}>
                  <div className="section-label" style={{ marginBottom: 12 }}>{item.title}</div>
                  <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                    {[
                      { label: lang === "zh" ? "预测值" : "Estimate", value: item.est, dim: true },
                      { label: lang === "zh" ? "实际值" : "Actual",   value: item.act, dim: false },
                    ].map(x => (
                      <div key={x.label}>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{x.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: x.dim ? "#94a3b8" : item.surp >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
                          {item.prefix}{x.value.toFixed(2)}{item.suffix}
                        </div>
                      </div>
                    ))}
                    <div style={{ marginLeft: "auto", textAlign: "right" as const }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{lang === "zh" ? "超预期" : "SURPRISE"}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: item.surp >= 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>
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
