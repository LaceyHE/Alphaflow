import { NextResponse } from "next/server";
import { SECTORS, REGIONS, ASSETS, getQuotes } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const allTickers = [
    ...SECTORS.map((s) => s.ticker),
    ...REGIONS.map((r) => r.ticker),
    ...ASSETS.map((a) => a.ticker),
    "^GSPC", "^VIX",
  ];
  const quotes = await getQuotes(allTickers);

  const spx = quotes.find((q) => q.ticker === "^GSPC");
  const vix = quotes.find((q) => q.ticker === "^VIX");
  const spxChange = spx?.change ?? 0;
  const vixPrice = vix?.price ?? 20;

  const sectorData = SECTORS.map((s) => ({
    name: s.name,
    change: quotes.find((q) => q.ticker === s.ticker)?.change ?? 0,
  })).sort((a, b) => b.change - a.change);

  const regionData = REGIONS.map((r) => ({
    name: r.name,
    change: quotes.find((q) => q.ticker === r.ticker)?.change ?? 0,
  })).sort((a, b) => b.change - a.change);

  const bull_bear = spxChange >= 0 && vixPrice < 25 ? "bull" : "bear";

  const lines = [
    `Capital is rotating ${sectorData[0].change > 0 ? "into" : "away from"} ${sectorData[0].name} (${sectorData[0].change >= 0 ? "+" : ""}${sectorData[0].change.toFixed(2)}%) and ${sectorData[sectorData.length - 1].change < 0 ? "out of" : "into"} ${sectorData[sectorData.length - 1].name} (${sectorData[sectorData.length - 1].change.toFixed(2)}%) over the ${tf} period.`,
    `${regionData[0].name} leads regional performance at ${regionData[0].change >= 0 ? "+" : ""}${regionData[0].change.toFixed(2)}%, while ${regionData[regionData.length - 1].name} lags at ${regionData[regionData.length - 1].change.toFixed(2)}%.`,
    `Market sentiment is ${bull_bear === "bull" ? "RISK-ON" : "RISK-OFF"} — VIX at ${vixPrice.toFixed(1)}, SPX ${spxChange >= 0 ? "+" : ""}${spxChange.toFixed(2)}%. ${bull_bear === "bull" ? "Momentum favors equities and high-beta assets." : "Defensive positioning recommended; watch bonds and gold."}`,
  ];

  return NextResponse.json({
    tf,
    bull_bear,
    spx_change: spxChange,
    vix: vixPrice,
    lines,
    signals: {
      most_crowded: sectorData[0],
      most_hated: sectorData[sectorData.length - 1],
      emerging: regionData[0],
    },
  });
}
