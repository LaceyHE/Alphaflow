import { NextResponse } from "next/server";
import { SECTORS, getQuotes } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const quotes = await getQuotes(SECTORS.map((s) => s.ticker));
  const sectors = SECTORS.map((s) => {
    const q = quotes.find((r) => r.ticker === s.ticker)!;
    return { name: s.name, ticker: s.ticker, change: q.change, price: q.price, volume: q.volume };
  });
  return NextResponse.json({ sectors, tf });
}
