import { NextResponse } from "next/server";
import { SECTORS, REGIONS, ASSETS, getQuotes, QuoteResult } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const allTickers = [
    ...ASSETS.map((a) => a.ticker),
    ...REGIONS.map((r) => r.ticker),
    ...SECTORS.map((s) => s.ticker),
  ];
  const quotes = await getQuotes(allTickers);

  const getChange = (ticker: string) =>
    quotes.find((q: QuoteResult) => q.ticker === ticker)?.change ?? 0;

  const assetNodes = ASSETS.map((a) => ({
    id: a.name, layer: 0, change: getChange(a.ticker),
  }));
  const regionNodes = REGIONS.slice(0, 4).map((r) => ({
    id: r.name, layer: 1, change: getChange(r.ticker),
  }));
  const sectorNodes = SECTORS.slice(0, 5).map((s) => ({
    id: s.name, layer: 2, change: getChange(s.ticker),
  }));

  const nodes = [...assetNodes, ...regionNodes, ...sectorNodes];

  const links: { source: string; target: string; value: number; change: number }[] = [];

  ASSETS.forEach((a) => {
    const ac = getChange(a.ticker);
    REGIONS.slice(0, 4).forEach((r) => {
      const rc = getChange(r.ticker);
      const val = Math.max(0.5, Math.abs((ac + rc) / 2) + 2);
      links.push({ source: a.name, target: r.name, value: val, change: (ac + rc) / 2 });
    });
  });

  REGIONS.slice(0, 4).forEach((r) => {
    SECTORS.slice(0, 5).forEach((s) => {
      const sc = getChange(s.ticker);
      const val = Math.max(0.5, Math.abs(sc) + 1);
      links.push({ source: r.name, target: s.name, value: val, change: sc });
    });
  });

  return NextResponse.json({ nodes, links, tf });
}
