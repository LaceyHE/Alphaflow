"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const SECTIONS = {
  dashboard: {
    label: "Flow Analytics",
    labelZh: "资金分析",
    items: [
      { label: "Region Flow",  labelZh: "地区流向",  href: "/dashboard/regions" },
      { label: "Asset Flow",   labelZh: "资产流向",  href: "/dashboard/assets" },
      { label: "Sector Flow",  labelZh: "板块流向",  href: "/dashboard/sectors" },
      { label: "Theme Flow",   labelZh: "主题流向",  href: "/dashboard/themes" },
      { label: "Earnings",     labelZh: "财报",      href: "/dashboard/earnings" },
    ],
  },
  research: {
    label: "Research Hub",
    labelZh: "研究中心",
    items: [
      { label: "Macro Index",   labelZh: "宏观指数",   href: "/others/macro" },
      { label: "Economic Data", labelZh: "经济数据",   href: "/others/economic" },
      { label: "Daily Report",  labelZh: "每日报告",   href: "/others/daily" },
      { label: "AI Analysis",   labelZh: "AI 分析",    href: "/others/chat" },
    ],
  },
  canvas: {
    label: "Canvas",
    labelZh: "画布",
    items: [
      { label: "Backtest",     labelZh: "回测",         href: "/canvas" },
      { label: "Event Study",  labelZh: "事件研究",     href: "/canvas/events" },
      { label: "Seasonality",  labelZh: "季节性规律",   href: "/canvas/seasonal" },
    ],
  },
};

export default function DashboardSidebar() {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang] = useState<"en" | "zh">("en");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Detect language from localStorage (set by LangContext toggle)
  useEffect(() => {
    const stored = localStorage.getItem("af_lang");
    if (stored === "zh") setLang("zh");
    const onStorage = () => {
      const l = localStorage.getItem("af_lang");
      if (l === "zh" || l === "en") setLang(l);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close sidebar on navigation
  useEffect(() => { setMobileOpen(false); }, [path]);

  const sectionKey =
    path.startsWith("/dashboard") ? "dashboard" :
    path.startsWith("/canvas")    ? "canvas" :
    path.startsWith("/others")    ? "research" :
    null;

  const section = sectionKey ? SECTIONS[sectionKey] : null;
  if (!section) return null;

  const sidebarContent = (
    <aside
      className={`af-sidebar${isMobile && mobileOpen ? " open" : ""}`}
      style={{
        width: 200, flexShrink: 0,
        borderRight: "1px solid #e2e8f0",
        height: "calc(100vh - 56px)",
        position: isMobile ? "fixed" : "sticky",
        top: 56,
        overflowY: "auto", background: "#fff",
        paddingTop: 12, paddingBottom: 16,
      }}
    >
      <div style={{
        padding: "6px 16px 10px",
        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#94a3b8",
      }}>
        {lang === "zh" ? section.labelZh : section.label}
      </div>
      {section.items.map(item => {
        const active = item.href === "/canvas"
          ? path === "/canvas"
          : path.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} style={{
            display: "flex", alignItems: "center",
            padding: "8px 16px", fontSize: 14,
            fontWeight: active ? 600 : 400,
            color: active ? "#1e3a5f" : "#475569",
            background: active ? "#eff6ff" : "transparent",
            textDecoration: "none",
            borderLeft: `2px solid ${active ? "#1e3a5f" : "transparent"}`,
            marginLeft: 2,
            transition: "all 0.1s",
          }}>
            {lang === "zh" ? item.labelZh : item.label}
          </Link>
        );
      })}
    </aside>
  );

  // Mobile: render a horizontal scrollable tab strip (no floating button)
  if (isMobile) {
    return (
      <div style={{
        position: "fixed", top: 56, left: 0, right: 0, zIndex: 150,
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center",
        overflowX: "auto", scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch" as any,
        padding: "0 12px", gap: 0,
        height: 40,
      }}>
        {section.items.map(item => {
          const active = item.href === "/canvas"
            ? path === "/canvas"
            : path.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center",
              padding: "0 14px", height: 40, flexShrink: 0,
              fontSize: 13, fontWeight: active ? 700 : 400,
              color: active ? "#1e3a5f" : "#64748b",
              textDecoration: "none",
              borderBottom: `2px solid ${active ? "#1e3a5f" : "transparent"}`,
              whiteSpace: "nowrap",
            }}>
              {lang === "zh" ? item.labelZh : item.label}
            </Link>
          );
        })}
      </div>
    );
  }

  return sidebarContent;
}
