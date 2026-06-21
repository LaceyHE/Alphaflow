"use client";
import { useState } from "react";
import Link from "next/link";

const TOOLS = [
  { href: "/canvas", label: "Backtest Studio", icon: "📐", desc: "Long/short strategy backtesting with custom baskets" },
  { href: "/canvas/events", label: "Event-Driven", icon: "⚡", desc: "How assets move before/after macro events (wars, elections, rate hikes)" },
  { href: "/canvas/seasonal", label: "Seasonal Patterns", icon: "📅", desc: "Last 12-month average monthly returns + election year patterns" },
];

export default function CanvasPage() {
  const [ticker, setTicker] = useState("SPY,QQQ,GLD");
  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [long, setLong] = useState("SPY,QQQ");
  const [short, setShort] = useState("TLT,GLD");

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1300, margin: "0 auto", marginLeft: 192 }}>
      <div className="section-label mb-1">CANVAS · BACKTEST STUDIO</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Strategy Backtesting</h1>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 24 }}>
        Build long/short baskets and run historical backtests
      </p>

      {/* Tool links */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {TOOLS.map(t => (
          <Link key={t.href} href={t.href}
            className="glass rounded-xl p-4 hover-lift transition-all block"
            style={{ borderColor: t.href === "/canvas" ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{t.label}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>{t.desc}</div>
          </Link>
        ))}
      </div>

      {/* Backtest form */}
      <div className="glass p-6 mb-5">
        <div className="section-label mb-5">BACKTEST CONFIGURATION</div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Long Basket (tickers, comma-separated)
            </label>
            <input
              value={long}
              onChange={e => setLong(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
              placeholder="SPY, QQQ, NVDA..."
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Short Basket
            </label>
            <input
              value={short}
              onChange={e => setShort(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9" }}
              placeholder="TLT, GLD, VIX..."
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>From</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9", colorScheme: "dark" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>To</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f1f5f9", colorScheme: "dark" }} />
          </div>
        </div>
        <button
          className="mt-6 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg, #3b82f6, #22d3ee)", color: "#000", fontWeight: 700 }}
        >
          Run Backtest
        </button>
        <div className="mt-4 rounded-lg p-4 text-sm" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", color: "#64748b" }}>
          💡 Backtest engine coming in Phase 2. Will use Yahoo Finance historical data via yfinance for free backtesting up to 20 years.
        </div>
      </div>
    </div>
  );
}
