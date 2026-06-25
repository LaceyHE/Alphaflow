"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/contexts/LangContext";
import { useIsMobile } from "@/hooks/useIsMobile";
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
  const { t, toggle: toggleLang, lang } = useLang();
  const path = usePathname();
  const isMobile = useIsMobile();
  const [q, setQ] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Persist language choice so DashboardSidebar can read it
  useEffect(() => {
    localStorage.setItem("af_lang", lang);
    window.dispatchEvent(new Event("storage"));
  }, [lang]);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("af_user");
    if (stored) setUser(stored);
  }, []);

  const NAV = [
    { label: t("nav_hero"),       href: "/" },
    { label: t("nav_dashboard"),  href: "/dashboard/regions" },
    { label: t("nav_canvas"),     href: "/canvas" },
    { label: t("nav_research"),   href: "/others/daily" },
    { label: t("nav_notes"),      href: "/notes" },
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

  // Close mobile menu on navigation
  useEffect(() => { setMobileMenuOpen(false); }, [path]);

  const isActiveSection = (href: string) => {
    if (href === "/") return path === "/";
    const section = href.split("/")[1];
    return path.startsWith("/" + section);
  };

  const SearchDropdown = ({ results, onClose }: { results: typeof SEARCH_INDEX; onClose: () => void }) => (
    <div style={{
      position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7,
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 300,
    }}>
      {results.map((item, i) => (
        <Link key={i} href={item.href}
          onClick={onClose}
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
            background: `${TYPE_COLORS[item.type]}15`, color: TYPE_COLORS[item.type],
          }}>{item.type}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: 56, background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: isMobile ? 0 : 16,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6, background: "#1e3a5f",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>AF</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>AlphaFlow</span>
        </Link>

        {isMobile ? (
          /* ── MOBILE HEADER ── */
          <>
            <div style={{ flex: 1 }} />
            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Menu"
              style={{
                width: 38, height: 38, borderRadius: 7,
                background: mobileMenuOpen ? "#1e3a5f" : "#f1f5f9",
                border: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              {mobileMenuOpen ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="2" y1="2" x2="14" y2="14" stroke={mobileMenuOpen ? "#fff" : "#334155"} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="14" y1="2" x2="2" y2="14" stroke={mobileMenuOpen ? "#fff" : "#334155"} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <line x1="1" y1="3.5" x2="15" y2="3.5" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="1" y1="8"   x2="15" y2="8"   stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="1" y1="12.5" x2="15" y2="12.5" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </>
        ) : (
          /* ── DESKTOP HEADER ── */
          <>
            <div style={{ width: 1, height: 22, background: "#e2e8f0", flexShrink: 0 }} />

            {/* Search */}
            <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 380 }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
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
                }}
              />
              {showResults && results.length > 0 && (
                <SearchDropdown results={results} onClose={() => { setQ(""); setShowResults(false); }} />
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
            <nav style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
              {NAV.map(l => {
                const active = isActiveSection(l.href);
                return (
                  <Link key={l.href} href={l.href} style={{
                    padding: "6px 11px", borderRadius: 5, fontSize: 13,
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
                  <button onClick={() => { setUser(null); localStorage.removeItem("af_user"); }} style={{
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
          </>
        )}
      </header>

      {/* ── MOBILE DROPDOWN MENU ── */}
      {isMobile && mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed", inset: 0, top: 56, zIndex: 190,
              background: "rgba(15,23,42,0.3)",
            }}
          />
          <div style={{
            position: "fixed", top: 56, left: 0, right: 0, zIndex: 195,
            background: "#fff", borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            maxHeight: "calc(100vh - 56px)", overflowY: "auto",
          }}>
            {/* Mobile Search */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", position: "relative" }}>
              <svg style={{ position: "absolute", left: 26, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={mobileSearchRef}
                type="text"
                placeholder={t("search_placeholder")}
                value={q}
                onChange={e => { setQ(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                style={{
                  width: "100%", height: 40, paddingLeft: 36, paddingRight: 12,
                  border: "1px solid #e2e8f0", borderRadius: 8, background: "#f8fafc",
                  color: "#0f172a", fontSize: 14, outline: "none", fontFamily: "inherit",
                }}
              />
              {results.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% - 12px)", left: 16, right: 16,
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 300,
                }}>
                  {results.map((item, i) => (
                    <Link key={i} href={item.href}
                      onClick={() => { setQ(""); setShowResults(false); setMobileMenuOpen(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "11px 14px", textDecoration: "none",
                        borderBottom: i < results.length - 1 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.name}</div>
                        {item.ticker && <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>{item.ticker}</div>}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 3,
                        background: `${TYPE_COLORS[item.type]}15`, color: TYPE_COLORS[item.type],
                      }}>{item.type}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Nav links */}
            <div style={{ padding: "8px 0" }}>
              {NAV.map(l => {
                const active = isActiveSection(l.href);
                return (
                  <Link key={l.href} href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "flex", alignItems: "center",
                      padding: "13px 20px", fontSize: 15,
                      fontWeight: active ? 700 : 400,
                      color: active ? "#1e3a5f" : "#334155",
                      background: active ? "#f0f4ff" : "transparent",
                      textDecoration: "none",
                      borderLeft: `3px solid ${active ? "#1e3a5f" : "transparent"}`,
                    }}>
                    {l.label}
                  </Link>
                );
              })}
            </div>

            {/* Bottom: lang toggle + auth */}
            <div style={{
              padding: "12px 16px 16px",
              borderTop: "1px solid #f1f5f9",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <button onClick={() => { toggleLang(); }} style={{
                padding: "8px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: "1px solid #e2e8f0", background: "#f8fafc", color: "#475569",
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {t("lang_toggle")}
              </button>
              <div style={{ flex: 1 }} />
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: "#1e3a5f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff",
                  }}>
                    {user[0].toUpperCase()}
                  </div>
                  <button onClick={() => { setUser(null); localStorage.removeItem("af_user"); setMobileMenuOpen(false); }} style={{
                    padding: "7px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                    border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer",
                    fontFamily: "inherit",
                  }}>{t("sign_out")}</button>
                </div>
              ) : (
                <>
                  <button onClick={() => { setSignInOpen(true); setMobileMenuOpen(false); }} style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                    border: "1px solid #e2e8f0", background: "#fff", color: "#334155", cursor: "pointer",
                    fontFamily: "inherit",
                  }}>{t("sign_in")}</button>
                  <button onClick={() => { setSignInOpen(true); setMobileMenuOpen(false); }} style={{
                    padding: "8px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    border: "none", background: "#1e3a5f", color: "#fff", cursor: "pointer",
                    fontFamily: "inherit",
                  }}>{t("get_access")}</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSuccess={email => { setUser(email); localStorage.setItem("af_user", email); }}
      />
    </>
  );
}
