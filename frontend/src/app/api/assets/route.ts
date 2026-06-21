import { NextResponse } from "next/server";
import { ASSETS, getQuotes } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const quotes = await getQuotes(ASSETS.map((a) => a.ticker));
  const assets = ASSETS.map((a) => {
    const q = quotes.find((x) => x.ticker === a.ticker)!;
    return { name: a.name, ticker: a.ticker, change: q.change, price: q.price, volume: q.volume };
  });
  return NextResponse.json({ assets, tf });
}
