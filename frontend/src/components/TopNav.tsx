"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import SignInModal from "./SignInModal";

const SEARCH_INDEX = [
  { name: "US Equities", ticker: "SPY", type: "Asset", href: "/dashboard/assets" },
  { name: "Bonds (TLT)", ticker: "TLT", type: "Asset", href: "/dashboard/assets" },
  { name: "Gold", ticker: "GLD", type: "Asset", href: "/dashboard/assets" },
  { name: "Bitcoin", ticker: "BTC-USD", type: "Asset", href: "/dashboard/assets" },
  { name: "USD Index", ticker: "UUP", type: "Asset", href: "/dashboard/assets" },
  { name: "Oil (WTI)", ticker: "USO", type: "Asset", href: "/dashboard/assets" },
  { name: "Technology", ticker: "XLK", type: "Sector", href: "/dashboard/sectors" },
  { name: "Financials", ticker: "XLF", type: "Sector", href: "/dashboard/sectors" },
  { name: "Energy", ticker: "XLE", type: "Sector", href: "/dashboard/sectors" },
  { name: "Health Care", ticker: "XLV", type: "Sector", href: "/dashboard/sectors" },
  { name: "Industrials", ticker: "XLI", type: "Sector", href: "/dashboard/sectors" },
  { name: "Consumer Disc.", ticker: "XLY", type: "Sector", href: "/dashboard/sectors" },
  { name: "Real Estate", ticker: "XLRE", type: "Sector", href: "/dashboard/sectors" },
  { name: "US", ticker: "SPY", type: "Region", href: "/dashboard/regions" },
  { name: "Japan", ticker: "EWJ", type: "Region", href: "/dashboard/regions" },
  { name: "Europe", ticker: "VGK", type: "Region", href: "/dashboard/regions" },
  { name: "China", ticker: "MCHI", type: "Region", href: "/dashboard/regions" },
  { name: "India", ticker: "INDA", type: "Region", href: "/dashboard/regions" },
  { name: "Brazil", ticker: "EWZ", type: "Region", href: "/dashboard/regions" },
  { name: "Germany", ticker: "EWG", type: "Region", href: "/dashboard/regions" },
  { name: "UK", ticker: "EWU", type: "Region", href: "/dashboard/regions" },
  { name: "AI / Tech Theme", ticker: "QQQ", type: "Theme", href: "/dashboard/themes" },
  { name: "Clean Energy", ticker: "ICLN", type: "Theme", href: "/dashboard/themes" },
  { name: "Semiconductors", ticker: "SOXX", type: "Theme", href: "/dashboard/themes" },
  { name: "S&P 500", ticker: "^GSPC", type: "Macro", href: "/others/macro" },
  { name: "VIX", ticker: "^VIX", type: "Macro", href: "/others/macro" },
  { name: "10Y Treasury", ticker: "^TNX", type: "Macro", href: "/others/macro" },
  { name: "Daily Report", ticker: "", type: "Report", href: "/others/daily" },
  { name: "AI Analysis", ticker: "", type: "Report", href: "/others/chat" },
  { name: "Backtest Canvas", ticker: "", type: "Canvas", href: "/canvas" },
];

const TYPE_COLORS: Record<string, string> = {
  Asset: "#1d4ed8", Sector: "#16a34a", Region: "#b45309",
  Theme: "#7c3aed", Macro: "#0891b2", Report: "#be185d", Canvas: "#57534e",
};

export default function TopNav() {
  const { t, toggle: toggleLang } = useLang();
  const path = usePathname();
  const [q, setQ] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const NAV = [
    { label: t("nav_hero"), href: "/" },
    { label: t("nav_dashboard"), href: "/dashboard/regions" },
    { label: t("nav_canvas"), href: "/canvas" },
    { label: t("nav_report"), href: "/others/daily" },
  ];

  const results = q.trim().length > 0
    ? SEARCH_INDEX.filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase()) ||
        item.ticker.toLowerCase().includes(q.toLowerCase()) ||
        item.type.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActiveSection = (href: string) => {
    if (href === "/") return path === "/";
    const section = href.split("/")[1];
    return path.startsWith("/" + section);
  };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 56, background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center",
        padding: "0 20px", gap: 18,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6, background: "#1e3a5f",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>AF</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>AlphaFlow</span>
        </Link>

        <div style={{ width: 1, height: 22, background: "#e2e8f0", flexShrink: 0 }} />

        {/* Search */}
        <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", flexShrink: 0 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={q}
            onChange={e => { setQ(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            onKeyDown={e => { if (e.key === "Escape") { setQ(""); setShowResults(false); } }}
            style={{
              width: "100%", height: 34, paddingLeft: 32, paddingRight: 10,
              border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc",
              color: "#0f172a", fontSize: 13, outline: "none", fontFamily: "inherit",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={e => ((e.target as HTMLInputElement).style.borderColor = "#cbd5e1")}
            onMouseLeave={e => ((e.target as HTMLInputElement).style.borderColor = "#e2e8f0")}
          />
          {/* Search dropdown */}
          {showResults && results.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              overflow: "hidden", zIndex: 300,
            }}>
              {results.map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  onClick={() => { setQ(""); setShowResults(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 14px", textDecoration: "none",
                    borderBottom: i < results.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.name}</div>
                    {item.ticker && <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{item.ticker}</div>}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 3,
                    background: `${TYPE_COLORS[item.type]}15`,
                    color: TYPE_COLORS[item.type],
                  }}>{item.type}</span>
                </Link>
              ))}
            </div>
          )}
          {showResults && q.trim().length > 0 && results.length === 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
              padding: "12px 14px", fontSize: 13, color: "#94a3b8", zIndex: 300,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            }}>
              No results for "{q}"
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {NAV.map(l => {
            const active = isActiveSection(l.href);
            return (
              <Link key={l.href} href={l.href} style={{
                padding: "6px 13px", borderRadius: 5, fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#0f172a" : "#64748b",
                background: active ? "#f1f5f9" : "transparent",
                textDecoration: "none", whiteSpace: "nowrap",
              }}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
          {/* Live indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600,
            color: "#16a34a", background: "#f0fdf4",
            padding: "4px 9px", borderRadius: 4, border: "1px solid #86efac",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
            {t("live")}
          </div>

          {/* Language toggle */}
          <button onClick={toggleLang} style={{
            padding: "5px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600,
            border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            {t("lang_toggle")}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", background: "#1e3a5f",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
              }}>
                {user[0].toUpperCase()}
              </div>
              <button onClick={() => setUser(null)} style={{
                padding: "5px 12px", borderRadius: 5, fontSize: 13, fontWeight: 500,
                border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer",
                fontFamily: "inherit",
              }}>{t("sign_out")}</button>
            </div>
          ) : (
            <>
              <button onClick={() => setSignInOpen(true)} style={{
                padding: "5px 13px", borderRadius: 5, fontSize: 13, fontWeight: 500,
                border: "1px solid #e2e8f0", background: "#fff", color: "#334155", cursor: "pointer",
                fontFamily: "inherit",
              }}>{t("sign_in")}</button>
              <button onClick={() => setSignInOpen(true)} style={{
                padding: "5px 15px", borderRadius: 5, fontSize: 13, fontWeight: 600,
                border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer",
                fontFamily: "inherit",
              }}>{t("get_access")}</button>
            </>
          )}
        </div>
      </header>

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSuccess={email => setUser(email)}
      />
    </>
  );
}
