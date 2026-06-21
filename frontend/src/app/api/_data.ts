import yahooFinance from "yahoo-finance2";

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

const cache = new Map<string, { data: QuoteResult[]; ts: number }>();
const TTL = 5 * 60 * 1000; // 5 min

export async function getQuotes(tickers: string[]): Promise<QuoteResult[]> {
  const key = tickers.join(",");
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  const results = await Promise.all(
    tickers.map(async (ticker) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const q: any = await yahooFinance.quote(ticker);
        return {
          ticker,
          price: (q.regularMarketPrice as number) ?? 0,
          change: (q.regularMarketChangePercent as number) ?? 0,
          volume: (q.regularMarketVolume as number) ?? 0,
        };
      } catch {
        return { ticker, price: 0, change: 0, volume: 0 };
      }
    })
  );

  cache.set(key, { data: results, ts: Date.now() });
  return results;
}
