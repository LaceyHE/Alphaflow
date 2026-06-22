// API base — empty string means same-origin (Next.js API routes on Vercel)
const BASE = typeof window !== "undefined" ? "" : "";

export type Timeframe = "1D" | "3D" | "7D" | "1M" | "YTD";

export interface SectorItem {
  name: string;
  ticker: string;
  change: number;
  price: number;
  volume: number;
  history?: number[];
}

export interface RegionItem {
  name: string;
  ticker: string;
  change: number;
  price: number;
  history?: number[];
}

export interface AssetItem {
  name: string;
  ticker: string;
  change: number;
  price: number;
  history?: number[];
}

export interface NarrativeData {
  timeframe?: string;
  tf?: string;
  lines: string[];
  signals: {
    leading: { name: string; change: number };
    lagging: { name: string; change: number };
    top_region: { name: string; change: number };
  };
  bull_bear: "bull" | "bear";
  spx_change: number;
  vix?: number;
}

export interface SankeyData {
  nodes: { id: string; layer: number; change: number }[];
  links: { source: string; target: string; value: number; change: number }[];
  tf?: string;
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  sectors: (tf: Timeframe) =>
    get<{ sectors: SectorItem[] }>("/api/sectors", { tf }),

  regions: (tf: Timeframe) =>
    get<{ regions: RegionItem[] }>("/api/regions", { tf }),

  assets: (tf: Timeframe) =>
    get<{ assets: AssetItem[] }>("/api/assets", { tf }),

  macro: () =>
    get<{ indicators: Record<string, { price: number; change: number }> }>("/api/macro"),

  narrative: (tf: Timeframe) =>
    get<NarrativeData>("/api/narrative", { tf }),

  sankey: (tf: Timeframe) =>
    get<SankeyData>("/api/sankey", { tf }),
};
