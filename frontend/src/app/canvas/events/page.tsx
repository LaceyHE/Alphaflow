"use client";
import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { useIsMobile } from "@/hooks/useIsMobile";

// ─────────────────────────────────────────────
// Event library (21 events)
// ─────────────────────────────────────────────
const EVENTS = [
  { id: "fed_hike",   cat: "Monetary Policy", label: "Fed Rate Hike Cycle",        date: "2022-03-16", summary: "First hike in current cycle. TLT -30%, SPX -18%, USD +15%, Gold -5% over 12m." },
  { id: "fed_cut",    cat: "Monetary Policy", label: "Fed Pivot / First Rate Cut",  date: "2024-09-18", summary: "Fed begins cutting. Bonds rally, USD softens, EM re-rates." },
  { id: "qe_covid",   cat: "Monetary Policy", label: "QE Infinity (Mar 2020)",      date: "2020-03-23", summary: "Unlimited QE + fiscal bazooka. Equities bottom, credit spreads compress, gold surges." },
  { id: "taper",      cat: "Monetary Policy", label: "Taper Tantrum (May 2013)",    date: "2013-05-22", summary: "Bernanke hints at taper. 10Y +100bps, EM currencies crash." },
  { id: "ukraine",    cat: "Geopolitical",    label: "Russia-Ukraine War",          date: "2022-02-24", summary: "Oil +40%, wheat +50%, Gold +8%, SPX -12%, EUR -5% in 30 days." },
  { id: "hamas",      cat: "Geopolitical",    label: "Israel-Hamas War",            date: "2023-10-07", summary: "Gold +8%, Oil +4%, Defense +10%. Limited broader macro impact vs Ukraine." },
  { id: "tariffs",    cat: "Geopolitical",    label: "US-China Tariff Escalation",  date: "2019-05-05", summary: "25% tariffs on $200B Chinese goods. SPX -6%, EEM -8%, CNY -2.5% in 2 weeks." },
  { id: "soleimani",  cat: "Geopolitical",    label: "US Kills Soleimani",          date: "2020-01-03", summary: "Oil +4%, Gold +1.5%. Brief risk-off; Middle East risk premium spiked short-term." },
  { id: "svb",        cat: "Credit Event",    label: "SVB Collapse",                date: "2023-03-10", summary: "Largest US bank failure since 2008. Regional banks -30%, TLT +5%, Gold +7%." },
  { id: "lehman",     cat: "Credit Event",    label: "Lehman Brothers Collapse",    date: "2008-09-15", summary: "GFC epicenter. SPX -38% over 5m, TLT +30%, Gold +30% over 6m." },
  { id: "cs",         cat: "Credit Event",    label: "Credit Suisse Crisis",        date: "2023-03-15", summary: "Emergency UBS takeover. European banks -10%, AT1 bonds wiped." },
  { id: "frc",        cat: "Credit Event",    label: "First Republic Collapse",     date: "2023-05-01", summary: "FDIC seizure after deposit flight. KRE -8%, JPM acquires at discount." },
  { id: "chatgpt",    cat: "Technology",      label: "ChatGPT Launch (Nov 2022)",   date: "2022-11-30", summary: "AI era begins. NVDA +400% over 12m, MSFT +30%, secular shift in tech." },
  { id: "nvda_ai",    cat: "Technology",      label: "NVDA AI Earnings Beat",       date: "2023-05-24", summary: "NVDA +25% in one session. SOXX +5%, AI/cloud re-rated across the board." },
  { id: "meta_pivot", cat: "Technology",      label: "Meta Layoffs / Efficiency",   date: "2022-11-09", summary: "11K jobs cut. Meta +20% on day. Triggered tech efficiency re-rating sector-wide." },
  { id: "election24", cat: "Political",       label: "2024 US Election",            date: "2024-11-05", summary: "Trump wins. BTC +40%, DXY +5%, SPX +4%, TLT -5%, renewables -10% on day." },
  { id: "brexit",     cat: "Political",       label: "Brexit Referendum",           date: "2016-06-23", summary: "Leave wins. GBP -8% overnight (biggest 1-day FX move in decades), SPX -3%." },
  { id: "election16", cat: "Political",       label: "2016 US Election",            date: "2016-11-08", summary: "Trump wins surprise. SPX +1%, banks +5%, gold -4%, MXN -8% overnight." },
  { id: "covid",      cat: "Black Swan",      label: "COVID Crash",                 date: "2020-02-20", summary: "SPX -34% in 33 days — fastest bear market ever. Gold +25%, Oil -60%." },
  { id: "flash",      cat: "Black Swan",      label: "Flash Crash (May 2010)",      date: "2010-05-06", summary: "Dow -1000 pts in minutes, recovered same day. Algo/market-structure risk exposed." },
  { id: "custom",     cat: "Custom",          label: "Custom Event",                date: "",           summary: "Enter your own event date and tickers below." },
];

// ─────────────────────────────────────────────
// Trade ideas per category
// ─────────────────────────────────────────────
interface TradeIdea { title: string; dir: "LONG" | "SHORT" | "SPREAD"; instrument: string; entry: string; thesis: string; risk: string; }

const TRADE_IDEAS: Record<string, TradeIdea[]> = {
  "Monetary Policy": [
    { title: "Short Duration Bonds",      dir: "SHORT",  instrument: "TLT / IEF / TBT",          entry: "T=0 or T+1",     thesis: "Rising rates mechanically compress bond prices. First hike signals a cycle — yields typically rise 150–300bps over following 12–18 months.", risk: "Stop if Fed pivots early or credit event triggers flight-to-quality." },
    { title: "Long USD vs EM FX",         dir: "LONG",   instrument: "UUP vs EEM or FXI spread",  entry: "T=0",            thesis: "Higher US rates attract USD flows; EM carry trades unwind as financing costs rise. DXY typically +8–15% in full hike cycles.", risk: "Dollar peak hard to time; China stimulus can override EM selloff." },
    { title: "TIPS vs Nominal Spread",    dir: "SPREAD", instrument: "SCHP (TIPS) vs TLT (nominal)", entry: "T+1 to T+5",  thesis: "If hiking in response to inflation, TIPS real yields compress less than nominal. Breakeven spread widens. Unwind when CPI peaks.", risk: "If hiking to fight sticky inflation, real yields can still rise significantly." },
  ],
  "Geopolitical": [
    { title: "Long Energy / Defense",     dir: "LONG",   instrument: "USO / XLE / ITA",           entry: "T=0 to T+3",     thesis: "Geopolitical disruptions reliably spike energy and defense re-rating. Oil +15–40% in first month is common; defense budgets re-rated on event.", risk: "Stop on ceasefire or peace talks — geopolitical spikes reverse 50% in days." },
    { title: "Gold vs SPX Spread",        dir: "SPREAD", instrument: "Long GLD / Short SPY",      entry: "T=0",            thesis: "Classic flight-to-safety: gold up 5–15%, equities down 5–20% in month 1. Spread peaks T+10 to T+20, then compresses as situation stabilizes.", risk: "If conflict stays contained (no macro disruption), SPX recovers faster than gold sustains." },
    { title: "Buy Equities at T+20",      dir: "LONG",   instrument: "SPY / QQQ",                 entry: "T+15 to T+20",   thesis: "Geopolitical risk premiums are transient for markets not directly affected. Historically SPX fully recovers within 30–60 days in non-domestic events.", risk: "Risk: Escalation or secondary economic shock (sanctions, energy crisis) extends drawdown." },
  ],
  "Credit Event": [
    { title: "Flight to Quality Spread",  dir: "SPREAD", instrument: "Long TLT/GLD, Short HYG",  entry: "T=0 to T+1",     thesis: "Treasuries and gold spike on capital flight; high-yield credit spreads blow out 100–300bps. Spread captures both legs simultaneously.", risk: "Unwind quickly — Fed backstop announcements can reverse the spread within hours." },
    { title: "Short Sector Contagion",    dir: "SHORT",  instrument: "KRE / sector peer ETF",    entry: "T+1",             thesis: "Contagion fear hits similar institutions before facts are known. Regional bank ETFs typically -20–35% in days after peer failure.", risk: "Cover on FDIC/Treasury backstop announcement. Don't overstay the short." },
    { title: "Buy Quality Financials",    dir: "LONG",   instrument: "JPM / BAC (not broad ETF)", entry: "T+15 to T+20",   thesis: "High-quality banks often acquire failed peers at steep discounts. JPM bought WaMu (2008) and FRC (2023) — each time its stock outperformed the sector.", risk: "Systemic crisis (2008-style): wait for Fed policy response before entering long." },
  ],
  "Technology": [
    { title: "Long AI Infrastructure",   dir: "LONG",   instrument: "NVDA / SMCI / AMD",         entry: "T+1 to T+5",     thesis: "AI catalyst creates years-long demand pull for compute. Hardware is 'picks and shovels' with near-term revenue visibility. Buy the post-news dip.", risk: "Valuation rich; model commoditization or regulatory crackdown compresses multiples." },
    { title: "Long Productivity Software", dir: "LONG", instrument: "MSFT / CRM / NOW",          entry: "T+3 to T+10",    thesis: "AI embeds into enterprise software — features justify price increases and boost retention. Monetization is 12–24m behind the hardware trade.", risk: "Enterprise adoption slower than expected; AI pricing power oversold near-term." },
    { title: "Short Legacy / Disrupted", dir: "SHORT",  instrument: "IBM / legacy database stacks", entry: "T+5 to T+15", thesis: "AI disruption accelerates obsolescence of legacy models. Not overnight — price in 12–24m underperformance vs high-growth AI peers as budgets shift.", risk: "Enterprise switching costs (moats) can delay the impact 2–3 years. Use small size." },
  ],
  "Political": [
    { title: "Policy Sector Rotation",   dir: "LONG",   instrument: "ITA/XLE (hawkish) or ICLN/LIT (progressive)", entry: "T=0 to T+1", thesis: "Election outcome sets 4-year policy priorities. Identify the winning administration's spending priorities and front-run sector re-rating.", risk: "Political promises vs. legislative reality diverge — policy trades fade within 6–12m." },
    { title: "Long Bitcoin (Crypto-Friendly Win)", dir: "LONG", instrument: "BTC / BITO / MSTR", entry: "T=0",  thesis: "Regulatory clarity drives crypto re-rating. 2024 election sent BTC +40% in 30 days on expectations of favorable treatment; spot ETF flows amplify moves.", risk: "Executive order reversals and Congressional gridlock can delay regulatory clarity." },
    { title: "USD Sell the News",        dir: "SPREAD", instrument: "DXY long pre-result, short post T+1", entry: "Sell T+1 to T+3", thesis: "Election uncertainty drives safe-haven USD pre-vote. Once result is known, uncertainty premium unwinds regardless of winner. Classic 'sell the news' setup.", risk: "If result triggers paradigm policy shift, post-election USD direction overrides the trade." },
  ],
  "Black Swan": [
    { title: "Buy Equity Crash at VIX Spike", dir: "LONG", instrument: "SPY / QQQ on VIX > 35", entry: "T+10 to T+20",   thesis: "VIX > 35 has historically marked equity bottoms (90%+ hit rate since 1990). Have dry powder ready. Forward 12m returns after VIX spike average +30%.", risk: "2008-level systemic crisis: T+20 can still be a bear rally. Wait for Fed response signal." },
    { title: "Long Gold, Short Oil",     dir: "SPREAD", instrument: "Long GLD, Short USO",       entry: "T=0",            thesis: "Demand destruction hits cyclical commodities (oil) while fear premium drives gold. Spread typically widens 15–30% in first month.", risk: "Supply disruption in oil-producing region prevents the short oil leg from working." },
    { title: "Short HY, Long IG Credit", dir: "SPREAD", instrument: "Short HYG, Long LQD",      entry: "T=0 to T+3",     thesis: "Credit quality flight: HY spreads blow out 500–800bps; IG spreads widen only 100–150bps. Quality spread trade: enter on widening, exit on Fed-driven tightening.", risk: "Fed buying HY directly (as in 2020) closes the spread before you can exit profitably." },
  ],
  "Custom": [
    { title: "Read T+1 Direction First", dir: "LONG",   instrument: "Observe T+1 move before acting", entry: "T+1 to T+3", thesis: "For custom events, first determine if the shock is risk-on or risk-off. SPX negative + gold/TLT positive = flight to safety. SPX positive = regime change or catalyst.", risk: "Don't pre-position before the data speaks. Wait for T+1 close to confirm direction." },
    { title: "Fade Extreme Spike > 3σ",  dir: "SPREAD", instrument: "Fade the extreme mover vs less-affected asset", entry: "T+3 to T+5", thesis: "Moves > 3σ in a single event day have a 65%+ mean reversion rate within 10 trading days. Spread the extreme mover against a correlated, less-affected asset.", risk: "If event is a fundamental regime change (not just sentiment), mean reversion fails completely." },
  ],
};

const ASSET_COLORS = ["#1e3a5f", "#16a34a", "#dc2626", "#b45309", "#7c3aed"];
const CATS = ["All", "Monetary Policy", "Geopolitical", "Credit Event", "Technology", "Political", "Black Swan"];
const STAT_POINTS = [-10, -5, -1, 0, 1, 3, 5, 10, 20, 30] as const;

const MULT: Record<string, number[]> = {
  ukraine: [1.8, -1.1, 0.9, -0.6], fed_hike: [-1.5, 0.4, -0.9, 0.7],
  svb: [-0.9, 0.8, -0.7, 0.5], chatgpt: [2.1, 0.3, 1.4, -0.2],
  election24: [0.8, -0.4, 1.5, -0.6], covid: [-2.8, 1.4, -1.2, 0.8],
  lehman: [-2.2, 1.8, -1.6, 1.2], brexit: [-1.4, 0.9, -0.8, 0.6],
};
const DAYS = [-20, -15, -10, -5, -3, -1, 0, 1, 3, 5, 10, 15, 20, 30];

function makeIllustrative(eventId: string, tickers: string[]) {
  const mults = MULT[eventId] ?? [1, -0.6, 0.5, -0.3];
  return DAYS.map((d, i) => {
    const pt: Record<string, any> = { label: d === 0 ? "Event" : `T${d >= 0 ? "+" : ""}${d}`, day: d };
    tickers.forEach((t, ti) => {
      const m = mults[ti % mults.length] ?? 1;
      const shock = d >= 0 ? 1 : 0;
      const drift = Math.max(0, d) / 30;
      const noise = Math.sin(i * (2.3 + ti * 0.4) + 1 + ti) * 0.35;
      pt[t] = +(m * (shock * 2.5 + drift * 3 + noise)).toFixed(2);
    });
    return pt;
  });
}

function derivePattern(series: any[], tickers: string[]): string {
  const at = (label: string) => series.find((s: any) => s.label === label);
  const t1 = at("T+1"); const t10 = at("T+10"); const t30 = at("T+30");
  if (!t1 || !t10) return "";
  const avg1 = tickers.reduce((s, t) => s + (t1[t] ?? 0), 0) / tickers.length;
  const avg10 = tickers.reduce((s, t) => s + (t10[t] ?? 0), 0) / tickers.length;
  const avg30 = t30 ? tickers.reduce((s, t) => s + (t30[t] ?? 0), 0) / tickers.length : avg10;
  const at10vals = tickers.map(t => t10[t] ?? 0);
  const hasOpposite = at10vals.some(v => v > 2) && at10vals.some(v => v < -2);
  if (hasOpposite) return "Flight to Safety";
  if (avg1 < -2 && avg10 > avg1 + 3) return "Shock & Recover";
  if (Math.abs(avg1) > 1 && Math.sign(avg1) === Math.sign(avg30)) return "Regime Change";
  if (avg1 > 0 && avg30 < avg1 - 2) return "Buy the News / Fade";
  return "Mixed / Unclear";
}

function ChartTT({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 5, padding: "9px 13px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", minWidth: 150 }}>
      <div style={{ fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 10, color: p.value >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span>{p.value >= 0 ? "+" : ""}{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  const isMobile = useIsMobile();
  const [catFilter, setCatFilter] = useState("All");
  const [selEvent, setSelEvent] = useState("ukraine");
  const [customName, setCustomName] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [tickers, setTickers] = useState(["SPY", "TLT", "GLD"]);
  const [tickerInput, setTickerInput] = useState("");
  const [liveData, setLiveData] = useState<{ series: any[]; tickers: string[]; t0Prices: Record<string, number>; eventDate: string } | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const isCustom = selEvent === "custom";
  const event = EVENTS.find(e => e.id === selEvent)!;
  const activeDate = isCustom ? customDate : event.date;

  useEffect(() => {
    setNotes(localStorage.getItem(`af_event_notes_${selEvent}`) ?? "");
  }, [selEvent]);

  useEffect(() => {
    if (!activeDate) { setLiveData(null); setLiveError(null); return; }
    setLiveLoading(true); setLiveError(null);
    fetch(`/api/event-study?tickers=${tickers.join(",")}&eventDate=${activeDate}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setLiveError(d.error); setLiveData(null); } else setLiveData(d); })
      .catch(e => { setLiveError(e.message); setLiveData(null); })
      .finally(() => setLiveLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDate, tickers.join(",")]);

  const chartData = liveData?.series ?? makeIllustrative(isCustom ? "ukraine" : selEvent, tickers);
  const isLive = !!liveData;
  const pattern = isLive ? derivePattern(chartData, tickers) : "";
  const tradeIdeas = TRADE_IDEAS[event.cat] ?? TRADE_IDEAS["Custom"];
  const filteredEvents = EVENTS.filter(e => catFilter === "All" || e.cat === catFilter);

  function addTicker() {
    const t = tickerInput.trim().toUpperCase();
    if (!t || tickers.includes(t) || tickers.length >= 5) return;
    setTickers(prev => [...prev, t]);
    setTickerInput("");
    setLiveData(null);
  }

  function removeTicker(t: string) {
    if (tickers.length <= 1) return;
    setTickers(prev => prev.filter(x => x !== t));
    setLiveData(null);
  }

  function getStatVal(ticker: string, day: number): number | null {
    if (!liveData) return null;
    const label = day === 0 ? "Event" : `T${day >= 0 ? "+" : ""}${day}`;
    const pt = liveData.series.find(s => s.label === label);
    return pt ? (pt[ticker] ?? null) : null;
  }

  const DIR_STYLE: Record<string, { bg: string; color: string }> = {
    LONG:   { bg: "#f0fdf4", color: "#16a34a" },
    SHORT:  { bg: "#fef2f2", color: "#dc2626" },
    SPREAD: { bg: "#eff6ff", color: "#1d4ed8" },
  };
  const PATTERN_COLOR: Record<string, string> = {
    "Shock & Recover": "#16a34a", "Regime Change": "#1d4ed8",
    "Flight to Safety": "#7c3aed", "Buy the News / Fade": "#b45309", "Mixed / Unclear": "#64748b",
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main className="page-content">
        <div className="section-label" style={{ marginBottom: 5 }}>CANVAS · EVENT STUDY</div>
        <h1 style={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>Event-Driven Analysis</h1>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
          Multi-asset price reaction around major macro events · Up to 5 assets · Trade ideas per pattern · Live data via Yahoo Finance
        </p>

        {/* Category filter + event selector */}
        <div className="card" style={{ padding: "18px 20px", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: "4px 11px", fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                borderRadius: 20, border: `1px solid ${catFilter === c ? "#1e3a5f" : "#e2e8f0"}`,
                background: catFilter === c ? "#1e3a5f" : "#fff", color: catFilter === c ? "#fff" : "#64748b",
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
            {filteredEvents.map(e => (
              <button key={e.id} onClick={() => { setSelEvent(e.id); setLiveData(null); }} style={{
                padding: "10px 12px", border: `1.5px solid ${selEvent === e.id ? "#1e3a5f" : "#e2e8f0"}`,
                borderRadius: 7, textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit",
                background: selEvent === e.id ? "#eff6ff" : "#fafafa",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: selEvent === e.id ? "#1e3a5f" : "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>{e.cat}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>{e.label}</div>
                {e.date && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontFamily: "monospace" }}>{e.date}</div>}
              </button>
            ))}
          </div>
          {isCustom ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Event Name",      val: customName,    set: setCustomName,    ph: "e.g. China Stimulus (Sep 2024)", type: "text" },
                { label: "Event Date",      val: customDate,    set: (v: string) => { setCustomDate(v); setLiveData(null); }, ph: "", type: "date" },
                { label: "Reactions Memo",  val: customSummary, set: setCustomSummary, ph: "e.g. MCHI +15%, Gold -2%",       type: "text" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    style={{ width: "100%", height: 34, padding: "0 10px", border: "1px solid #e2e8f0", borderRadius: 5, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "9px 12px", background: "#f8fafc", borderRadius: 6, fontSize: 12, color: "#475569" }}>
              <strong>{event.label}</strong> — {event.summary}
            </div>
          )}
        </div>

        {/* Asset selector */}
        <div className="card" style={{ padding: "12px 18px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="section-label">ASSETS</span>
            {tickers.map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 8px 3px 10px", background: "#f8fafc", border: `1.5px solid ${ASSET_COLORS[i]}33`, borderRadius: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: ASSET_COLORS[i], display: "inline-block" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: ASSET_COLORS[i], fontFamily: "monospace", marginLeft: 4 }}>{t}</span>
                {tickers.length > 1 && (
                  <button onClick={() => removeTicker(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 15, padding: "0 0 0 4px", lineHeight: 1 }}>×</button>
                )}
              </div>
            ))}
            {tickers.length < 5 && (
              <div style={{ display: "flex", gap: 4 }}>
                <input value={tickerInput} onChange={e => setTickerInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && addTicker()}
                  placeholder="+ Add ticker" style={{ height: 28, padding: "0 8px", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 12, fontFamily: "monospace", outline: "none", width: 110 }} />
                <button onClick={addTicker} style={{ height: 28, padding: "0 10px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>Add</button>
              </div>
            )}
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>Max 5 · Enter to add</span>
          </div>
        </div>

        {/* Chart */}
        <div className="card" style={{ padding: "18px 20px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>CUMULATIVE % RETURN · Trading Days vs T=0</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {liveLoading && <span style={{ fontSize: 11, color: "#1e3a5f", fontWeight: 600 }}>⟳ Loading…</span>}
                {!liveLoading && isLive && <span style={{ fontSize: 10, fontWeight: 700, background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 20, border: "1px solid #86efac" }}>LIVE · Yahoo Finance</span>}
                {!liveLoading && !isLive && <span style={{ fontSize: 10, fontWeight: 700, background: "#fffbeb", color: "#b45309", padding: "2px 8px", borderRadius: 20, border: "1px solid #fcd34d" }}>ILLUSTRATIVE</span>}
                {isLive && pattern && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: `1px solid ${(PATTERN_COLOR[pattern] ?? "#64748b")}44`, background: `${(PATTERN_COLOR[pattern] ?? "#64748b")}11`, color: PATTERN_COLOR[pattern] ?? "#64748b" }}>
                    Pattern: {pattern}
                  </span>
                )}
                {liveError && <span style={{ fontSize: 11, color: "#dc2626" }}>⚠ {liveError}</span>}
                {isLive && liveData && (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {tickers.map(t => `${t} $${liveData.t0Prices[t] ?? "—"}`).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ opacity: liveLoading ? 0.45 : 1, transition: "opacity 0.25s" }}>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 310}>
              <LineChart data={chartData} margin={{ top: 4, right: 14, bottom: 4, left: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v: number) => `${v >= 0 ? "+" : ""}${v}%`} domain={["auto", "auto"]} />
                <Tooltip content={<ChartTT />} />
                <ReferenceLine x="Event" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="3 3" label={{ value: "T=0", position: "top", fontSize: 9, fill: "#dc2626" }} />
                <ReferenceLine y={0} stroke="#e2e8f0" />
                {tickers.map((t, i) => (
                  <Line key={t} type="monotone" dataKey={t} name={t} stroke={ASSET_COLORS[i]} strokeWidth={i === 0 ? 2.5 : 2} dot={false} strokeDasharray={i === 0 ? undefined : i % 2 === 1 ? "5 3" : "2 2"} />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key stats table — only shown with live data */}
        {isLive && (
          <div className="card" style={{ overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0" }}>
              <div className="section-label" style={{ marginBottom: 2 }}>KEY STATS SNAPSHOT · % Return at Each Horizon</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Indexed to T=0 event close · Color intensity = magnitude</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ minWidth: 620 }}>
                <thead>
                  <tr>
                    <th>Ticker</th>
                    {STAT_POINTS.map(d => (
                      <th key={d} className="right" style={{ fontSize: 10 }}>{d === 0 ? "EVENT" : `T${d >= 0 ? "+" : ""}${d}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickers.map((t, ti) => (
                    <tr key={t}>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: ASSET_COLORS[ti], display: "inline-block" }} />
                          <strong style={{ fontFamily: "monospace", color: ASSET_COLORS[ti] }}>{t}</strong>
                          {liveData?.t0Prices[t] && <span style={{ fontSize: 11, color: "#94a3b8" }}>${liveData.t0Prices[t]}</span>}
                        </span>
                      </td>
                      {STAT_POINTS.map(d => {
                        const v = getStatVal(t, d);
                        if (v === null) return <td key={d} className="right" style={{ color: "#94a3b8" }}>—</td>;
                        const intensity = Math.min(Math.abs(v) / 15, 1);
                        const bg = v > 0 ? `rgba(22,163,74,${0.06 + intensity * 0.16})` : v < 0 ? `rgba(220,38,38,${0.06 + intensity * 0.16})` : "transparent";
                        return (
                          <td key={d} className="right" style={{ background: bg, color: v > 0 ? "#16a34a" : v < 0 ? "#dc2626" : "#64748b", fontWeight: Math.abs(v) > 4 ? 700 : 500 }}>
                            {v >= 0 ? "+" : ""}{v}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trade Ideas */}
        <div className="section-label" style={{ marginBottom: 10 }}>TRADE IDEAS · {event.cat.toUpperCase()}</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
          {tradeIdeas.map((idea, i) => {
            const ds = DIR_STYLE[idea.dir];
            return (
              <div key={i} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{idea.title}</div>
                  <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 3, background: ds.bg, color: ds.color, letterSpacing: "0.05em" }}>{idea.dir}</span>
                </div>
                <div style={{ marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#1e3a5f", fontWeight: 700, background: "#eff6ff", padding: "2px 8px", borderRadius: 4 }}>{idea.instrument}</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}><strong style={{ color: "#475569" }}>Entry:</strong> {idea.entry}</div>
                <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.6, marginBottom: 8 }}>{idea.thesis}</p>
                <div style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", borderRadius: 4, padding: "5px 9px", borderLeft: "2px solid #fcd34d" }}>
                  <strong>Risk:</strong> {idea.risk}
                </div>
              </div>
            );
          })}
        </div>

        {/* Analyst notes */}
        <div className="card" style={{ padding: "16px 18px" }}>
          <div className="section-label" style={{ marginBottom: 8 }}>ANALYST NOTES · {isCustom ? (customName || "Custom Event") : event.label}</div>
          <textarea value={notes}
            onChange={e => { setNotes(e.target.value); localStorage.setItem(`af_event_notes_${selEvent}`, e.target.value); }}
            placeholder="Record your thesis, observations, position sizing, or follow-up questions. Auto-saved per event."
            style={{ width: "100%", minHeight: 100, padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontFamily: "inherit", lineHeight: 1.6, resize: "vertical", outline: "none", color: "#334155", background: "#fafafa", boxSizing: "border-box" as const }} />
          {notes && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Auto-saved to local storage</div>}
        </div>
      </main>
    </div>
  );
}
