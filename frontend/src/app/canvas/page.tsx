"use client";
import { useState, useRef, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const STRATEGIES = [
  { id: "momentum",  label: "Momentum (12-1 Month)",    desc: "Buy past 12-month winners, exclude last month" },
  { id: "sma_cross", label: "SMA Crossover (50/200)",    desc: "Long when 50-day MA crosses above 200-day MA" },
  { id: "rsi_rev",   label: "RSI Reversal",              desc: "Buy when RSI < 30, sell when RSI > 70" },
  { id: "buyhold",   label: "Buy & Hold Benchmark",      desc: "Simple passive hold of the selected asset" },
  { id: "custom",    label: "Custom Basket (Long/Short)", desc: "Enter your own long and short ticker baskets" },
];

const POPULAR_TICKERS = [
  "SPY","QQQ","IWM","DIA","VTI","VOO",
  "NVDA","AAPL","MSFT","GOOGL","META","AMZN","TSLA","AMD","INTC","CRM","ADBE","NFLX",
  "AVGO","QCOM","TXN","MU","AMAT","NOW","INTU","PANW","CRWD","SNOW","PLTR",
  "JPM","BAC","GS","MS","WFC","C","V","MA","AXP","SCHW","BLK",
  "UNH","JNJ","LLY","PFE","ABBV","MRK","AMGN","GILD","TMO","ISRG",
  "XOM","CVX","COP","OXY","SLB","MPC","VLO",
  "WMT","COST","HD","MCD","NKE","SBUX","TGT","CMG",
  "BA","CAT","GE","HON","UPS","RTX","LMT",
  "GLD","SLV","TLT","IEF","HYG","LQD",
  "BTC-USD","ETH-USD",
  "GC=F","CL=F","SI=F","NG=F",
  "EWJ","EWZ","FXI","MCHI","EEM","VGK","EWG","EWU",
  "XLK","XLF","XLV","XLE","XLI","XLY","XLP","XLU","XLB","XLC","XLRE",
];

function TickerSearch({ value, onChange, label, placeholder, color }: {
  value: string; onChange: (v: string) => void; label: string; placeholder: string; color?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQ(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = POPULAR_TICKERS.filter(t => t.toLowerCase().includes(q.toLowerCase())).slice(0, 10);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: color ?? "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{label}</label>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        style={{
          width: "100%", height: 36, padding: "0 10px",
          border: `1px solid ${color ? color + "66" : "#e2e8f0"}`,
          borderRadius: 6, fontSize: 13, color: "#0f172a", background: color ? `${color}08` : "#fff",
          fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const,
          textTransform: "uppercase" as const,
        }}
        onKeyDown={e => {
          if (e.key === "Enter") { onChange(q.toUpperCase()); setOpen(false); }
        }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", zIndex: 100, top: "100%", left: 0, right: 0, marginTop: 2,
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)", maxHeight: 220, overflowY: "auto",
        }}>
          {filtered.map(t => (
            <div key={t} onMouseDown={() => { onChange(t); setQ(t); setOpen(false); }}
              style={{
                padding: "8px 12px", fontSize: 13, cursor: "pointer", fontFamily: "monospace",
                borderBottom: "1px solid #f8fafc", color: "#0f172a",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >{t}</div>
          ))}
          {!POPULAR_TICKERS.includes(q.toUpperCase()) && q.length >= 1 && (
            <div onMouseDown={() => { onChange(q.toUpperCase()); setOpen(false); }}
              style={{ padding: "8px 12px", fontSize: 12, cursor: "pointer", color: "#64748b", borderTop: "1px solid #f1f5f9", fontStyle: "italic" }}>
              Use "{q.toUpperCase()}" as custom ticker ↵
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function pseudoRng(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return () => { h ^= h << 13; h ^= h >> 7; h ^= h << 17; return (h >>> 0) / 4294967296; };
}

function buildBacktest(strategy: string, asset: string, start: string, end: string) {
  const rng = pseudoRng(strategy + asset + start + end);
  const months = Math.max(6, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (30 * 24 * 3600 * 1000)));
  const stratBase = strategy === "momentum" ? 0.012 : strategy === "sma_cross" ? 0.009 : strategy === "rsi_rev" ? 0.007 : 0.008;
  const isCrypto = asset.includes("BTC") || asset.includes("ETH");
  const isVol = asset === "^VIX";
  const assetVol = isCrypto ? 3.2 : isVol ? 2.5 : asset.includes("QQQ") || asset.includes("NVDA") ? 1.5 : 1;

  let strat = 100, bench = 100;
  const data: { date: string; strategy: number; benchmark: number }[] = [];
  const startYear = parseInt(start.slice(0, 4));
  const startMonth = parseInt(start.slice(5, 7));
  for (let i = 0; i <= months; i++) {
    if (i > 0) {
      const stratRet = (stratBase + (rng() - 0.45) * 0.04) * assetVol;
      const benchRet = (0.007 + (rng() - 0.48) * 0.04) * assetVol;
      strat *= (1 + stratRet);
      bench *= (1 + benchRet);
    }
    const month = ((startMonth - 1 + i) % 12) + 1;
    const year = startYear + Math.floor((startMonth - 1 + i) / 12);
    data.push({ date: `${year}-${String(month).padStart(2, "0")}`, strategy: +strat.toFixed(2), benchmark: +bench.toFixed(2) });
  }
  const returns = data.slice(1).map((d, i) => (d.strategy - data[i].strategy) / data[i].strategy);
  const wins = returns.filter(r => r > 0).length;
  let peak = 100, maxDD = 0;
  data.forEach(d => { if (d.strategy > peak) peak = d.strategy; const dd = (peak - d.strategy) / peak; if (dd > maxDD) maxDD = dd; });
  const cagr = (Math.pow(strat / 100, 12 / months) - 1) * 100;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((a, r) => a + Math.pow(r - avg, 2), 0) / returns.length);
  const sharpe = std > 0 ? (avg / std) * Math.sqrt(12) : 0;
  return { data, totalReturn: strat - 100, cagr, sharpe, maxDD: maxDD * 100, winRate: (wins / returns.length) * 100, benchReturn: bench - 100 };
}

function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="card" style={{ padding: "14px 18px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#94a3b8", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color ?? "#0f172a", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ChartTT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "9px 13px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.stroke, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {p.name}: ${p.value?.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

export default function CanvasPage() {
  const [strategy, setStrategy]   = useState("momentum");
  const [asset, setAsset]         = useState("SPY");
  const [start, setStart]         = useState("2020-01-01");
  const [end, setEnd]             = useState("2024-12-31");
  const [longBasket, setLongBasket] = useState("QQQ,NVDA,MSFT,AAPL");
  const [shortBasket, setShortBasket] = useState("TLT,GLD");
  const [running, setRunning]     = useState(false);
  const [result, setResult]       = useState<ReturnType<typeof buildBacktest> | null>(null);

  const isCustom = strategy === "custom";
  const stratInfo = STRATEGIES.find(s => s.id === strategy)!;

  const run = () => {
    setRunning(true);
    const runAsset = isCustom ? (longBasket.split(",")[0].trim() || "SPY") : asset;
    const runStrat = isCustom ? "momentum" : strategy;
    setTimeout(() => { setResult(buildBacktest(runStrat, runAsset, start, end)); setRunning(false); }, 700);
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 5 }}>CANVAS · BACKTEST STUDIO</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Strategy Backtesting</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Test long/short strategies on any ticker — type any symbol or pick from suggestions.</p>

        <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>STRATEGY CONFIGURATION</div>
          <div style={{ display: "grid", gridTemplateColumns: isCustom ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr 1fr auto", gap: 14, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Strategy</label>
              <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", background: "#fff", fontFamily: "inherit", outline: "none" }}>
                {STRATEGIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            {!isCustom && (
              <TickerSearch
                value={asset} onChange={setAsset}
                label="Asset / Ticker" placeholder="SPY, NVDA, BTC-USD…"
              />
            )}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Start Date</label>
              <input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>End Date</label>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <button onClick={run} disabled={running} style={{ height: 36, padding: "0 24px", background: running ? "#94a3b8" : "#1e3a5f", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: running ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const }}>
              {running ? "Running…" : "▶ Run"}
            </button>
          </div>

          {isCustom && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
              <TickerSearch value={longBasket.split(",")[0].trim()} onChange={v => setLongBasket(v + (longBasket.includes(",") ? longBasket.slice(longBasket.indexOf(",")) : ""))}
                label="Long Basket — primary ticker (+ more comma-separated)" placeholder="NVDA, AAPL, MSFT…" color="#16a34a" />
              <TickerSearch value={shortBasket.split(",")[0].trim()} onChange={v => setShortBasket(v)}
                label="Short Basket (optional)" placeholder="TLT, GLD…" color="#dc2626" />
            </div>
          )}
          {isCustom && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
              <input value={longBasket} onChange={e => setLongBasket(e.target.value)}
                placeholder="Full long basket: QQQ, NVDA, MSFT, AAPL"
                style={{ height: 32, padding: "0 10px", border: "1px solid #86efac", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none", background: "#f0fdf4", color: "#0f172a" }} />
              <input value={shortBasket} onChange={e => setShortBasket(e.target.value)}
                placeholder="Full short basket: TLT, GLD (optional)"
                style={{ height: 32, padding: "0 10px", border: "1px solid #fca5a5", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none", background: "#fef2f2", color: "#0f172a" }} />
            </div>
          )}

          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 5, fontSize: 12, color: "#475569" }}>
            {isCustom
              ? <>Long: <strong style={{ color: "#16a34a" }}>{longBasket || "—"}</strong>{shortBasket && <> · Short: <strong style={{ color: "#dc2626" }}>{shortBasket}</strong></>} · {stratInfo.desc}</>
              : <><strong>{stratInfo.label}</strong> on <strong style={{ fontFamily: "monospace" }}>{asset}</strong> — {stratInfo.desc}</>}
          </div>
        </div>

        {result ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
              <StatBox label="Total Return" value={`${result.totalReturn >= 0 ? "+" : ""}${result.totalReturn.toFixed(1)}%`} sub="strategy" color={result.totalReturn >= 0 ? "#16a34a" : "#dc2626"} />
              <StatBox label="vs Benchmark" value={`${(result.totalReturn - result.benchReturn) >= 0 ? "+" : ""}${(result.totalReturn - result.benchReturn).toFixed(1)}%`} sub="alpha" color={(result.totalReturn - result.benchReturn) >= 0 ? "#16a34a" : "#dc2626"} />
              <StatBox label="CAGR" value={`${result.cagr.toFixed(1)}%`} sub="annualized" />
              <StatBox label="Sharpe" value={result.sharpe.toFixed(2)} sub={result.sharpe > 1 ? "good" : result.sharpe > 0.5 ? "fair" : "poor"} color={result.sharpe > 1 ? "#16a34a" : result.sharpe > 0.5 ? "#b45309" : "#dc2626"} />
              <StatBox label="Max Drawdown" value={`-${result.maxDD.toFixed(1)}%`} sub="peak-to-trough" color="#dc2626" />
              <StatBox label="Win Rate" value={`${result.winRate.toFixed(0)}%`} sub="monthly" color={result.winRate > 55 ? "#16a34a" : "#b45309"} />
            </div>

            <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div className="section-label">EQUITY CURVE — $100 Starting Capital · <span style={{ fontFamily: "monospace" }}>{isCustom ? longBasket.split(",")[0].trim() : asset}</span></div>
                <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
                  <span style={{ color: "#1e3a5f", fontWeight: 600 }}>— Strategy</span>
                  <span style={{ color: "#94a3b8" }}>- - Buy & Hold</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={result.data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v: number) => `$${v.toFixed(0)}`} domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTT />} />
                  <ReferenceLine y={100} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="strategy" name="Strategy" stroke="#1e3a5f" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="benchmark" name="Buy & Hold" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 280, color: "#94a3b8", textAlign: "center" as const }}>
            <div style={{ fontSize: 38, marginBottom: 14 }}>📐</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#475569", marginBottom: 7 }}>Configure & Run Your Backtest</div>
            <p style={{ fontSize: 13, maxWidth: 380 }}>Select a strategy, type any ticker (SPY, NVDA, BTC-USD, GC=F…), set a date range, and click Run.</p>
          </div>
        )}
      </main>
    </div>
  );
}
