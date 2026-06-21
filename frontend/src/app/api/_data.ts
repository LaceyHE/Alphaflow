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

// In-memory cache (per serverless instance, short-lived but helps within a request burst)
const cache = new Map<string, { data: QuoteResult[]; ts: number }>();
const TTL = 4 * 60 * 1000;

export async function getQuotes(tickers: string[]): Promise<QuoteResult[]> {
  const key = tickers.join(",");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  // Yahoo Finance v7 quote endpoint — works from server-side fetch
  const symbols = tickers.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketVolume`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://finance.yahoo.com",
      },
      next: { revalidate: 240 },
    });

    if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status}`);
    const json = await res.json();
    const quotes: QuoteResult[] = (json?.quoteResponse?.result ?? []).map((q: Record<string, unknown>) => ({
      ticker: q.symbol as string,
      price: (q.regularMarketPrice as number) ?? 0,
      change: (q.regularMarketChangePercent as number) ?? 0,
      volume: (q.regularMarketVolume as number) ?? 0,
    }));

    // Fill missing tickers with zeros
    const result = tickers.map((t) => quotes.find((q) => q.ticker === t) ?? { ticker: t, price: 0, change: 0, volume: 0 });
    cache.set(key, { data: result, ts: Date.now() });
    return result;
  } catch (err) {
    console.error("Yahoo Finance fetch failed:", err);
    return tickers.map((t) => ({ ticker: t, price: 0, change: 0, volume: 0 }));
  }
}
