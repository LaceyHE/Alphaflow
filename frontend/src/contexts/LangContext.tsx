"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "zh";

export const T = {
  en: {
    nav_hero: "Hero", nav_dashboard: "Dashboard", nav_canvas: "Canvas", nav_report: "Report", nav_research: "Research Hub", nav_notes: "Notes",
    sign_in: "Sign In", get_access: "Get Access", sign_out: "Sign Out", lang_toggle: "中文",
    search_placeholder: "Search assets, sectors, regions...",
    live: "Live",
    // hero page
    page_title: "Where is money moving?",
    page_sub: "performance across asset classes, regions & sectors",
    ai_summary: "AI FLOW SUMMARY",
    most_crowded: "Most Crowded",
    most_hated: "Most Hated",
    emerging: "Emerging Rotation",
    bull_signal: "BULL SIGNAL", bear_signal: "BEAR SIGNAL",
    capital_flow_map: "CAPITAL FLOW MAP",
    flow_show: "FLOW SHOW · PERFORMANCE RANKING",
    top_movers: "TOP MOVERS",
    name: "Name", ticker: "Ticker", category: "Category", performance: "Performance", signal: "Signal",
    inflow: "INFLOW", outflow: "OUTFLOW", neutral: "NEUTRAL",
    risk_on: "Risk ON", risk_off: "Risk OFF",
    // chat
    chat_title: "AI Assistant",
    chat_sub: "Ask about capital flows and market signals",
    chat_welcome: "Hi! I can analyze capital flows, interpret signals, and explain market moves. What would you like to know?",
    chat_placeholder: "Ask about flows, sectors, or market signals...",
    chat_send: "Send",
    chat_powered: "Powered by AlphaFlow · Phase 2 connects Claude AI",
    suggested1: "What sectors are outperforming?",
    suggested2: "Where is capital rotating today?",
    suggested3: "What are the strongest inflows?",
    suggested4: "Current risk sentiment?",
    // signin
    signin_title: "Sign in to AlphaFlow",
    signin_sub: "Access watchlists, saved dashboards, and AI analysis",
    email: "Email", password: "Password",
    signin_btn: "Sign In",
    no_account: "Don't have an account?",
    register: "Get Access",
    demo_hint: "Demo: any email + password",
  },
  zh: {
    nav_hero: "首页", nav_dashboard: "仪表板", nav_canvas: "画布", nav_report: "报告", nav_research: "研究中心", nav_notes: "笔记",
    sign_in: "登录", get_access: "注册", sign_out: "退出", lang_toggle: "EN",
    search_placeholder: "搜索资产、板块、地区...",
    live: "实时",
    page_title: "资金正在流向哪里？",
    page_sub: "跨资产类别、地区和板块的资金流向",
    ai_summary: "AI 资金摘要",
    most_crowded: "最拥挤交易",
    most_hated: "最冷门资产",
    emerging: "新兴轮动",
    bull_signal: "牛市信号", bear_signal: "熊市信号",
    capital_flow_map: "资金流图",
    flow_show: "资金流排行榜",
    top_movers: "涨跌排行",
    name: "名称", ticker: "代码", category: "类别", performance: "涨跌幅", signal: "信号",
    inflow: "流入", outflow: "流出", neutral: "中性",
    risk_on: "风险偏好", risk_off: "避险情绪",
    chat_title: "AI 助手",
    chat_sub: "询问资金流向和市场信号",
    chat_welcome: "你好！我可以分析资金流向、解读市场信号和解释市场动态。你想了解什么？",
    chat_placeholder: "询问资金流、板块或市场信号...",
    chat_send: "发送",
    chat_powered: "AlphaFlow 提供 · 第二阶段接入 Claude AI",
    suggested1: "哪些板块表现最好？",
    suggested2: "今天资金流向哪里？",
    suggested3: "最强的资金流入是什么？",
    suggested4: "当前市场风险情绪如何？",
    signin_title: "登录 AlphaFlow",
    signin_sub: "访问自选股、保存的仪表板和 AI 分析",
    email: "邮箱", password: "密码",
    signin_btn: "登录",
    no_account: "还没有账号？",
    register: "立即注册",
    demo_hint: "演示：任意邮箱 + 密码",
  },
} as const;

type Keys = keyof typeof T.en;

interface LangCtxType {
  lang: Lang;
  t: (k: Keys) => string;
  toggle: () => void;
}

const LangCtx = createContext<LangCtxType>({
  lang: "en",
  t: k => T.en[k],
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (k: Keys): string => T[lang][k] as string;
  const toggle = () => setLang(l => l === "en" ? "zh" : "en");
  return <LangCtx.Provider value={{ lang, t, toggle }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
