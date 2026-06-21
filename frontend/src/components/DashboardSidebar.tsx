"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  {
    label: "Flow Analytics",
    items: [
      { label: "Overview", href: "/" },
      { label: "Region Flow", href: "/dashboard/regions" },
      { label: "Asset Flow", href: "/dashboard/assets" },
      { label: "Sector Flow", href: "/dashboard/sectors" },
      { label: "Theme Flow", href: "/dashboard/themes" },
      { label: "Earnings", href: "/dashboard/earnings" },
    ],
  },
  {
    label: "Research",
    items: [
      { label: "Macro Index", href: "/others/macro" },
      { label: "Economic Data", href: "/others/economic" },
      { label: "Daily Report", href: "/others/daily" },
      { label: "AI Analysis", href: "/others/chat" },
    ],
  },
  {
    label: "Canvas",
    items: [
      { label: "Backtest", href: "/canvas" },
      { label: "Event Study", href: "/canvas/events" },
      { label: "Seasonality", href: "/canvas/seasonal" },
    ],
  },
];

export default function DashboardSidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: 200, flexShrink: 0,
      borderRight: "1px solid #e2e8f0",
      height: "calc(100vh - 56px)",
      position: "sticky", top: 56,
      overflowY: "auto", background: "#fff",
      paddingTop: 10, paddingBottom: 16,
    }}>
      {GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: 2 }}>
          <div style={{
            padding: "10px 16px 5px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#94a3b8",
          }}>
            {group.label}
          </div>
          {group.items.map(item => {
            const active = item.href !== "/" && path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center",
                padding: "7px 16px", fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#1e3a5f" : "#475569",
                background: active ? "#eff6ff" : "transparent",
                textDecoration: "none",
                borderLeft: `2px solid ${active ? "#1e3a5f" : "transparent"}`,
                marginLeft: 2,
                transition: "all 0.1s",
              }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
