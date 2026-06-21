"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Flow Dashboard", icon: "⚡" },
  { href: "/sectors", label: "Sectors", icon: "🔲" },
  { href: "/regions", label: "Regions", icon: "🌍" },
  { href: "/assets", label: "Asset Classes", icon: "📊" },
  { href: "/crypto", label: "Crypto", icon: "₿" },
  { href: "/macro", label: "Macro", icon: "📈" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col border-r z-30"
      style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="text-xl font-bold gradient-text">AlphaFlow</div>
        <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          Capital Rotation Visualizer
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? "rgba(0,255,148,0.1)" : "transparent",
                color: active ? "var(--accent)" : "var(--muted)",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
        <div>Data: Yahoo Finance · CoinGecko</div>
        <div className="mt-1">Phase 1 · Free APIs</div>
      </div>
    </aside>
  );
}
