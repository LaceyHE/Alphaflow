import { NextResponse } from "next/server";
import { REGIONS, getQuotes, QuoteResult } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const quotes = await getQuotes(REGIONS.map((r) => r.ticker), tf);
  const regions = REGIONS.map((r) => {
    const q = quotes.find((x: QuoteResult) => x.ticker === r.ticker) ?? { price: 0, change: 0, volume: 0 };
    return { name: r.name, ticker: r.ticker, change: q.change, price: q.price, volume: q.volume };
  });
  return NextResponse.json({ regions, tf });
}
