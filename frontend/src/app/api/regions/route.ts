import { NextResponse } from "next/server";
import { REGIONS, getQuotes } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const quotes = await getQuotes(REGIONS.map((r) => r.ticker));
  const regions = REGIONS.map((r) => {
    const q = quotes.find((x) => x.ticker === r.ticker)!;
    return { name: r.name, ticker: r.ticker, change: q.change, price: q.price, volume: q.volume };
  });
  return NextResponse.json({ regions, tf });
}
