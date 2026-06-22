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
  "S&P 500":     "^GSPC",
  "Nasdaq":      "^IXIC",
  "Dow Jones":   "^DJI",
  "VIX":         "^VIX",
  "10Y Treasury":"^TNX",
  "5Y Treasury": "^FVX",
  "30Y Treasury":"^TYX",
  "Gold":        "GC=F",
  "Silver":      "SI=F",
  "Oil (WTI)":   "CL=F",
  "Natural Gas":  "NG=F",
  "Copper":      "HG=F",
  "DXY":         "DX-Y.NYB",
  "Bitcoin":     "BTC-USD",
  "EUR/USD":     "EURUSD=X",
  "USD/JPY":     "USDJPY=X",
  "Nikkei 225":  "^N225",
  "DAX":         "^GDAXI",
  "FTSE 100":    "^FTSE",
  "Hang Seng":   "^HSI",
};

// Maps UI timeframe → Yahoo Finance chart API params
const TF_PARAMS: Record<string, { range: string; interval: string }> = {
  "1D":  { range: "1d",  interval: "5m"  },
  "3D":  { range: "5d",  interval: "1d"  },
  "7D":  { range: "5d",  interval: "1d"  },
  "1M":  { range: "1mo", interval: "1d"  },
  "YTD": { range: "ytd", interval: "1d"  },
};

// How many bars back to look for the "start" price on multi-day timeframes
const TF_BARS_BACK: Record<string, number> = {
  "1D":  0,  // use meta.regularMarketChangePercent (intraday)
  "3D":  3,
  "7D":  5,  // 5 trading days ≈ 7 calendar days
  "1M":  0,  // use all bars in 1mo range
  "YTD": 0,  // use all bars in ytd range
};

export interface QuoteResult {
  ticker: string;
  price: number;
  change: number; // % change for the selected timeframe
  volume: number;
}

// Cache keyed by "ticker|tf"
const cache = new Map<string, { data: QuoteResult; ts: number }>();
const TTL = 4 * 60 * 1000;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

async function fetchOne(ticker: string, tf: string): Promise<QuoteResult> {
  const cacheKey = `${ticker}|${tf}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL) return cached.data;

  const { range, interval } = TF_PARAMS[tf] ?? TF_PARAMS["7D"];
  const encoded = encodeURIComponent(ticker);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encoded}?interval=${interval}&range=${range}&includePrePost=false`;

  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const result0 = json?.chart?.result?.[0];
    const meta = result0?.meta ?? {};
    const price: number = meta.regularMarketPrice ?? 0;

    let change = 0;

    if (tf === "1D") {
      // For 1D use the intraday % change from meta
      const prevClose: number = meta.previousClose ?? meta.chartPreviousClose ?? price;
      change = prevClose && prevClose !== price
        ? ((price - prevClose) / prevClose) * 100
        : (meta.regularMarketChangePercent ?? 0);
    } else {
      // For multi-day: use close price array to compute first→last change
      const closes: number[] = result0?.indicators?.quote?.[0]?.close ?? [];
      const validCloses = closes.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));

      if (validCloses.length >= 2) {
        const barsBack = TF_BARS_BACK[tf];
        // For 3D, start price is the close 3 bars ago (or oldest available)
        const startIdx = barsBack > 0
          ? Math.max(0, validCloses.length - 1 - barsBack)
          : 0;
        const startPrice = validCloses[startIdx];
        const endPrice = validCloses[validCloses.length - 1];
        if (startPrice && startPrice !== 0) {
          change = ((endPrice - startPrice) / startPrice) * 100;
        }
      } else {
        // Fallback to 1D change if no history available
        const prevClose: number = meta.previousClose ?? meta.chartPreviousClose ?? price;
        change = prevClose && prevClose !== price
          ? ((price - prevClose) / prevClose) * 100
          : (meta.regularMarketChangePercent ?? 0);
      }
    }

    const result: QuoteResult = { ticker, price, change, volume: meta.regularMarketVolume ?? 0 };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch {
    return { ticker, price: 0, change: 0, volume: 0 };
  }
}

export async function getQuotes(tickers: string[], tf = "7D"): Promise<QuoteResult[]> {
  const seen = new Set<string>();
  const unique = tickers.filter(t => { if (seen.has(t)) return false; seen.add(t); return true; });
  const results = await Promise.all(unique.map(t => fetchOne(t, tf)));
  return tickers.map(t => results.find(r => r.ticker === t) ?? { ticker: t, price: 0, change: 0, volume: 0 });
}
