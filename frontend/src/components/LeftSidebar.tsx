"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENUS: Record<string, { label: string; href: string; icon: string }[]> = {
  hero: [],
  dashboard: [
    { label: "Region Rotation", href: "/dashboard/regions", icon: "🌍" },
    { label: "Asset Classes", href: "/dashboard/assets", icon: "📊" },
    { label: "S&P 500 Sectors", href: "/dashboard/sectors", icon: "🔲" },
    { label: "Theme Rotation", href: "/dashboard/themes", icon: "🔄" },
    { label: "Earnings", href: "/dashboard/earnings", icon: "💰" },
  ],
  canvas: [
    { label: "Backtest Studio", href: "/canvas", icon: "📐" },
    { label: "Event-Driven", href: "/canvas/events", icon: "⚡" },
    { label: "Seasonal Patterns", href: "/canvas/seasonal", icon: "📅" },
  ],
  others: [
    { label: "Macro Index", href: "/others/macro", icon: "📈" },
    { label: "Economic Indicators", href: "/others/economic", icon: "🏛️" },
    { label: "Daily Flow Report", href: "/others/daily", icon: "📰" },
    { label: "AI Chat", href: "/others/chat", icon: "🤖" },
  ],
};

export default function LeftSidebar() {
  const path = usePathname();
  const section = path === "/" ? "hero"
    : path.startsWith("/dashboard") ? "dashboard"
    : path.startsWith("/canvas") ? "canvas"
    : path.startsWith("/others") ? "others"
    : "hero";

  const items = MENUS[section] || [];
  if (items.length === 0) return null;

  return (
    <aside
      className="fixed left-0 top-12 bottom-0 w-48 flex flex-col z-40 py-4 px-2"
      style={{ background: "rgba(6,13,26,0.9)", borderRight: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="section-label px-3 mb-3">
        {section.charAt(0).toUpperCase() + section.slice(1)}
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const active = path === item.href || (item.href !== "/dashboard/regions" && path.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: active ? "rgba(59,130,246,0.1)" : "transparent",
                color: active ? "#60a5fa" : "#64748b",
                borderLeft: active ? "2px solid #3b82f6" : "2px solid transparent",
              }}
            >
              <span style={{ fontSize: 13 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
