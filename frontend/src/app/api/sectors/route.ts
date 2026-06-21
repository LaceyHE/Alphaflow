import { NextResponse } from "next/server";
import { SECTORS, getQuotes, QuoteResult } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const quotes = await getQuotes(SECTORS.map((s) => s.ticker), tf);
  const sectors = SECTORS.map((s) => {
    const q = quotes.find((r: QuoteResult) => r.ticker === s.ticker) ?? { price: 0, change: 0, volume: 0 };
    return { name: s.name, ticker: s.ticker, change: q.change, price: q.price, volume: q.volume };
  });
  return NextResponse.json({ sectors, tf });
}
