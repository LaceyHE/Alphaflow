"use client";
import { useEffect, useState } from "react";
import { api, type NarrativeData } from "@/lib/api";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DailyReportPage() {
  const [data, setData] = useState<NarrativeData | null>(null);
  const [filter, setFilter] = useState("All");
  const [customPrompt, setCustomPrompt] = useState("");

  useEffect(() => {
    api.narrative("7D").then(setData).catch(console.error);
  }, []);

  const sections = [
    { key: "All", label: "Full Report" },
    { key: "Equity", label: "Equities" },
    { key: "Macro", label: "Macro" },
    { key: "Crypto", label: "Crypto" },
  ];

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const bull = data?.bull_bear === "bull";

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div className="page-content" style={{ maxWidth: 900 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 3 }}>RESEARCH · DAILY FLOW REPORT</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Daily Flow Report</h1>
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>{today}</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {sections.map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)} className={`tf-btn${filter === s.key ? " active" : ""}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Report header */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>AlphaFlow Daily Flow Report</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{today} · Auto-generated</div>
            </div>
          </div>
          {data && (
            <span className={`badge ${bull ? "badge-up" : "badge-down"}`}>
              {bull ? "🐂 BULL · Risk ON" : "🐻 BEAR · Risk OFF"}
            </span>
          )}
        </div>

        {/* Flow summary */}
        {data && (
          <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>FLOW SUMMARY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.lines.map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", background: "#eff6ff",
                    border: "1px solid #93c5fd", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "#1d4ed8", flexShrink: 0, marginTop: 1,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trade signals */}
        {data && (
          <div className="card" style={{ padding: "16px 20px", marginBottom: 12 }}>
            <div className="section-label" style={{ marginBottom: 12 }}>TRADE SIGNALS TODAY</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { icon: "🔥", label: "Most Crowded", item: data.signals.most_crowded },
                { icon: "❄️", label: "Most Hated", item: data.signals.most_hated },
                { icon: "🚀", label: "Emerging", item: data.signals.emerging },
              ].map(({ icon, label, item }) => (
                <div key={label} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 5, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 16, marginBottom: 6 }}>{icon}</div>
                  <div className="section-label" style={{ marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{item.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.change >= 0 ? "#16a34a" : "#dc2626", marginTop: 3, fontVariantNumeric: "tabular-nums" }}>
                    {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customize */}
        <div className="card" style={{ padding: "16px 20px" }}>
          <div className="section-label" style={{ marginBottom: 6 }}>CUSTOMIZE YOUR REPORT (AI)</div>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
            Tell me what you want to focus on and I'll generate a custom daily report
          </p>
          <input
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="e.g. Focus on AI stocks and China macro, skip crypto..."
            style={{
              width: "100%", height: 36, padding: "0 12px", marginBottom: 10,
              border: "1px solid #e2e8f0", borderRadius: 5, background: "#f8fafc",
              color: "#0f172a", fontSize: 12, outline: "none", fontFamily: "inherit",
            }}
          />
          <button style={{
            padding: "6px 16px", borderRadius: 5, fontSize: 12, fontWeight: 600,
            background: "#1e3a5f", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
          }}>
            Generate Custom Report
          </button>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
            Full AI customization via Claude API in Phase 2
          </div>
        </div>
      </div>
    </div>
  );
}
