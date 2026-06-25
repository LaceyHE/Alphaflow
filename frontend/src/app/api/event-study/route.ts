import { NextResponse } from "next/server";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://finance.yahoo.com",
  "Referer": "https://finance.yahoo.com/",
};

const POINTS = [-20, -15, -10, -5, -3, -1, 0, 1, 3, 5, 10, 15, 20, 30];

const cache = new Map<string, { data: any; ts: number }>();
const TTL = 60 * 60 * 1000;

interface DataPoint { ts: number; close: number }

async function fetchHistory(ticker: string, period1: number, period2: number): Promise<DataPoint[]> {
  const encoded = encodeURIComponent(ticker);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encoded}?period1=${period1}&period2=${period2}&interval=1d&includePrePost=false`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${ticker}: HTTP ${res.status}`);
  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) throw new Error(`No price data found for "${ticker}"`);
  const timestamps: number[] = result.timestamp ?? [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];
  const pts: DataPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const c = closes[i];
    if (c !== null && c !== undefined && !isNaN(c) && c > 0) {
      pts.push({ ts: timestamps[i], close: c });
    }
  }
  if (pts.length < 5) throw new Error(`Insufficient data for "${ticker}" — only ${pts.length} days found.`);
  return pts;
}

function getAt(data: DataPoint[], t0Idx: number, p0: number, offset: number): number {
  const idx = Math.max(0, Math.min(data.length - 1, t0Idx + offset));
  return +((data[idx].close / p0 - 1) * 100).toFixed(2);
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const eventDateStr = params.get("eventDate") || "";

  if (!eventDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(eventDateStr)) {
    return NextResponse.json({ error: "eventDate required (YYYY-MM-DD)" }, { status: 400 });
  }

  // Support "tickers=SPY,TLT,GLD" (new) and legacy "tickerA=SPY&tickerB=TLT"
  const tickersParam = params.get("tickers");
  const tickers = tickersParam
    ? tickersParam.split(",").map(t => t.toUpperCase().trim()).filter(Boolean).slice(0, 5)
    : [
        (params.get("tickerA") || "SPY").toUpperCase().trim(),
        (params.get("tickerB") || "TLT").toUpperCase().trim(),
      ];

  const cacheKey = `${tickers.join("|")}|${eventDateStr}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL) return NextResponse.json(cached.data);

  const eventDate = new Date(eventDateStr + "T16:00:00Z");
  const startDate = new Date(eventDate);
  startDate.setDate(startDate.getDate() - 40);
  const endDate = new Date(eventDate);
  endDate.setDate(endDate.getDate() + 50);
  const period1 = Math.floor(startDate.getTime() / 1000);
  const period2 = Math.floor(endDate.getTime() / 1000);

  try {
    const datasets = await Promise.all(tickers.map(t => fetchHistory(t, period1, period2)));
    const eventTs = eventDate.getTime() / 1000;

    const t0Idxs = datasets.map(data =>
      data.reduce((best, d, i) =>
        Math.abs(d.ts - eventTs) < Math.abs(data[best].ts - eventTs) ? i : best, 0)
    );
    const p0s = datasets.map((data, i) => data[t0Idxs[i]].close);
    const t0Prices: Record<string, number> = {};
    tickers.forEach((t, i) => { t0Prices[t] = +p0s[i].toFixed(2); });

    const series = POINTS.map(d => {
      const point: Record<string, any> = {
        label: d === 0 ? "Event" : `T${d >= 0 ? "+" : ""}${d}`,
        day: d,
      };
      tickers.forEach((t, i) => { point[t] = getAt(datasets[i], t0Idxs[i], p0s[i], d); });
      return point;
    });

    const result = { series, tickers, eventDate: eventDateStr, t0Prices };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
