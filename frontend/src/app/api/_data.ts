export const SECTORS = [
  { name: "Technology", ticker: "XLK" },
  { name: "Financials", ticker: "XLF" },
  { name: "Healthcare", ticker: "XLV" },
  { name: "Energy", ticker: "XLE" },
  { name: "Industrials", ticker: "XLI" },
  { name: "Consumer Disc.", ticker: "XLY" },
  { name: "Consumer Staples", ticker: "XLP" },
  { name: "Materials", ticker: "XLB" },
  { name: "Real Estate", ticker: "XLRE" },
  { name: "Utilities", ticker: "XLU" },
  { name: "Comm. Services", ticker: "XLC" },
];

export const REGIONS = [
  { name: "US", ticker: "SPY" },
  { name: "Japan", ticker: "EWJ" },
  { name: "Europe", ticker: "VGK" },
  { name: "China", ticker: "MCHI" },
  { name: "India", ticker: "INDA" },
  { name: "Brazil", ticker: "EWZ" },
  { name: "UK", ticker: "EWU" },
  { name: "Germany", ticker: "EWG" },
];

export const ASSETS = [
  { name: "US Equities", ticker: "SPY" },
  { name: "Bonds", ticker: "TLT" },
  { name: "Gold", ticker: "GLD" },
  { name: "Bitcoin", ticker: "BTC-USD" },
  { name: "Oil", ticker: "USO" },
  { name: "Real Estate", ticker: "VNQ" },
];

export const MACRO_TICKERS: Record<string, string> = {
  "S&P 500": "^GSPC",
  "Nasdaq": "^IXIC",
  "Dow Jones": "^DJI",
  "VIX": "^VIX",
  "10Y Treasury": "^TNX",
  "Gold": "GC=F",
  "Oil (WTI)": "CL=F",
  "DXY": "DX-Y.NYB",
};

export interface QuoteResult {
  ticker: string;
  price: number;
  change: number;
  volume: number;
}

const cache = new Map<string, { data: QuoteResult; ts: number }>();
const TTL = 4 * 60 * 1000;

async function fetchOne(ticker: string): Promise<QuoteResult> {
  const cached = cache.get(ticker);
  if (cached && Date.now() - cached.ts < TTL) return cached.data;

  const encoded = encodeURIComponent(ticker);
  // v8 chart API — no crumb/cookie needed, works from server-side
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=5d&includePrePost=false`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://finance.yahoo.com",
        "Referer": "https://finance.yahoo.com/",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta ?? {};
    const price: number = meta.regularMarketPrice ?? 0;
    const prevClose: number = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = prevClose && prevClose !== price
      ? ((price - prevClose) / prevClose) * 100
      : meta.regularMarketChangePercent ?? 0;
    const result: QuoteResult = { ticker, price, change, volume: meta.regularMarketVolume ?? 0 };
    cache.set(ticker, { data: result, ts: Date.now() });
    return result;
  } catch {
    return { ticker, price: 0, change: 0, volume: 0 };
  }
}

export async function getQuotes(tickers: string[]): Promise<QuoteResult[]> {
  // Deduplicate
  const unique = [...new Set(tickers)];
  const results = await Promise.all(unique.map(fetchOne));
  // Return in original order
  return tickers.map((t) => results.find((r) => r.ticker === t) ?? { ticker: t, price: 0, change: 0, volume: 0 });
}
