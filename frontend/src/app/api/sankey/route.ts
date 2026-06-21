import { NextResponse } from "next/server";
import { SECTORS, REGIONS, ASSETS, getQuotes } from "../_data";

export async function GET(req: Request) {
  const tf = new URL(req.url).searchParams.get("tf") || "7D";
  const allTickers = [
    ...ASSETS.map((a) => a.ticker),
    ...REGIONS.map((r) => r.ticker),
    ...SECTORS.map((s) => s.ticker),
  ];
  const quotes = await getQuotes(allTickers);

  const nodes = [
    ...ASSETS.map((a) => ({ name: a.name })),
    ...REGIONS.slice(0, 4).map((r) => ({ name: r.name })),
    ...SECTORS.slice(0, 5).map((s) => ({ name: s.name })),
  ];

  const links: { source: number; target: number; value: number }[] = [];
  const assetCount = ASSETS.length;
  const regionCount = 4;

  ASSETS.forEach((a, ai) => {
    const aq = quotes.find((q) => q.ticker === a.ticker);
    REGIONS.slice(0, 4).forEach((r, ri) => {
      const rq = quotes.find((q) => q.ticker === r.ticker);
      const val = Math.max(0.5, Math.abs((aq?.change ?? 1) + (rq?.change ?? 1)) / 2 + 2);
      links.push({ source: ai, target: assetCount + ri, value: val });
    });
  });

  REGIONS.slice(0, 4).forEach((r, ri) => {
    SECTORS.slice(0, 5).forEach((s, si) => {
      const sq = quotes.find((q) => q.ticker === s.ticker);
      const val = Math.max(0.5, Math.abs(sq?.change ?? 1) + 1);
      links.push({ source: assetCount + ri, target: assetCount + regionCount + si, value: val });
    });
  });

  return NextResponse.json({ nodes, links, tf });
}
