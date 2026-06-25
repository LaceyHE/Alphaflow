"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "zh";

// English is the source of truth — all keys must exist here
const EN = {
  // Nav
  nav_hero: "Top Line", nav_dashboard: "Dashboard", nav_canvas: "Canvas",
  nav_report: "Report", nav_research: "Research Hub", nav_notes: "Notes",
  sign_in: "Sign In", get_access: "Get Access", sign_out: "Sign Out", lang_toggle: "中文",
  search_placeholder: "Search assets, sectors, regions...",
  live: "Live",

  // Hero page
  page_title: "Where is money moving?",
  page_sub: "performance across asset classes, regions & sectors",
  ai_summary: "AI FLOW SUMMARY",
  leading: "Leading", lagging: "Lagging", top_region: "Top Region",
  bull_signal: "BULL SIGNAL", bear_signal: "BEAR SIGNAL",
  capital_flow_map: "MOMENTUM MAP",
  flow_show: "FLOW SHOW · PERFORMANCE RANKING",
  flow_show_sub: "All asset classes, regions & sectors — green = positive return, red = negative return",
  top_movers: "TOP MOVERS",
  name: "Name", ticker: "Ticker", category: "Category", performance: "Performance", signal: "Signal",
  inflow: "POSITIVE", outflow: "NEGATIVE", neutral: "NEUTRAL",
  risk_on: "Risk ON", risk_off: "Risk OFF",
  loading_flow: "Loading flow data…",
  no_data: "No data available",
  instruments_tracked: "instruments tracked",
  by_etf_return: "by ETF price return",
  sankey_sub: "Asset Classes → Regions → Sectors · Link width ≈ ETF return magnitude",
  top_sectors: "TOP SECTORS",
  top_regions: "TOP REGIONS",

  // Timeframes
  tf_1D: "Last 24h", tf_3D: "Last 3 Days", tf_7D: "Last 7 Days",
  tf_1M: "Last Month", tf_YTD: "Year to Date",

  // Regions page
  region_page_label: "FLOW ANALYTICS · REGION ROTATION",
  region_page_title: "Global Capital Flow by Region",
  region_page_sub: "Regional ETF performance as proxy for capital flow direction",
  top_performer: "Top Performer", weakest: "Weakest",
  avg_performance: "Avg Performance", gainers_losers: "Gainers / Losers",
  perf_by_region: "PERFORMANCE BY REGION",
  world_map_title: "GLOBAL PERFORMANCE MAP",

  // Themes page
  theme_page_label: "FLOW ANALYTICS · THEME ROTATION",
  theme_page_title: "Thematic Momentum Map",
  theme_page_sub: "X = current momentum · Y = Δ vs prior period",
  theme_page_legend: "dashed circle + arrow = movement from prior period",
  trending_now: "TRENDING NOW",
  quadrant_leading: "Leading ▲", quadrant_improving: "Improving ↗",
  quadrant_weakening: "Weakening ↘", quadrant_lagging: "Lagging ▼",
  add_theme: "+ Add Theme", add_theme_placeholder: "Enter ticker (e.g. ARKK)",
  remove_theme: "Remove",
  score: "Score", current_col: "Current", delta_col: "Δ vs Prior",
  prior_pos: "Prior", movement: "Movement",
  quadrant_guide: "QUADRANT GUIDE",
  q_leading_desc: "High momentum, accelerating. Strong inflow. Potential: Continued outperformance.",
  q_improving_desc: "Low level but accelerating. Early rotation signal. Potential: Catch-up trade.",
  q_weakening_desc: "High level but decelerating. Momentum fading. Potential: Rotation risk, trim longs.",
  q_lagging_desc: "Low momentum, decelerating. Outflow. Potential: Contrarian value or avoid.",

  // Backtest page
  backtest_label: "CANVAS · BACKTEST STUDIO",
  backtest_title: "Strategy Backtesting",
  backtest_sub: "Test long/short strategies on any ticker — type any symbol or pick from suggestions.",
  strategy_config: "STRATEGY CONFIGURATION",
  strategy: "Strategy",
  asset_ticker: "Asset / Ticker",
  start_date: "Start Date",
  end_date: "End Date",
  run_btn: "▶ Run",
  running_btn: "Running…",
  configure_run: "Configure & Run Your Backtest",
  configure_sub: "Select a strategy, type any ticker (SPY, NVDA, BTC-USD, GC=F…), set a date range, and click Run.",
  equity_curve: "EQUITY CURVE",
  strategy_line: "— Strategy",
  benchmark_line: "- - Buy & Hold",
  total_return: "Total Return",
  vs_benchmark: "vs Benchmark",
  cagr_label: "CAGR",
  sharpe_label: "Sharpe",
  max_drawdown: "Max Drawdown",
  win_rate: "Win Rate",
  long_basket: "Long Basket",
  short_basket: "Short Basket (optional)",
  trade_schedule: "TRADE SCHEDULE · Per-Stock Timing",
  trade_schedule_sub: "Define entry/exit dates and sizes for each position",
  add_trade: "+ Add Trade",
  trade_ticker: "Ticker", trade_action: "Action", trade_date: "Date", trade_size: "Size",
  illustrative_note: "ILLUSTRATIVE · Synthetic backtest engine. Connect Bloomberg / FactSet for live backtesting.",
  custom_basket_active: "Custom basket active",

  // Event study
  event_label: "CANVAS · EVENT STUDY",
  event_title: "Event-Driven Analysis",
  event_sub: "Price reaction of any two assets before, during, and after major macro events · Indexed to T=0",
  select_event: "SELECT EVENT",

  // Seasonal
  seasonal_label: "CANVAS · SEASONAL PATTERNS",
  seasonal_title: "Historical Seasonality",

  // Floating chat
  chat_title: "AlphaFlow AI",
  chat_sub: "Capital flow analysis assistant",
  chat_welcome: "Hi! I'm your AlphaFlow assistant. Ask me about sector flows, regional rotation, risk sentiment, or specific assets.",
  chat_placeholder: "Ask about sector flows, regions…",
  chat_send: "Send",
  chat_powered: "Powered by Claude",
  suggested1: "Where is money flowing today?",
  suggested2: "Which sectors are leading?",
  suggested3: "What's the regional rotation?",
  suggested4: "Current risk sentiment?",

  // Daily report
  report_label: "RESEARCH HUB · DAILY FLOW REPORT",
  report_title: "Daily Flow Report",
  report_focus_label: "Report Focus (Natural Language)",
  report_focus_placeholder: "e.g. Focus on Asia tech and semiconductors, or give a bearish take on bonds",
  report_focus_hint: "Your focus will customize the report narrative in Phase 2 (LLM integration).",
  report_customize_btn: "Customize",
  report_focus_saved: "Focus saved",
  report_focus_clear: "Clear",
  market_snapshot: "MARKET SNAPSHOT",
  flow_narrative: "AI FLOW NARRATIVE · 7D",
  sector_perf: "SECTOR PERFORMANCE · 7D",
  region_perf: "REGION PERFORMANCE · 7D",
  econ_calendar: "THIS WEEK'S ECONOMIC CALENDAR",
  watchlist_label: "WATCHLIST · INSTRUMENTS TO WATCH",
  configure_llm: "Configure LLM",
  day_col: "Day", event_col: "Event", impact_col: "Impact",
  forecast_col: "Forecast", prior_col: "Prior",
  high_impact: "HIGH", med_impact: "MED",
  sector_col: "Sector", region_col: "Region", change_col: "Change",
  signal_col: "Signal", in_signal: "IN", out_signal: "OUT", neu_signal: "NEU",

  // Macro
  macro_label: "RESEARCH HUB · MACRO DASHBOARD",
  macro_title: "Global Macro Dashboard",
  macro_sub: "Monitor key macro indicators and their market context",
  indicator_context: "📋 INDICATOR CONTEXT",
  momentum_signal: "MOMENTUM SIGNAL",
  select_indicator: "SELECT INDICATOR",

  // Auth
  signin_title: "Sign in to AlphaFlow",
  signin_sub: "Access watchlists, saved dashboards, and AI analysis",
  email: "Email", password: "Password",
  signin_btn: "Sign In",
  no_account: "Don't have an account?",
  register: "Get Access",
  demo_hint: "Demo: any email + password",
  access_required: "Premium Access Required",
  access_required_sub: "Sign in to unlock the full dashboard, AI analysis, and all features.",
  confirm_email_title: "Check Your Email",
  confirm_email_sub: "We sent a confirmation link to",
  confirm_email_note: "Click the link in the email to activate your account. (In production — powered by Resend.)",
  resend_email: "Resend email",
};

// Chinese translations — partial: fallback to English for any missing key
const ZH: Partial<typeof EN> = {
  nav_hero: "行情总览", nav_dashboard: "仪表板", nav_canvas: "画布",
  nav_report: "报告", nav_research: "研究中心", nav_notes: "笔记",
  sign_in: "登录", get_access: "注册", sign_out: "退出", lang_toggle: "EN",
  search_placeholder: "搜索资产、板块、地区...",
  live: "实时",

  page_title: "资金正在流向哪里？",
  page_sub: "跨资产类别、地区和板块的资金流向",
  ai_summary: "AI 资金摘要",
  leading: "领涨", lagging: "领跌", top_region: "领先地区",
  bull_signal: "牛市信号", bear_signal: "熊市信号",
  capital_flow_map: "动量图",
  flow_show: "资金流排行榜",
  flow_show_sub: "所有资产类别、地区和板块 — 绿色 = 正收益，红色 = 负收益",
  top_movers: "涨跌排行",
  name: "名称", ticker: "代码", category: "类别", performance: "涨跌幅", signal: "信号",
  inflow: "正收益", outflow: "负收益", neutral: "中性",
  risk_on: "风险偏好", risk_off: "避险情绪",
  loading_flow: "加载资金流数据…",
  no_data: "暂无数据",
  instruments_tracked: "个标的跟踪中",
  by_etf_return: "以ETF价格收益率计算",
  sankey_sub: "资产类别 → 地区 → 板块 · 线条宽度 ≈ ETF收益幅度",
  top_sectors: "热门板块",
  top_regions: "热门地区",

  tf_1D: "近24小时", tf_3D: "近3天", tf_7D: "近7天",
  tf_1M: "近1个月", tf_YTD: "年初至今",

  region_page_label: "资金分析 · 地区轮动",
  region_page_title: "全球各地区资金流向",
  region_page_sub: "以地区ETF表现作为资金流向代理指标",
  top_performer: "表现最佳", weakest: "表现最弱",
  avg_performance: "平均涨跌幅", gainers_losers: "上涨/下跌",
  perf_by_region: "各地区表现",
  world_map_title: "全球表现地图",

  theme_page_label: "资金分析 · 主题轮动",
  theme_page_title: "主题动量图",
  theme_page_sub: "X = 当前动量 · Y = 相对前期变化",
  theme_page_legend: "虚线圆圈 + 箭头 = 相对前期位移",
  trending_now: "当前热门",
  quadrant_leading: "领涨 ▲", quadrant_improving: "改善 ↗",
  quadrant_weakening: "走弱 ↘", quadrant_lagging: "落后 ▼",
  add_theme: "+ 添加主题", add_theme_placeholder: "输入代码 (如 ARKK)",
  remove_theme: "移除",
  score: "评分", current_col: "当前", delta_col: "相对前期变化",
  prior_pos: "前期", movement: "位移",
  quadrant_guide: "象限说明",
  q_leading_desc: "高动量，加速上涨。资金大量流入。预期：持续跑赢。",
  q_improving_desc: "低位但加速。早期轮动信号。预期：追涨机会。",
  q_weakening_desc: "高位但减速。动量减弱。预期：轮动风险，考虑减仓。",
  q_lagging_desc: "低动量，持续下跌。资金流出。预期：逆向价值或观望。",

  backtest_label: "画布 · 策略回测",
  backtest_title: "策略回测",
  backtest_sub: "在任意代码上测试多空策略 — 输入任意代码或从建议中选择。",
  strategy_config: "策略配置",
  strategy: "策略",
  asset_ticker: "资产/代码",
  start_date: "开始日期",
  end_date: "结束日期",
  run_btn: "▶ 运行",
  running_btn: "运行中…",
  configure_run: "配置并运行回测",
  configure_sub: "选择策略、输入任意代码 (SPY, NVDA, BTC-USD…)、设置日期范围，点击运行。",
  equity_curve: "资金曲线",
  strategy_line: "— 策略",
  benchmark_line: "- - 买入持有",
  total_return: "总收益率",
  vs_benchmark: "超额收益",
  cagr_label: "年化收益",
  sharpe_label: "夏普比率",
  max_drawdown: "最大回撤",
  win_rate: "胜率",
  long_basket: "多头篮子",
  short_basket: "空头篮子 (可选)",
  trade_schedule: "交易计划 · 逐股时间",
  trade_schedule_sub: "为每个持仓设置进出场日期和规模",
  add_trade: "+ 添加交易",
  trade_ticker: "代码", trade_action: "操作", trade_date: "日期", trade_size: "规模",
  illustrative_note: "演示版 · 合成回测引擎。接入Bloomberg/FactSet获取真实数据。",
  custom_basket_active: "自定义篮子已激活",

  // Chat (Chinese)
  chat_title: "AlphaFlow AI",
  chat_sub: "资金流向分析助手",
  chat_welcome: "您好！我是AlphaFlow助手。可以问我关于板块流向、地区轮动、市场情绪或特定资产的问题。",
  chat_placeholder: "询问板块流向、地区动态…",
  chat_send: "发送",
  chat_powered: "由 Claude 提供支持",
  suggested1: "今天资金流向哪里？",
  suggested2: "哪些板块领涨？",
  suggested3: "当前地区轮动情况？",
  suggested4: "当前市场风险情绪？",

  event_label: "画布 · 事件研究",
  event_title: "事件驱动分析",
  event_sub: "任意两个资产在重大宏观事件前后的价格反应 · 以T=0（事件日）为基准",
  select_event: "选择事件",

  seasonal_label: "画布 · 季节性规律",
  seasonal_title: "历史季节性规律",

  report_label: "研究中心 · 每日流向报告",
  report_title: "每日流向报告",
  report_focus_label: "报告关注点（自然语言）",
  report_focus_placeholder: "例如：关注亚洲科技和半导体，或对债券持悲观看法",
  report_focus_hint: "您的关注点将在第二阶段（LLM接入后）用于定制报告叙述。",
  report_customize_btn: "自定义",
  report_focus_saved: "已保存",
  report_focus_clear: "清除",
  market_snapshot: "市场快照",
  flow_narrative: "AI 资金流叙述 · 7D",
  sector_perf: "板块表现 · 7D",
  region_perf: "地区表现 · 7D",
  econ_calendar: "本周经济日历",
  watchlist_label: "监控列表 · 今日关注",
  configure_llm: "配置 LLM",
  day_col: "日期", event_col: "事件", impact_col: "重要性",
  forecast_col: "预测", prior_col: "前值",
  high_impact: "高", med_impact: "中",
  sector_col: "板块", region_col: "地区", change_col: "涨跌幅",
  signal_col: "信号", in_signal: "流入", out_signal: "流出", neu_signal: "中性",

  macro_label: "研究中心 · 宏观仪表板",
  macro_title: "全球宏观仪表板",
  macro_sub: "监控关键宏观指标及其市场含义",
  indicator_context: "📋 指标解读",
  momentum_signal: "动量信号",
  select_indicator: "选择指标",

  signin_title: "登录 AlphaFlow",
  signin_sub: "访问自选股、保存的仪表板和 AI 分析",
  email: "邮箱", password: "密码",
  signin_btn: "登录",
  no_account: "还没有账号？",
  register: "立即注册",
  demo_hint: "演示：任意邮箱 + 密码",
  access_required: "需要高级权限",
  access_required_sub: "登录以解锁完整仪表板、AI分析和所有功能。",
  confirm_email_title: "请查收邮件",
  confirm_email_sub: "我们已向以下邮箱发送确认链接",
  confirm_email_note: "点击邮件中的链接激活账户。（生产环境 — 由Resend提供支持。）",
  resend_email: "重新发送",
};

export type TKey = keyof typeof EN;

interface LangCtxType {
  lang: Lang;
  t: (k: TKey) => string;
  toggle: () => void;
}

const LangCtx = createContext<LangCtxType>({
  lang: "en",
  t: k => EN[k],
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  // Fallback to English for any missing Chinese key
  const t = (k: TKey): string => (lang === "zh" ? (ZH[k] ?? EN[k]) : EN[k]) as string;
  const toggle = () => setLang(l => l === "en" ? "zh" : "en");
  return <LangCtx.Provider value={{ lang, t, toggle }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

// Legacy T export for any code still using T.en / T.zh directly
export const T = { en: EN, zh: { ...EN, ...ZH } } as const;
