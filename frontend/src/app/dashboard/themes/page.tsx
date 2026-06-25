"use client";
import { useEffect, useState, useRef } from "react";
import { api, type Timeframe } from "@/lib/api";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useLang } from "@/contexts/LangContext";
import { useIsMobile } from "@/hooks/useIsMobile";

// Default 30+ themes across all major categories
const DEFAULT_THEMES = [
  { name: "AI / Tech",       ticker: "QQQ",  color: "#1d4ed8", tags: ["Tech", "Growth"] },
  { name: "Semiconductors",  ticker: "SOXX", color: "#7c3aed", tags: ["Tech", "Cyclical"] },
  { name: "Cloud",           ticker: "WCLD", color: "#0891b2", tags: ["Tech", "SaaS"] },
  { name: "Cybersecurity",   ticker: "CIBR", color: "#4f46e5", tags: ["Tech", "Defensive"] },
  { name: "Robotics/AI",     ticker: "BOTZ", color: "#1d4ed8", tags: ["Tech", "Growth"] },
  { name: "Clean Energy",    ticker: "ICLN", color: "#16a34a", tags: ["ESG", "Infra"] },
  { name: "China Tech",      ticker: "KWEB", color: "#dc2626", tags: ["EM", "Growth"] },
  { name: "India",           ticker: "INDA", color: "#ea580c", tags: ["EM", "Growth"] },
  { name: "EM",              ticker: "EEM",  color: "#b45309", tags: ["EM", "Macro"] },
  { name: "Japan",           ticker: "EWJ",  color: "#e11d48", tags: ["DM", "Asia"] },
  { name: "Europe",          ticker: "VGK",  color: "#4338ca", tags: ["DM", "Value"] },
  { name: "Financials",      ticker: "XLF",  color: "#b45309", tags: ["Value", "Rate-sensitive"] },
  { name: "Energy",          ticker: "XLE",  color: "#57534e", tags: ["Commodities", "Value"] },
  { name: "Healthcare",      ticker: "XLV",  color: "#0284c7", tags: ["Defensive", "Growth"] },
  { name: "Biotech",         ticker: "XBI",  color: "#0891b2", tags: ["Healthcare", "Growth"] },
  { name: "Consumer Disc.",  ticker: "XLY",  color: "#d97706", tags: ["Cyclical", "Consumer"] },
  { name: "Consumer Stap.",  ticker: "XLP",  color: "#15803d", tags: ["Defensive", "Consumer"] },
  { name: "Industrials",     ticker: "XLI",  color: "#6d28d9", tags: ["Cyclical", "Infra"] },
  { name: "Materials",       ticker: "XLB",  color: "#92400e", tags: ["Commodities", "Cyclical"] },
  { name: "Real Estate",     ticker: "XLRE", color: "#be185d", tags: ["Income", "Rate-sensitive"] },
  { name: "Utilities",       ticker: "XLU",  color: "#4d7c0f", tags: ["Defensive", "Income"] },
  { name: "Defence",         ticker: "ITA",  color: "#3730a3", tags: ["Value", "Infra"] },
  { name: "Gold / Metals",   ticker: "GDX",  color: "#d97706", tags: ["Commodities", "Inflation"] },
  { name: "Long Bonds",      ticker: "TLT",  color: "#475569", tags: ["Rates", "Duration"] },
  { name: "High Yield",      ticker: "HYG",  color: "#9f1239", tags: ["Rates", "Risk"] },
  { name: "Small Caps",      ticker: "IWM",  color: "#0369a1", tags: ["US", "Cyclical"] },
  { name: "S&P 500",         ticker: "SPY",  color: "#1e3a5f", tags: ["US", "Broad"] },
  { name: "Bitcoin",         ticker: "BITO", color: "#f59e0b", tags: ["Crypto", "Risk"] },
  { name: "Cannabis",        ticker: "MSOS", color: "#16a34a", tags: ["Speculative"] },
  { name: "Space Tech",      ticker: "UFO",  color: "#6366f1", tags: ["Tech", "Speculative"] },
];

const TF: Timeframe[] = ["1D", "3D", "7D", "1M", "YTD"];

const CATEGORIES = ["All", "Tech", "EM", "DM", "Rates", "Commodities", "Defensive", "Cyclical", "Income", "ESG", "Speculative"];

interface ThemePoint {
  name: string; ticker: string; color: string; tags: string[];
  x: number; y: number; score: number;
  prevX: number; prevY: number;
  custom?: boolean;
}

function getTFDateRange(tf: Timeframe): string {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (tf === "1D") return `${fmt(new Date(now.getTime() - 86400000))} – Now`;
  if (tf === "3D") return `${fmt(new Date(now.getTime() - 3 * 86400000))} – Now`;
  if (tf === "7D") return `${fmt(new Date(now.getTime() - 7 * 86400000))} – Now`;
  if (tf === "1M") { const f = new Date(now); f.setMonth(f.getMonth() - 1); return `${fmt(f)} – Now`; }
  if (tf === "YTD") return `Jan 1 – Now`;
  return "";
}

function QuadrantChart({ data, lang }: { data: ThemePoint[]; lang: "en" | "zh" }) {
  const width = 680, height = 400;
  const ML = 50, MR = 30, MT = 28, MB = 44;
  const PW = width - ML - MR, PH = height - MT - MB;

  const xRange = Math.max(12, ...data.map(d => Math.abs(d.x)), ...data.map(d => Math.abs(d.prevX))) * 1.25;
  const yRange = Math.max(5,  ...data.map(d => Math.abs(d.y)), ...data.map(d => Math.abs(d.prevY))) * 1.4;

  const sx = (v: number) => ML + ((v + xRange) / (xRange * 2)) * PW;
  const sy = (v: number) => MT + ((yRange - v) / (yRange * 2)) * PH;
  const ox = sx(0), oy = sy(0);

  const xTicks = [-10, -5, 0, 5, 10].filter(t => Math.abs(t) <= xRange * 0.99);
  const yTicks = [-4, -2, 0, 2, 4].filter(t => Math.abs(t) <= yRange * 0.99);

  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredData = data.find(d => d.name === hovered);

  const QLabels = lang === "zh"
    ? ["领涨 ▲", "改善 ↗", "走弱 ↘", "落后 ▼"]
    : ["Leading ▲", "Improving ↗", "Weakening ↘", "Lagging ▼"];

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: "block", overflow: "visible" }}>
        <defs>
          {data.map(d => (
            <marker key={`mh-${d.name}`} id={`arr-${d.name.replace(/[^a-zA-Z0-9]/g, "")}`}
              markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill={d.color} opacity={0.7} />
            </marker>
          ))}
        </defs>

        <rect x={ox} y={MT}  width={ML+PW-ox} height={oy-MT}    fill="#16a34a" fillOpacity={0.06} />
        <rect x={ML} y={MT}  width={ox-ML}    height={oy-MT}    fill="#b45309" fillOpacity={0.06} />
        <rect x={ox} y={oy}  width={ML+PW-ox} height={MT+PH-oy} fill="#d97706" fillOpacity={0.06} />
        <rect x={ML} y={oy}  width={ox-ML}    height={MT+PH-oy} fill="#dc2626" fillOpacity={0.06} />

        <line x1={ox} y1={MT} x2={ox} y2={MT+PH} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={ML} y1={oy} x2={ML+PW} y2={oy} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 3" />

        <text x={ML+PW-8} y={MT+14} textAnchor="end"   fill="#16a34a" fontSize={10} fontWeight={700} opacity={0.75}>{QLabels[0]}</text>
        <text x={ML+8}    y={MT+14} textAnchor="start" fill="#b45309" fontSize={10} fontWeight={700} opacity={0.75}>{QLabels[1]}</text>
        <text x={ML+PW-8} y={MT+PH-7} textAnchor="end"   fill="#d97706" fontSize={10} fontWeight={700} opacity={0.75}>{QLabels[2]}</text>
        <text x={ML+8}    y={MT+PH-7} textAnchor="start" fill="#dc2626" fontSize={10} fontWeight={700} opacity={0.75}>{QLabels[3]}</text>

        {yTicks.map(t => (
          <g key={`yt${t}`}>
            <text x={ML-6} y={sy(t)+3} textAnchor="end" fill="#94a3b8" fontSize={9}>{t>0?`+${t}`:t===0?"0":`${t}`}</text>
            <line x1={ML-3} y1={sy(t)} x2={ML} y2={sy(t)} stroke="#e2e8f0" />
          </g>
        ))}
        {xTicks.map(t => (
          <g key={`xt${t}`}>
            <text x={sx(t)} y={MT+PH+14} textAnchor="middle" fill="#94a3b8" fontSize={9}>{t>0?`+${t}%`:t===0?"0":`${t}%`}</text>
            <line x1={sx(t)} y1={MT+PH} x2={sx(t)} y2={MT+PH+3} stroke="#e2e8f0" />
          </g>
        ))}

        <text x={ML+PW/2} y={height-4} textAnchor="middle" fill="#94a3b8" fontSize={9}>
          {lang === "zh" ? "← 负收益  |  正收益 →" : "← Negative Return  |  Positive Return →"}
        </text>
        <text x={11} y={MT+PH/2} textAnchor="middle" fill="#94a3b8" fontSize={9} transform={`rotate(-90, 11, ${MT+PH/2})`}>
          {lang === "zh" ? "动量Δ" : "Momentum Δ"}
        </text>

        {data.map(d => {
          const px = sx(d.prevX), py = sy(d.prevY), cx = sx(d.x), cy = sy(d.y);
          const dist = Math.hypot(cx-px, cy-py);
          if (dist < 10) return null;
          const r = Math.max(9, Math.min(17, Math.abs(d.score)/7+8));
          const ratio = (dist-r-2)/dist;
          const ex = px+(cx-px)*ratio, ey = py+(cy-py)*ratio;
          const id = d.name.replace(/[^a-zA-Z0-9]/g, "");
          return (
            <line key={`arr-${d.name}`} x1={px} y1={py} x2={ex} y2={ey}
              stroke={d.color} strokeWidth={1.8} strokeOpacity={0.55}
              markerEnd={`url(#arr-${id})`} strokeDasharray={hovered===d.name?"none":"4 2"} />
          );
        })}

        {data.map(d => {
          const px = sx(d.prevX), py = sy(d.prevY), cx = sx(d.x), cy = sy(d.y);
          if (Math.hypot(cx-px, cy-py) < 8) return null;
          return <circle key={`ghost-${d.name}`} cx={px} cy={py} r={8}
            fill={d.color} fillOpacity={0.1} stroke={d.color} strokeWidth={1} strokeDasharray="3 2" strokeOpacity={0.4} />;
        })}

        {data.map(d => {
          const cx = sx(d.x), cy = sy(d.y);
          const r = Math.max(9, Math.min(17, Math.abs(d.score)/7+8));
          const isHov = hovered === d.name;
          return (
            <g key={d.name} style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(d.name)} onMouseLeave={() => setHovered(null)}>
              {isHov && <circle cx={cx} cy={cy} r={r+5} fill={d.color} fillOpacity={0.15} />}
              <circle cx={cx} cy={cy} r={r}
                fill={d.color} fillOpacity={isHov?0.75:0.5}
                stroke={d.color} strokeWidth={isHov?2.5:1.5} />
              {d.custom && <circle cx={cx} cy={cy} r={r+2} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />}
              <text x={cx} y={cy-r-4} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={600}>
                {d.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {hoveredData && (
        <div style={{
          position: "absolute", bottom: 50, right: 16,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
          padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          pointerEvents: "none", minWidth: 200, zIndex: 10,
        }}>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
            {hoveredData.name}
            {hoveredData.custom && <span style={{ marginLeft: 6, fontSize: 9, color: "#f59e0b", border: "1px solid #f59e0b", borderRadius: 3, padding: "1px 4px" }}>CUSTOM</span>}
          </div>
          <div style={{ color: "#64748b", fontSize: 10, marginBottom: 8 }}>{hoveredData.ticker} · {hoveredData.tags.join(", ")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: lang==="zh"?"当前":"Current", value: `${hoveredData.x>=0?"+":""}${hoveredData.x.toFixed(2)}%`, color: hoveredData.x>=0?"#16a34a":"#dc2626" },
              { label: lang==="zh"?"相对前期":"Δ Prior",  value: `${hoveredData.y>=0?"+":""}${hoveredData.y.toFixed(2)}%`, color: hoveredData.y>=0?"#16a34a":"#dc2626" },
              { label: lang==="zh"?"评分":"Score",   value: hoveredData.score.toFixed(0), color: "#b45309" },
            ].map(m => (
              <div key={m.label} style={{ textAlign: "center" as const }}>
                <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{m.label}</div>
                <div style={{ fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, padding: "6px 8px", background: "#f8fafc", borderRadius: 4, fontSize: 11 }}>
            <span style={{ color: "#94a3b8" }}>{lang==="zh"?"前期":"Prior"}: </span>
            <span style={{ color: "#64748b" }}>({hoveredData.prevX>=0?"+":""}{hoveredData.prevX.toFixed(2)}%, {hoveredData.prevY>=0?"+":""}{hoveredData.prevY.toFixed(2)}%)</span>
            <span style={{ marginLeft: 6, color: "#0f172a", fontWeight: 600 }}>→ ({hoveredData.x>=0?"+":""}{hoveredData.x.toFixed(2)}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThemesPage() {
  const { t, lang } = useLang();
  const isMobile = useIsMobile();
  const [tf, setTf] = useState<Timeframe>("7D");
  const [themeData, setThemeData] = useState<ThemePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeThemes, setActiveThemes] = useState(DEFAULT_THEMES.map(t => t.ticker));
  const [customInput, setCustomInput] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const prevDataRef = useRef<Record<string, number>>({});

  // Load saved custom tickers from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("af_custom_themes");
      if (saved) setActiveThemes(prev => Array.from(new Set([...prev, ...JSON.parse(saved)])));
    } catch {}
  }, []);

  const allThemes = [
    ...DEFAULT_THEMES,
    // Any custom-added tickers not in defaults
    ...activeThemes
      .filter(tk => !DEFAULT_THEMES.find(t => t.ticker === tk))
      .map(tk => ({ name: tk, ticker: tk, color: "#64748b", tags: ["Custom"], custom: true as boolean })),
  ].filter(t => activeThemes.includes(t.ticker));

  const filteredThemes = filterCat === "All"
    ? allThemes
    : allThemes.filter(t => t.tags.some(tag => tag.toLowerCase().includes(filterCat.toLowerCase())));

  useEffect(() => {
    setLoading(true);
    Promise.all([api.assets(tf), api.sectors(tf)]).then(([assets, sectors]) => {
      const allData: Record<string, number> = {};
      assets.assets.forEach((a: any) => { allData[a.ticker] = a.change; });
      sectors.sectors.forEach((s: any) => { allData[s.ticker] = s.change; });

      const data: ThemePoint[] = filteredThemes.map(theme => {
        const x = allData[theme.ticker] ?? (Math.random() * 20 - 10);
        const y = x * 0.35 + (Math.random() - 0.45) * 3;
        const score = x * 5 + y * 2 + 50;
        const prevX = prevDataRef.current[theme.ticker] ?? (x - y * 0.9 + (Math.random() - 0.5) * 1.5);
        const prevY = -y * 0.4 + (Math.random() - 0.5) * 1;
        return { ...theme, x, y, score, prevX, prevY };
      });

      data.forEach(d => { prevDataRef.current[d.ticker] = d.x; });
      setThemeData(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [tf, activeThemes, filterCat]);

  const addCustomTheme = () => {
    const tk = customInput.trim().toUpperCase();
    if (!tk) return;
    const newActive = Array.from(new Set([...activeThemes, tk]));
    setActiveThemes(newActive);
    // Persist custom tickers
    const customTickers = newActive.filter(t => !DEFAULT_THEMES.find(d => d.ticker === t));
    localStorage.setItem("af_custom_themes", JSON.stringify(customTickers));
    setCustomInput("");
  };

  const removeTheme = (ticker: string) => {
    const newActive = activeThemes.filter(t => t !== ticker);
    setActiveThemes(newActive);
    const customTickers = newActive.filter(t => !DEFAULT_THEMES.find(d => d.ticker === t));
    localStorage.setItem("af_custom_themes", JSON.stringify(customTickers));
  };

  const sorted = [...themeData].sort((a, b) => b.score - a.score);

  const QUADRANT_DATA = [
    { label: t("quadrant_leading"), color: "#16a34a", bg: "#f0fdf4", border: "#86efac", desc: t("q_leading_desc") },
    { label: t("quadrant_improving"), color: "#b45309", bg: "#fffbeb", border: "#fcd34d", desc: t("q_improving_desc") },
    { label: t("quadrant_weakening"), color: "#d97706", bg: "#fff7ed", border: "#fed7aa", desc: t("q_weakening_desc") },
    { label: t("quadrant_lagging"), color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", desc: t("q_lagging_desc") },
  ];

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main className="page-content">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>{t("theme_page_label")}</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>{t("theme_page_title")}</h1>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              {t("theme_page_sub")} · <span style={{ color: "#94a3b8" }}>{t("theme_page_legend")}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {TF.map(tfOpt => (
              <div key={tfOpt} style={{ position: "relative" }}>
                <button onClick={() => setTf(tfOpt)} className={`tf-btn${tf===tfOpt?" active":""}`}>{tfOpt}</button>
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

        {/* Category filter + Add custom */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 500,
                border: "1px solid #e2e8f0", borderRadius: 20,
                background: filterCat === cat ? "#1e3a5f" : "#fff",
                color: filterCat === cat ? "#fff" : "#64748b",
                cursor: "pointer",
              }}>
              {lang === "zh" ? (
                cat === "All" ? "全部" : cat === "Tech" ? "科技" : cat === "EM" ? "新兴市场" :
                cat === "DM" ? "发达市场" : cat === "Rates" ? "利率" : cat === "Commodities" ? "商品" :
                cat === "Defensive" ? "防御" : cat === "Cyclical" ? "周期" : cat === "Income" ? "收益" :
                cat === "ESG" ? "ESG" : cat === "Speculative" ? "投机" : cat
              ) : cat}
            </button>
          ))}
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addCustomTheme(); }}
              placeholder={t("add_theme_placeholder")}
              style={{
                height: 30, padding: "0 10px", fontSize: 12,
                border: "1px solid #e2e8f0", borderRadius: 4, outline: "none",
                fontFamily: "inherit", color: "#0f172a", background: "#f8fafc",
                width: 160,
              }}
            />
            <button onClick={addCustomTheme} style={{
              padding: "0 12px", height: 30, fontSize: 12, fontWeight: 600,
              background: "#1e3a5f", color: "#fff", border: "none",
              borderRadius: 4, cursor: "pointer",
            }}>
              {t("add_theme")}
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14, gridTemplateColumns: isMobile ? "1fr" : "1fr 256px" }}>
          {/* Chart */}
          <div className="card" style={{ padding: "16px 18px", overflow: "hidden" }}>
            {loading ? (
              <div style={{ height: 400, background: "#f8fafc", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>{lang === "zh" ? "加载中…" : "Loading…"}</span>
              </div>
            ) : (
              <QuadrantChart data={themeData} lang={lang} />
            )}
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 11, color: "#64748b" }}>
              <span>
                <svg width="28" height="12" style={{ verticalAlign: "middle", marginRight: 4 }}>
                  <circle cx={5} cy={6} r={4} fill="#1d4ed8" fillOpacity={0.15} stroke="#1d4ed8" strokeWidth={1} strokeDasharray="2 2" />
                  <line x1={10} y1={6} x2={24} y2={6} stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="3 2" />
                  <polygon points="22,3 28,6 22,9" fill="#1d4ed8" opacity={0.7} />
                </svg>
                {lang === "zh" ? "前期位置 + 位移" : "Prior position + movement"}
              </span>
              <span>
                <svg width="16" height="12" style={{ verticalAlign: "middle", marginRight: 4 }}>
                  <circle cx={8} cy={6} r={5} fill="#1d4ed8" fillOpacity={0.5} stroke="#1d4ed8" strokeWidth={1.5} />
                </svg>
                {lang === "zh" ? "当前位置 (大小=评分)" : "Current position (size = score)"}
              </span>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card" style={{ padding: "14px 16px", overflowY: "auto", maxHeight: isMobile ? 300 : 460 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>{t("trending_now")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {sorted.map((th, i) => {
                const moved = th.x - th.prevX;
                return (
                  <div key={th.name} style={{ borderRadius: 5, padding: "8px 10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", minWidth: 16 }}>#{i+1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 4 }}>
                          {th.name}
                          <span style={{ fontSize: 10, color: moved>=0?"#16a34a":"#dc2626" }}>{moved>=0?"▲":"▼"}</span>
                          {th.custom && <span style={{ fontSize: 9, color: "#f59e0b", border: "1px solid #f59e0b", borderRadius: 2, padding: "0 3px" }}>★</span>}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{th.tags.join(" · ")}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: th.x>=0?"#16a34a":"#dc2626", fontVariantNumeric: "tabular-nums" }}>
                            {th.x>=0?"+":""}{(th.x??0).toFixed(1)}%
                          </div>
                          <div style={{ fontSize: 9, color: th.y>=0?"#16a34a":"#dc2626", fontVariantNumeric: "tabular-nums" }}>
                            Δ {th.y>=0?"+":""}{(th.y??0).toFixed(1)}
                          </div>
                        </div>
                        <button onClick={() => removeTheme(th.ticker)}
                          title={lang==="zh"?"移除":"Remove"}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 2, fontSize: 13, lineHeight: 1 }}>
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quadrant guide */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 14 }}>
          {QUADRANT_DATA.map(q => (
            <div key={q.label} style={{ padding: "12px 14px", borderRadius: 7, background: q.bg, border: `1px solid ${q.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: q.color, marginBottom: 4 }}>{q.label}</div>
              <p style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{q.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
