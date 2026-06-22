import { NextResponse } from "next/server";
import { SECTORS, REGIONS, ASSETS, getQuotes, QuoteResult } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const allTickers = [
    ...SECTORS.map((s) => s.ticker),
    ...REGIONS.map((r) => r.ticker),
    ...ASSETS.map((a) => a.ticker),
    "^GSPC", "^VIX",
  ];
  const quotes = await getQuotes(allTickers, tf);

  const spxChange = quotes.find((q: QuoteResult) => q.ticker === "^GSPC")?.change ?? 0;
  const vixPrice = quotes.find((q: QuoteResult) => q.ticker === "^VIX")?.price ?? 20;

  const sectorData = SECTORS.map((s) => ({
    name: s.name,
    change: quotes.find((q: QuoteResult) => q.ticker === s.ticker)?.change ?? 0,
  })).sort((a, b) => b.change - a.change);

  const regionData = REGIONS.map((r) => ({
    name: r.name,
    change: quotes.find((q: QuoteResult) => q.ticker === r.ticker)?.change ?? 0,
  })).sort((a, b) => b.change - a.change);

  const bull_bear = spxChange >= 0 && vixPrice < 25 ? "bull" : "bear";

  const top = sectorData[0];
  const bot = sectorData[sectorData.length - 1];
  const topReg = regionData[0];
  const botReg = regionData[regionData.length - 1];

  const lines = [
    `Price momentum leads in ${top.name} (${top.change >= 0 ? "+" : ""}${top.change.toFixed(2)}%) and trails in ${bot.name} (${bot.change.toFixed(2)}%) over the ${tf} period. Based on ETF price returns as a flow proxy.`,
    `${topReg.name} leads regional return at ${topReg.change >= 0 ? "+" : ""}${topReg.change.toFixed(2)}%, while ${botReg.name} lags at ${botReg.change.toFixed(2)}%.`,
    `Market regime is ${bull_bear === "bull" ? "RISK-ON" : "RISK-OFF"} — VIX at ${vixPrice.toFixed(1)}, SPX ${spxChange >= 0 ? "+" : ""}${spxChange.toFixed(2)}%. ${bull_bear === "bull" ? "Momentum favors equities and high-beta assets." : "Defensive positioning recommended; watch bonds and gold."}`,
  ];

  return NextResponse.json({
    tf, bull_bear, spx_change: spxChange, vix: vixPrice, lines,
    signals: { leading: top, lagging: bot, top_region: topReg },
  });
}
