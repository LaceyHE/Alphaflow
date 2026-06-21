"use client";
import { useState, useRef, useEffect, useCallback } from "react";
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

const RobotIcon = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
    {/* Antenna */}
    <line x1="16" y1="2" x2="16" y2="7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="2" r="1.5" fill="#7dd3fc"/>
    {/* Head */}
    <rect x="6" y="7" width="20" height="14" rx="3" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth="1.5"/>
    {/* Eyes */}
    <circle cx="11.5" cy="13" r="2.5" fill="#7dd3fc"/>
    <circle cx="20.5" cy="13" r="2.5" fill="#7dd3fc"/>
    <circle cx="11.5" cy="13" r="1" fill="#1e3a5f"/>
    <circle cx="20.5" cy="13" r="1" fill="#1e3a5f"/>
    {/* Mouth */}
    <rect x="11" y="17" width="10" height="2" rx="1" fill="#7dd3fc"/>
    {/* Body */}
    <rect x="9" y="22" width="14" height="8" rx="2" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.2"/>
    {/* Ears */}
    <rect x="3" y="10" width="3" height="5" rx="1" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1"/>
    <rect x="26" y="10" width="3" height="5" rx="1" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1"/>
  </svg>
);

export default function FloatingChat() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [pos, setPos] = useState({ x: 24, y: 24 }); // distance from bottom-right
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (open) return; // don't drag when panel is open
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y };
    e.preventDefault();
  }, [open, pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setPos({
        x: Math.max(8, dragStart.current.x - dx),
        y: Math.max(8, dragStart.current.y - dy),
      });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const SUGGESTED = [t("suggested1"), t("suggested2"), t("suggested3"), t("suggested4")];

  useEffect(() => {
    setMessages([{ role: "ai", content: t("chat_welcome") }]);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

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
        onMouseDown={onMouseDown}
        onClick={() => setOpen(o => !o)}
        title="AI Flow Assistant"
        style={{
          position: "fixed",
          bottom: pos.y, right: pos.x, zIndex: 500,
          width: 58, height: 58, borderRadius: "50%",
          background: open ? "#334155" : "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          border: "2px solid rgba(255,255,255,0.25)",
          cursor: dragging.current ? "grabbing" : "grab",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(30,58,95,0.45), 0 0 0 3px rgba(37,99,235,0.15)",
          transition: "box-shadow 0.15s, transform 0.15s",
          userSelect: "none",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <RobotIcon />
        )}
        {unread > 0 && !open && (
          <span style={{
            position: "absolute", top: -3, right: -3, width: 20, height: 20,
            borderRadius: "50%", background: "#dc2626", color: "#fff",
            fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff", animation: "pulse-ring 1.5s ease-out infinite",
          }}>{unread}</span>
        )}
        {/* Tooltip label */}
        {!open && (
          <span style={{
            position: "absolute", right: 64, top: "50%", transform: "translateY(-50%)",
            background: "#1e3a5f", color: "#fff", fontSize: 12, fontWeight: 600,
            padding: "5px 10px", borderRadius: 6, whiteSpace: "nowrap",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)", pointerEvents: "none",
            opacity: 0, transition: "opacity 0.2s",
          }} className="chat-tooltip">
            AI Flow Assistant
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: pos.y + 68, right: pos.x, zIndex: 500,
          width: 340, borderRadius: 12,
          background: "#fff", border: "1px solid #e2e8f0",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <RobotIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t("chat_title")}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>{t("chat_sub")}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
          </div>

          {/* Messages */}
          <div style={{ height: 300, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
                {m.role === "ai" && (
                  <div style={{ width: 26, height: 26, borderRadius: 5, background: "linear-gradient(135deg,#1e3a5f,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                      <rect x="6" y="7" width="20" height="14" rx="3" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="1.5"/>
                      <circle cx="11.5" cy="13" r="2" fill="#7dd3fc"/><circle cx="20.5" cy="13" r="2" fill="#7dd3fc"/>
                    </svg>
                  </div>
                )}
                <div style={{
                  maxWidth: "78%", borderRadius: 8, padding: "8px 11px", fontSize: 13, lineHeight: 1.55,
                  background: m.role === "user" ? "linear-gradient(135deg,#1e3a5f,#2563eb)" : "#f8fafc",
                  color: m.role === "user" ? "#fff" : "#0f172a",
                  border: m.role === "ai" ? "1px solid #e2e8f0" : "none",
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: 5, background: "linear-gradient(135deg,#1e3a5f,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 32 32" fill="none"><rect x="6" y="7" width="20" height="14" rx="3" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="1.5"/><circle cx="11.5" cy="13" r="2" fill="#7dd3fc"/><circle cx="20.5" cy="13" r="2" fill="#7dd3fc"/></svg>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#94a3b8", animation: `pulse ${1.2 + i*0.1}s ease-in-out infinite`, animationDelay: `${i*0.2}s` }} />)}
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
              background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff",
              border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}>{t("chat_send")}</button>
          </div>
          <div style={{ padding: "4px 10px 8px", fontSize: 10, color: "#94a3b8", textAlign: "center" }}>
            {t("chat_powered")}
          </div>
        </div>
      )}

      <style>{`
        button:hover .chat-tooltip { opacity: 1 !important; }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.5); }
          70% { box-shadow: 0 0 0 6px rgba(220,38,38,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
      `}</style>
    </>
  );
}
