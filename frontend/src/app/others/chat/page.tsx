"use client";
import { useState, useRef, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useLang } from "@/contexts/LangContext";

interface Message { role: "user" | "ai"; content: string; ts: Date }

const SUGGESTED_EN = [
  "What sectors are outperforming this week?",
  "Which regions have the strongest inflows?",
  "How does current VIX compare historically?",
  "Summarize the capital flow narrative",
  "What are the best trade signals right now?",
  "Is this a bull or bear market environment?",
];

const SUGGESTED_ZH = [
  "哪些板块本周表现最好？",
  "哪些地区资金流入最强？",
  "目前VIX与历史相比如何？",
  "总结当前资金流向趋势",
  "现在最佳交易信号是什么？",
  "当前是牛市还是熊市环境？",
];

const RESPONSES_EN: string[] = [
  "Based on current flow data, Technology (+12.3%) and Financials (+8.1%) are seeing the strongest sector inflows this week. Energy is the biggest laggard at -6.2%. The rotation appears driven by improving rate expectations and strong AI spending narratives.",
  "US leads regionally at +2.1%, followed by Japan (+1.8%) on yen weakness. China is the notable underperformer at -3.4% amid property sector concerns. Emerging markets overall are mixed.",
  "VIX is currently at 13.8, below the long-term average of ~20. Historically, sub-15 VIX environments have preceded strong equity performance — the market is pricing in relatively low near-term volatility.",
  "Capital is rotating from defensive sectors (Utilities, Bonds) into risk assets (Tech, Financials). The 7D narrative shows a clear Risk-ON environment with SPX up 1.8%. Institutional flows suggest continued momentum.",
  "Key signals: Most Crowded = Technology (trend following), Most Hated = Real Estate (rate sensitive), Emerging = Japan (structural inflow). Risk regime: BULL. Recommended posture: overweight growth, underweight duration.",
  "Currently in a BULL regime — SPX above 200-day MA, VIX below 20, breadth positive. Key risks: Fed pivot timing, China slowdown, credit spreads. Sector rotation suggests late-cycle characteristics with Tech leading.",
];

const RESPONSES_ZH: string[] = [
  "根据当前流向数据，科技板块(+12.3%)和金融板块(+8.1%)本周资金流入最强。能源是最大落后者，下跌6.2%。此轮轮动似乎受利率预期改善和AI支出叙事驱动。",
  "美国地区以+2.1%领涨，其次是受日元贬值支撑的日本(+1.8%)。中国因房地产板块问题表现落后，下跌3.4%。新兴市场整体表现参差不齐。",
  "VIX目前为13.8，低于约20的长期平均水平。历史上，VIX低于15的环境通常先于股票强势表现——市场正在定价相对较低的近期波动性。",
  "资金正从防御性板块(公用事业、债券)轮动至风险资产(科技、金融)。7日叙事显示明显的风险偏好环境，SPX上涨1.8%。机构资金流向表明动能将持续。",
  "主要信号：最拥挤=科技(趋势跟随)，最冷门=房地产(利率敏感)，新兴=日本(结构性流入)。风险机制：牛市。建议持仓：超配成长，减配久期。",
  "目前处于牛市机制——SPX高于200日均线，VIX低于20，市场广度积极。主要风险：美联储转向时机、中国经济放缓、信用利差。板块轮动显示科技引领的晚周期特征。",
];

export default function ChatPage() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: lang === "zh"
        ? "你好！我是 AlphaFlow AI 助手。我可以帮你分析资金流向、解读市场信号，以及定制你的每日流向报告。你想了解什么？"
        : "Hi! I'm the AlphaFlow AI assistant. I can help analyze capital flows, interpret market signals, and customize your daily flow report. What would you like to know?",
      ts: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const responseIdx = useRef(0);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg, ts: new Date() }]);
    setLoading(true);
    const responses = lang === "zh" ? RESPONSES_ZH : RESPONSES_EN;
    const reply = responses[responseIdx.current % responses.length];
    responseIdx.current++;
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: reply, ts: new Date() }]);
      setLoading(false);
    }, 1000 + Math.random() * 800);
  };

  const suggested = lang === "zh" ? SUGGESTED_ZH : SUGGESTED_EN;

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
      <DashboardSidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 32px", minHeight: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 4 }}>
            {lang === "zh" ? "研究中心 · AI 分析" : "RESEARCH HUB · AI ANALYSIS"}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: 4 }}>
            {lang === "zh" ? "AlphaFlow AI 助手" : "AlphaFlow AI Assistant"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748b" }}>
            {lang === "zh" ? "询问资金流向、市场信号或定制分析报告" : "Ask about capital flows, market signals, or get a custom analysis"}
          </p>
        </div>

        {/* Suggested prompts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
          {suggested.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              fontSize: 12, padding: "6px 13px", borderRadius: 20,
              background: "#eff6ff", border: "1px solid #93c5fd", color: "#1d4ed8",
              cursor: "pointer", fontFamily: "inherit",
            }}>{s}</button>
          ))}
        </div>

        {/* Chat window — fills remaining space */}
        <div className="card" style={{ flex: 1, padding: "16px 20px", overflowY: "auto", marginBottom: 12, minHeight: 300 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
              {m.role === "ai" && (
                <div style={{
                  width: 30, height: 30, borderRadius: 6, background: "#1e3a5f",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "#fff", fontWeight: 800, flexShrink: 0, marginRight: 10, marginTop: 2,
                }}>α</div>
              )}
              <div style={{
                borderRadius: 10, padding: "11px 16px", maxWidth: "70%",
                background: m.role === "user" ? "#1e3a5f" : "#f8fafc",
                border: `1px solid ${m.role === "user" ? "#1e3a5f" : "#e2e8f0"}`,
                fontSize: 13, color: m.role === "user" ? "#fff" : "#0f172a", lineHeight: 1.65,
              }}>
                {m.content}
                <div style={{ fontSize: 9, color: m.role === "user" ? "rgba(255,255,255,0.5)" : "#94a3b8", marginTop: 5 }}>
                  {m.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              {m.role === "user" && (
                <div style={{
                  width: 30, height: 30, borderRadius: 6, background: "#e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "#64748b", fontWeight: 700, flexShrink: 0, marginLeft: 10, marginTop: 2,
                }}>U</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 800 }}>α</div>
              <div className="card" style={{ padding: "10px 16px" }}>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#93c5fd", animation: `bounce 1s ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={lang === "zh" ? "询问资金流向、板块或市场信号..." : "Ask about capital flows, sectors, or market signals…"}
            style={{
              flex: 1, height: 42, padding: "0 16px",
              border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff",
              color: "#0f172a", fontSize: 13, outline: "none", fontFamily: "inherit",
            }}
          />
          <button onClick={() => send()} style={{
            height: 42, padding: "0 20px", borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: "#1e3a5f", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit",
          }}>
            {lang === "zh" ? "发送" : "Send"}
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, textAlign: "center" as const }}>
          {lang === "zh" ? "第二阶段接入 Claude AI (claude-haiku-4-5) · 约 ¥40/月" : "Phase 2: Real AI via Claude Haiku · ~$5/month · Powered by Anthropic"}
        </div>
      </main>
    </div>
  );
}
