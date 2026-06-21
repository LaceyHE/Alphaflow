import { NextResponse } from "next/server";
import { MACRO_TICKERS, getQuotes } from "../_data";

export async function GET() {
  const tickers = Object.values(MACRO_TICKERS);
  const quotes = await getQuotes(tickers);
  const indicators: Record<string, { price: number; change: number }> = {};
  for (const [label, ticker] of Object.entries(MACRO_TICKERS)) {
    const q = quotes.find((x) => x.ticker === ticker);
    indicators[label] = { price: q?.price ?? 0, change: q?.change ?? 0 };
  }
  return NextResponse.json({ indicators });
}
