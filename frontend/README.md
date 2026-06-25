# AlphaFlow — Institutional Capital Flow Analytics

> Real-time capital rotation intelligence across regions, assets, sectors, and themes — built for institutional and sophisticated retail investors.

## 🌐 Live Site

**[https://alphaflow-lacey-he.vercel.app](https://alphaflow-lacey-he.vercel.app)**

Deployed on Vercel · Hong Kong region (hkg1) for China routing · Data via Yahoo Finance

---

## What It Does

AlphaFlow answers the core question every portfolio manager asks: **where is money moving, and why?**

It aggregates real-time price data across the full cross-asset spectrum and presents it through five analytical lenses — region, asset class, sector, theme, and event — with research-grade tools layered on top.

---

## Features

### Flow Analytics

| Module | Description |
|---|---|
| **Region Flow** | Capital flow heatmap across 10+ global regions (US, Europe, Japan, EM, China, etc.) with world map toggle and timeframe selector (1D / 3D / 7D / 1M / YTD) |
| **Asset Flow** | Cross-asset rotation snapshot: Equities, Bonds, Commodities, Crypto, FX — with sparkline price history and inflow/outflow bar chart |
| **Sector Flow** | S&P 500 sector heatmap + momentum bar chart + PE percentile valuation table (cheap / fair / rich signal) |
| **Theme Flow** | 30+ investable themes (AI, Semis, Cloud, Clean Energy, EM, Defense, Bitcoin, etc.) in a momentum quadrant chart with custom theme input |

### Canvas (Research Tools)

| Tool | Description |
|---|---|
| **Strategy Backtest** | Custom basket backtester with per-stock buy/sell/partial-sell trade scheduling, long/short legs, and equity curve vs benchmark |
| **Event Study** | Multi-asset price reaction analysis around 20+ major macro events with pattern detection, key stats table, and structured trade ideas |
| **Seasonality** | Calendar-based return patterns and seasonal tendencies |

### Research Hub

| Module | Description |
|---|---|
| **Macro Index** | Global liquidity and macro indicator dashboard |
| **Economic Data** | FRED-sourced economic indicators |
| **Daily Report** | AI-generated institutional daily with customizable focus via natural language prompt |
| **AI Analysis** | Conversational macro/flow Q&A |

---

## Earnings Review

**Path:** `/dashboard/earnings`

The Earnings module provides a full earnings scorecard for S&P 500 companies, combining pre-event positioning data, earnings-day reaction, and post-earnings drift in a single view.

### Stock Universe

160+ S&P 500 companies across 11 sectors: Technology, Communication Services, Consumer Discretionary, Consumer Staples, Financials, Healthcare, Energy, Industrials, Materials, Real Estate, Utilities.

### Per-Stock View

Select any ticker from the scrollable list (searchable, sector-filterable) to load:

**5-metric summary bar:**
| Metric | Description |
|---|---|
| Pre-ER | % move in the 5 days leading into the earnings date |
| ER Day | % move on the earnings day itself (the market's immediate verdict) |
| Post Drift | % move in the 5 days following the report |
| EPS Beat | Actual EPS vs consensus estimate (% surprise) |
| Rev Beat | Actual revenue vs consensus estimate (% surprise) |

**Earnings timeline chart:** Line chart indexed to T=0 (report day), showing pre-ER run-up, the gap at earnings, and the post-earnings drift over 10 trading days. Color-coded green (beat) or red (miss).

**EPS & Revenue breakdown cards:** Estimate vs Actual side-by-side with % surprise — same format used in Bloomberg terminal earnings tearsheets.

### Filters

- **Ticker search** — type any symbol (e.g. NVDA, TSLA, JPM)
- **Sector filter chips** — narrow to any of the 11 GICS sectors
- **Beat/Miss badge** — visible on every row in the list panel

### Data Note

> EPS and revenue figures in the current demo are algorithmically generated using a seeded deterministic function to ensure consistent, reproducible results across sessions. They are **illustrative only** and do not reflect actual reported earnings. Production integration requires Bloomberg, FactSet, or Refinitiv data feeds.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + inline styles (design-system variables) |
| Charts | Recharts (responsive, SSR-safe) |
| World Map | react-simple-maps v3 with ISO-3166 country coding |
| Data | Yahoo Finance API (server-side, no CORS) |
| i18n | Custom LangContext — English / 中文 toggle, persisted to localStorage |
| Auth | Email registration with confirmation flow (demo mode) |
| Deployment | Vercel — `hkg1` region for China latency |

---

## Project Structure

```
frontend/
  src/
    app/
      dashboard/
        regions/      # Region flow + world map
        assets/       # Cross-asset rotation
        sectors/      # Sector heatmap + PE table
        themes/       # Theme momentum quadrant
        earnings/     # Earnings review (this module)
      canvas/
        page.tsx      # Strategy backtest
        events/       # Event-driven analysis
        seasonal/     # Seasonality patterns
      others/
        macro/        # Macro index
        economic/     # Economic data
        daily/        # Daily report
        chat/         # AI analysis
      api/
        event-study/  # Yahoo Finance event study API (multi-asset)
        sectors/      # Sector data API
        regions/      # Region data API
        narrative/    # AI narrative generation
    components/
      TopNav.tsx          # Header (mobile-responsive with hamburger)
      DashboardSidebar.tsx # Section nav (desktop sidebar / mobile tab strip)
      SignInModal.tsx      # Auth modal with email confirmation flow
      FloatingChat.tsx     # Persistent AI chat widget
    contexts/
      LangContext.tsx  # EN/ZH translation provider
    hooks/
      useIsMobile.ts   # Breakpoint detection (JS-based for inline-style pages)
    lib/
      api.ts           # Yahoo Finance fetch wrappers
```

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — or visit the live site at **[https://alphaflow-lacey-he.vercel.app](https://alphaflow-lacey-he.vercel.app)**.

---

## Deployment

Deployed to Vercel with Hong Kong region for optimal mainland China routing:

```json
{
  "regions": ["hkg1"]
}
```

```bash
vercel --prod
```

For reliable China access (GFW), point a custom domain via Cloudflare proxy to Vercel — Cloudflare's network routes significantly better through China than bare `vercel.app`.

---

## Roadmap

- [ ] Custom domain + Cloudflare proxy for guaranteed China access
- [ ] Live earnings data integration (Bloomberg / FactSet)
- [ ] Global liquidity cycle indicators (CrossBorderCapital methodology)
- [ ] Auth gating for premium content
- [ ] Mobile app (React Native)
