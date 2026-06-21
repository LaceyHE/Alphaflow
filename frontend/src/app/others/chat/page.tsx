"use client";
import { useState, useRef, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

interface Message { role: "user" | "ai"; content: string; ts: Date }

const SUGGESTED = [
  "What sectors are outperforming this week?",
  "Summarize the capital flow narrative for today",
  "Which regions have the strongest inflows?",
  "How does the current VIX level compare historically?",
  "Give me the best trade signals right now",
];

const RESPONSES: Record<string, string> = {
  default: "Based on current market data, capital is rotating strongly into Technology (+10.5%) and away from Energy (-12.3%) over the past week. The Risk-ON signal is active with SPX +1.77%. Japan leads regionally (+6.6%). Would you like me to drill into any specific area?",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AlphaFlow AI assistant. I can help you analyze capital flows, interpret market signals, and customize your daily flow report. What would you like to know?", ts: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg, ts: new Date() }]);
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: RESPONSES[msg] || RESPONSES.default, ts: new Date() }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", maxWidth: 900 }}>
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 3 }}>RESEARCH · AI ANALYSIS</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>AlphaFlow AI Assistant</h1>
          <p style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>Ask about capital flows, market signals, or customize your daily report</p>
        </div>

        {/* Suggestions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              fontSize: 11, padding: "5px 11px", borderRadius: 20,
              background: "#eff6ff", border: "1px solid #93c5fd", color: "#1d4ed8",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {s}
            </button>
          ))}
        </div>

        {/* Chat window */}
        <div className="card" style={{ flex: 1, padding: "16px", overflowY: "auto", marginBottom: 12, minHeight: 0, maxHeight: "calc(100vh - 340px)" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
              {m.role === "ai" && (
                <div style={{
                  width: 28, height: 28, borderRadius: 5, background: "#1e3a5f",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0, marginRight: 8, marginTop: 2,
                }}>α</div>
              )}
              <div style={{
                borderRadius: 8, padding: "10px 14px", maxWidth: 520,
                background: m.role === "user" ? "#1e3a5f" : "#f8fafc",
                border: `1px solid ${m.role === "user" ? "#1e3a5f" : "#e2e8f0"}`,
                fontSize: 13, color: m.role === "user" ? "#fff" : "#0f172a", lineHeight: 1.6,
              }}>
                {m.content}
                <div style={{ fontSize: 9, color: m.role === "user" ? "rgba(255,255,255,0.5)" : "#94a3b8", marginTop: 5 }}>
                  {m.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 5, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>α</div>
              <div className="card" style={{ padding: "10px 14px" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#64748b", animation: "bounce 1s infinite", animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about capital flows, sectors, or market signals…"
            style={{
              flex: 1, height: 40, padding: "0 14px",
              border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff",
              color: "#0f172a", fontSize: 13, outline: "none", fontFamily: "inherit",
            }}
          />
          <button onClick={() => send()} style={{
            height: 40, padding: "0 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
            background: "#1e3a5f", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
          }}>
            Send
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
          Phase 2: Connect Claude API (claude-haiku-4-5) for real AI responses · ~$5/month
        </div>
      </div>
    </div>
  );
}
