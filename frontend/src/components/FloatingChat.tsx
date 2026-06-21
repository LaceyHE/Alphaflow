"use client";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";

interface Message { role: "user" | "ai"; content: string }

const AI_RESPONSES = {
  en: {
    default: "Based on current data, capital is rotating into Technology (+10.5%) and out of Energy (-12.3%) this week. Risk-ON signal is active with SPX +1.77%. Japan leads regional flows (+6.6%). Want me to drill into any specific area?",
    sectors: "Top performing sectors: Technology (+10.5%), Financials (+4.2%), Healthcare (+2.8%). Underperforming: Energy (-12.3%), Utilities (-3.1%). The Tech rotation has been ongoing for 3 weeks — historically this signals continued momentum for 2-4 more weeks.",
    regions: "Japan (EWJ +6.6%) and India (INDA +4.1%) are seeing the strongest regional inflows. US markets are flat. China (MCHI -3.2%) continues to see outflows. Europe is mixed — Germany up, UK down.",
    risk: "Current risk sentiment: RISK-ON. VIX is below 20 (low fear). SPX trending up. Bond yields stable. DXY weakening = bullish for EM. The bull/bear composite is at +0.65, firmly in risk-on territory.",
    inflows: "Strongest inflows this week: (1) Technology +10.5%, (2) Japan +6.6%, (3) India +4.1%, (4) Financials +4.2%, (5) Gold +2.1%. The AI/semiconductor theme continues to dominate.",
  },
  zh: {
    default: "根据当前数据，本周资金正在流入科技板块（+10.5%），流出能源板块（-12.3%）。风险偏好信号激活，标普500上涨1.77%。日本在地区资金流入中领先（+6.6%）。需要深入了解某个特定领域吗？",
    sectors: "表现最好的板块：科技（+10.5%）、金融（+4.2%）、医疗（+2.8%）。表现最差：能源（-12.3%）、公用事业（-3.1%）。科技板块的轮动已持续3周——历史上这预示着动能将再持续2-4周。",
    regions: "日本（EWJ +6.6%）和印度（INDA +4.1%）的地区资金流入最强。美国市场持平。中国（MCHI -3.2%）持续流出。欧洲涨跌不一——德国上涨，英国下跌。",
    risk: "当前市场情绪：风险偏好。VIX低于20（恐慌度低）。标普500上升趋势。债券收益率稳定。美元走弱 = 新兴市场看涨。牛熊综合指数为+0.65，处于明确的风险偏好区间。",
    inflows: "本周最强资金流入：(1) 科技 +10.5%，(2) 日本 +6.6%，(3) 印度 +4.1%，(4) 金融 +4.2%，(5) 黄金 +2.1%。AI/半导体主题持续主导市场。",
  },
};

function getResponse(msg: string, lang: string): string {
  const responses = lang === "zh" ? AI_RESPONSES.zh : AI_RESPONSES.en;
  const lower = msg.toLowerCase();
  if (lower.includes("sector") || lower.includes("板块")) return responses.sectors;
  if (lower.includes("region") || lower.includes("country") || lower.includes("地区") || lower.includes("国家")) return responses.regions;
  if (lower.includes("risk") || lower.includes("sentiment") || lower.includes("风险") || lower.includes("情绪")) return responses.risk;
  if (lower.includes("inflow") || lower.includes("flow") || lower.includes("流入") || lower.includes("流向")) return responses.inflows;
  return responses.default;
}

export default function FloatingChat() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const SUGGESTED = [t("suggested1"), t("suggested2"), t("suggested3"), t("suggested4")];

  useEffect(() => {
    setMessages([{ role: "ai", content: t("chat_welcome") }]);
  }, [lang]);

  useEffect(() => {
    if (open) { setUnread(0); endRef.current?.scrollIntoView({ behavior: "smooth" }); }
  }, [open, messages]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    setTimeout(() => {
      const reply = getResponse(msg, lang);
      setMessages(prev => [...prev, { role: "ai", content: reply }]);
      setLoading(false);
      if (!open) setUnread(u => u + 1);
    }, 900);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 500,
          width: 52, height: 52, borderRadius: "50%",
          background: open ? "#334155" : "#1e3a5f",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(30,58,95,0.35)",
          transition: "background 0.15s, transform 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {unread > 0 && !open && (
          <span style={{
            position: "absolute", top: -2, right: -2, width: 18, height: 18,
            borderRadius: "50%", background: "#dc2626", color: "#fff",
            fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>{unread}</span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 86, right: 24, zIndex: 500,
          width: 340, borderRadius: 10,
          background: "#fff", border: "1px solid #e2e8f0",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", background: "#1e3a5f",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6, background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "#fff",
            }}>α</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t("chat_title")}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{t("chat_sub")}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            height: 300, overflowY: "auto", padding: "12px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
                {m.role === "ai" && (
                  <div style={{
                    width: 24, height: 24, borderRadius: 4, background: "#1e3a5f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: 2,
                  }}>α</div>
                )}
                <div style={{
                  maxWidth: "78%", borderRadius: 8, padding: "8px 11px", fontSize: 13, lineHeight: 1.55,
                  background: m.role === "user" ? "#1e3a5f" : "#f8fafc",
                  color: m.role === "user" ? "#fff" : "#0f172a",
                  border: m.role === "ai" ? "1px solid #e2e8f0" : "none",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: 4, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>α</div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#94a3b8", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i*0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggested prompts */}
          <div style={{ padding: "0 10px 8px", display: "flex", flexWrap: "wrap", gap: 5 }}>
            {SUGGESTED.slice(0, 3).map(s => (
              <button key={s} onClick={() => send(s)} style={{
                fontSize: 11, padding: "3px 9px", borderRadius: 20,
                background: "#eff6ff", border: "1px solid #93c5fd", color: "#1d4ed8",
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>{s}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "8px 10px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 6 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder={t("chat_placeholder")}
              style={{
                flex: 1, height: 36, padding: "0 10px",
                border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13,
                color: "#0f172a", outline: "none", fontFamily: "inherit", background: "#f8fafc",
              }}
            />
            <button onClick={() => send()} style={{
              width: 52, height: 36, borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: "#1e3a5f", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
              flexShrink: 0,
            }}>{t("chat_send")}</button>
          </div>
          <div style={{ padding: "4px 10px 8px", fontSize: 10, color: "#94a3b8", textAlign: "center" }}>
            {t("chat_powered")}
          </div>
        </div>
      )}
    </>
  );
}
