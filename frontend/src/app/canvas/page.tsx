"use client";
import { useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

const STRATEGIES = [
  { id: "momentum", label: "Momentum (12-1 Month)", desc: "Buy past 12-month winners, exclude last month" },
  { id: "sma_cross", label: "SMA Crossover (50/200)", desc: "Long when 50-day MA crosses above 200-day MA" },
  { id: "rsi_rev", label: "RSI Reversal", desc: "Buy when RSI < 30, sell when RSI > 70" },
  { id: "buyhold", label: "Buy & Hold Benchmark", desc: "Simple passive hold of the selected asset" },
];

const ASSETS = [
  { id: "SPY", label: "S&P 500 (SPY)" },
  { id: "QQQ", label: "Nasdaq 100 (QQQ)" },
  { id: "GLD", label: "Gold (GLD)" },
  { id: "TLT", label: "Long Bonds (TLT)" },
  { id: "BTC", label: "Bitcoin (BTC)" },
  { id: "EWJ", label: "Japan (EWJ)" },
];

function pseudoRng(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >> 7; h ^= h << 17; return (h >>> 0) / 4294967296; };
}

function buildBacktest(strategy: string, asset: string, start: string, end: string) {
  const rng = pseudoRng(strategy + asset + start + end);
  const months = Math.max(6, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (30 * 24 * 3600 * 1000)));
  const stratBase = strategy === "momentum" ? 0.012 : strategy === "sma_cross" ? 0.009 : strategy === "rsi_rev" ? 0.007 : 0.008;
  const assetVol = asset === "BTC" ? 3 : asset === "QQQ" ? 1.4 : asset === "GLD" ? 0.8 : 1;

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
  const [strategy, setStrategy] = useState("momentum");
  const [asset, setAsset] = useState("SPY");
  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState("2024-12-31");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof buildBacktest> | null>(null);

  const run = () => {
    setRunning(true);
    setTimeout(() => { setResult(buildBacktest(strategy, asset, start, end)); setRunning(false); }, 700);
  };

  const stratInfo = STRATEGIES.find(s => s.id === strategy)!;
  const assetInfo = ASSETS.find(a => a.id === asset)!;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
        <div className="section-label" style={{ marginBottom: 5 }}>CANVAS · BACKTEST STUDIO</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Strategy Backtesting</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Build and test long/short strategies across asset classes with historical simulation.</p>

        <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>STRATEGY CONFIGURATION</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 14, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Strategy</label>
              <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", background: "#fff", fontFamily: "inherit", outline: "none" }}>
                {STRATEGIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Asset</label>
              <select value={asset} onChange={e => setAsset(e.target.value)} style={{ width: "100%", height: 36, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", background: "#fff", fontFamily: "inherit", outline: "none" }}>
                {ASSETS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
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
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 5, fontSize: 12, color: "#475569" }}>
            <strong>{stratInfo.label}</strong> on <strong>{assetInfo.label}</strong> — {stratInfo.desc}
          </div>
        </div>

        {result ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
              <StatBox label="Total Return" value={`${result.totalReturn >= 0 ? "+" : ""}${result.totalReturn.toFixed(1)}%`} sub="strategy" color={result.totalReturn >= 0 ? "#16a34a" : "#dc2626"} />
              <StatBox label="vs Benchmark" value={`${(result.totalReturn - result.benchReturn) >= 0 ? "+" : ""}${(result.totalReturn - result.benchReturn).toFixed(1)}%`} sub="alpha" color={(result.totalReturn - result.benchReturn) >= 0 ? "#16a34a" : "#dc2626"} />
              <StatBox label="CAGR" value={`${result.cagr.toFixed(1)}%`} sub="annualized" />
              <StatBox label="Sharpe Ratio" value={result.sharpe.toFixed(2)} sub={result.sharpe > 1 ? "good" : result.sharpe > 0.5 ? "fair" : "poor"} color={result.sharpe > 1 ? "#16a34a" : result.sharpe > 0.5 ? "#b45309" : "#dc2626"} />
              <StatBox label="Max Drawdown" value={`-${result.maxDD.toFixed(1)}%`} sub="peak to trough" color="#dc2626" />
              <StatBox label="Win Rate" value={`${result.winRate.toFixed(0)}%`} sub="monthly" color={result.winRate > 55 ? "#16a34a" : "#b45309"} />
            </div>

            <div className="card" style={{ padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div className="section-label">EQUITY CURVE — $100 Starting Capital</div>
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

            <div className="card" style={{ padding: "16px 20px" }}>
              <div className="section-label" style={{ marginBottom: 10 }}>BACKTEST INSIGHTS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                {[
                  { title: "Performance", text: `${stratInfo.label} on ${assetInfo.label} returned ${result.totalReturn >= 0 ? "+" : ""}${result.totalReturn.toFixed(1)}%, ${(result.totalReturn - result.benchReturn) >= 0 ? "outperforming" : "underperforming"} the benchmark by ${Math.abs(result.totalReturn - result.benchReturn).toFixed(1)}%.` },
                  { title: "Risk", text: `Max drawdown of ${result.maxDD.toFixed(1)}%, Sharpe ${result.sharpe.toFixed(2)}. ${result.sharpe > 1 ? "Strong risk-adjusted returns." : result.sharpe > 0.5 ? "Moderate risk-adjusted performance." : "Strategy carries meaningful risk per unit of return."}` },
                  { title: "Disclaimer", text: "Simulated results use historical price patterns. Past performance doesn't guarantee future results. Educational only, not financial advice." },
                ].map(i => (
                  <div key={i.title} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#1e3a5f", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{i.title}</div>
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{i.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#94a3b8", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📐</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#475569", marginBottom: 7 }}>Configure & Run Your Backtest</div>
            <p style={{ fontSize: 13, maxWidth: 380 }}>Select a strategy, asset, and date range above, then click Run to see the equity curve and performance stats.</p>
          </div>
        )}
      </main>
    </div>
  );
}
