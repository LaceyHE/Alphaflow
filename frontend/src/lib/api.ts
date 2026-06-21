const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Timeframe = "1D" | "3D" | "7D" | "1M" | "YTD";

export interface SectorItem {
  name: string;
  ticker: string;
  change: number;
  price: number;
  volume: number;
  history: number[];
}

export interface RegionItem {
  name: string;
  ticker: string;
  change: number;
  price: number;
  history: number[];
}

export interface AssetItem {
  name: string;
  ticker: string;
  change: number;
  price: number;
  history: number[];
}

export interface CryptoItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change_24h: number;
  change_7d: number;
  market_cap: number;
  volume_24h: number;
  sparkline: number[];
  image: string;
}

export interface NarrativeData {
  timeframe: string;
  lines: string[];
  signals: {
    most_crowded: { name: string; change: number };
    most_hated: { name: string; change: number };
    emerging: { name: string; change: number };
  };
  bull_bear: "bull" | "bear";
  spx_change: number;
}

export interface SankeyData {
  nodes: { id: string; layer: number; change: number }[];
  links: { source: string; target: string; value: number; change: number }[];
  timeframe: string;
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  sectors: (tf: Timeframe) =>
    get<{ sectors: SectorItem[]; timeframe: string }>("/api/sectors", { timeframe: tf }),

  regions: (tf: Timeframe) =>
    get<{ regions: RegionItem[]; timeframe: string }>("/api/regions", { timeframe: tf }),

  assets: (tf: Timeframe) =>
    get<{ assets: AssetItem[]; timeframe: string }>("/api/assets", { timeframe: tf }),

  crypto: () => get<{ coins: CryptoItem[] }>("/api/crypto"),

  macro: () => get<{ indicators: Record<string, { price: number; change: number; history: number[] }> }>("/api/macro"),

  narrative: (tf: Timeframe) => get<NarrativeData>("/api/narrative", { timeframe: tf }),

  sankey: (tf: Timeframe) => get<SankeyData>("/api/sankey", { timeframe: tf }),
};
