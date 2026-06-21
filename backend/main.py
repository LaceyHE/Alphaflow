"""AlphaFlow Backend — uses direct Yahoo Finance API calls (no yfinance dependency issues)."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Optional
import math

app = FastAPI(title="AlphaFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
}

SECTOR_ETFS = {
    "Technology": "XLK",
    "Financials": "XLF",
    "Energy": "XLE",
    "Health Care": "XLV",
    "Industrials": "XLI",
    "Consumer Disc.": "XLY",
    "Consumer Staples": "XLP",
    "Real Estate": "XLRE",
    "Materials": "XLB",
    "Utilities": "XLU",
    "Communication": "XLC",
}

REGION_ETFS = {
    "US": "SPY",
    "Japan": "EWJ",
    "Germany": "EWG",
    "Brazil": "EWZ",
    "Europe": "VGK",
    "China": "MCHI",
    "Australia": "EWA",
    "India": "INDA",
    "UK": "EWU",
    "Canada": "EWC",
}

ASSET_ETFS = {
    "US Equities": "SPY",
    "Bonds": "TLT",
    "Gold": "GLD",
    "Bitcoin": "BTC-USD",
    "USD Index": "UUP",
    "Oil": "USO",
    "Emerging Mkts": "EEM",
}

MACRO_TICKERS = {
    "S&P 500": "^GSPC",
    "Nasdaq": "^IXIC",
    "Dow Jones": "^DJI",
    "VIX": "^VIX",
    "10Y Treasury": "^TNX",
    "2Y Treasury": "^IRX",
    "Gold": "GC=F",
    "Oil (WTI)": "CL=F",
    "DXY": "DX-Y.NYB",
}

# In-memory cache: {cache_key: (timestamp, data)}
_cache: dict = {}
CACHE_TTL = 300  # 5 minutes


def _cache_get(key: str):
    if key in _cache:
        ts, data = _cache[key]
        if datetime.utcnow() - ts < timedelta(seconds=CACHE_TTL):
            return data
    return None


def _cache_set(key: str, data):
    _cache[key] = (datetime.utcnow(), data)


def days_for_tf(tf: str) -> int:
    return {"1D": 2, "3D": 5, "7D": 10, "1M": 35, "YTD": 200}.get(tf, 10)


def period_for_tf(tf: str) -> str:
    return {"1D": "5d", "3D": "5d", "7D": "1mo", "1M": "3mo", "YTD": "1y"}.get(tf, "1mo")


async def fetch_yahoo(client: httpx.AsyncClient, ticker: str, period: str = "1mo") -> dict:
    """Fetch OHLCV from Yahoo Finance v8 chart API."""
    cached = _cache_get(f"{ticker}:{period}")
    if cached is not None:
        return cached

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"range": period, "interval": "1d", "events": "div,splits"}
    try:
        r = await client.get(url, params=params, headers=HEADERS, timeout=12)
        r.raise_for_status()
        j = r.json()
        result = j.get("chart", {}).get("result", [])
        if not result:
            return {}
        data = result[0]
        closes = data.get("indicators", {}).get("quote", [{}])[0].get("close", [])
        volumes = data.get("indicators", {}).get("quote", [{}])[0].get("volume", [])
        closes = [c for c in closes if c is not None]
        if len(closes) < 2:
            return {}
        pct = (closes[-1] - closes[0]) / closes[0] * 100
        out = {
            "price": round(closes[-1], 4),
            "change": round(pct, 2),
            "history": [round(c, 4) for c in closes],
            "volume": round(float(sum(v for v in volumes if v) / max(len(volumes), 1)), 0),
        }
        _cache_set(f"{ticker}:{period}", out)
        return out
    except Exception as e:
        return {"price": 0.0, "change": 0.0, "history": [], "volume": 0, "error": str(e)}


async def fetch_many(tickers: dict[str, str], period: str) -> dict[str, dict]:
    """Fetch multiple tickers concurrently with rate limiting."""
    async with httpx.AsyncClient() as client:
        tasks = {name: fetch_yahoo(client, ticker, period) for name, ticker in tickers.items()}
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        out = {}
        for name, result in zip(tasks.keys(), results):
            if isinstance(result, Exception):
                out[name] = {"price": 0.0, "change": 0.0, "history": [], "volume": 0}
            else:
                out[name] = result
        return out


@app.get("/api/sectors")
async def get_sectors(timeframe: str = "7D"):
    period = period_for_tf(timeframe)
    data = await fetch_many(SECTOR_ETFS, period)
    results = [
        {
            "name": name,
            "ticker": SECTOR_ETFS[name],
            "change": d.get("change", 0),
            "price": d.get("price", 0),
            "volume": d.get("volume", 0),
            "history": d.get("history", []),
        }
        for name, d in data.items()
    ]
    results.sort(key=lambda x: x["change"], reverse=True)
    return {"timeframe": timeframe, "sectors": results}


@app.get("/api/regions")
async def get_regions(timeframe: str = "7D"):
    period = period_for_tf(timeframe)
    data = await fetch_many(REGION_ETFS, period)
    results = [
        {
            "name": name,
            "ticker": REGION_ETFS[name],
            "change": d.get("change", 0),
            "price": d.get("price", 0),
            "history": d.get("history", []),
        }
        for name, d in data.items()
    ]
    results.sort(key=lambda x: x["change"], reverse=True)
    return {"timeframe": timeframe, "regions": results}


@app.get("/api/assets")
async def get_assets(timeframe: str = "7D"):
    period = period_for_tf(timeframe)
    data = await fetch_many(ASSET_ETFS, period)
    results = [
        {
            "name": name,
            "ticker": ASSET_ETFS[name],
            "change": d.get("change", 0),
            "price": d.get("price", 0),
            "history": d.get("history", []),
        }
        for name, d in data.items()
    ]
    results.sort(key=lambda x: x["change"], reverse=True)
    return {"timeframe": timeframe, "assets": results}


@app.get("/api/macro")
async def get_macro():
    data = await fetch_many(MACRO_TICKERS, "5d")
    return {
        "indicators": {
            name: {
                "price": d.get("price", 0),
                "change": d.get("change", 0),
                "history": d.get("history", []),
            }
            for name, d in data.items()
        }
    }


@app.get("/api/crypto")
async def get_crypto():
    cached = _cache_get("crypto:top12")
    if cached:
        return cached
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://api.coingecko.com/api/v3/coins/markets",
                params={
                    "vs_currency": "usd",
                    "order": "market_cap_desc",
                    "per_page": 12,
                    "page": 1,
                    "sparkline": "true",
                    "price_change_percentage": "24h,7d",
                },
                headers=HEADERS,
                timeout=15,
            )
            data = r.json()
            out = {
                "coins": [
                    {
                        "id": c["id"],
                        "name": c["name"],
                        "symbol": c["symbol"].upper(),
                        "price": c["current_price"],
                        "change_24h": c.get("price_change_percentage_24h") or 0,
                        "change_7d": c.get("price_change_percentage_7d_in_currency") or 0,
                        "market_cap": c["market_cap"],
                        "volume_24h": c["total_volume"],
                        "sparkline": c.get("sparkline_in_7d", {}).get("price", []),
                        "image": c["image"],
                    }
                    for c in data
                    if isinstance(c, dict)
                ]
            }
            _cache_set("crypto:top12", out)
            return out
    except Exception as e:
        return {"coins": [], "error": str(e)}


@app.get("/api/sankey")
async def get_sankey(timeframe: str = "7D"):
    period = period_for_tf(timeframe)

    asset_data, region_data, sector_data = await asyncio.gather(
        fetch_many(ASSET_ETFS, period),
        fetch_many(REGION_ETFS, period),
        fetch_many(SECTOR_ETFS, period),
    )

    nodes = []
    links = []

    # Layer 0 — top 4 asset classes by abs change
    top_assets = sorted(ASSET_ETFS.keys(), key=lambda k: abs(asset_data[k].get("change", 0)), reverse=True)[:4]
    for a in top_assets:
        nodes.append({"id": a, "layer": 0, "change": asset_data[a].get("change", 0)})

    # Layer 1 — top 5 regions
    top_regions = sorted(REGION_ETFS.keys(), key=lambda k: abs(region_data[k].get("change", 0)), reverse=True)[:5]
    for r in top_regions:
        nodes.append({"id": r, "layer": 1, "change": region_data[r].get("change", 0)})

    # Layer 2 — top 5 sectors
    top_sectors = sorted(SECTOR_ETFS.keys(), key=lambda k: abs(sector_data[k].get("change", 0)), reverse=True)[:5]
    for s in top_sectors:
        nodes.append({"id": s, "layer": 2, "change": sector_data[s].get("change", 0)})

    # Links: equities/EM → regions
    equity_source = "US Equities"
    em_source = "Emerging Mkts"
    intl_regions = {"Japan", "Germany", "Brazil", "Europe", "China", "India", "UK"}
    for r in top_regions:
        chg = region_data[r].get("change", 0)
        src = em_source if r in intl_regions and em_source in top_assets else equity_source
        if src not in top_assets:
            src = top_assets[0]
        links.append({"source": src, "target": r, "value": max(abs(chg) * 8, 4), "change": chg})

    # Links: US → sectors
    us_node = "US" if "US" in top_regions else top_regions[0] if top_regions else None
    if us_node:
        for s in top_sectors:
            chg = sector_data[s].get("change", 0)
            links.append({"source": us_node, "target": s, "value": max(abs(chg) * 8, 4), "change": chg})

    return {"nodes": nodes, "links": links, "timeframe": timeframe}


@app.get("/api/narrative")
async def get_narrative(timeframe: str = "7D"):
    period = period_for_tf(timeframe)

    sector_data, region_data, asset_data = await asyncio.gather(
        fetch_many(SECTOR_ETFS, period),
        fetch_many(REGION_ETFS, period),
        fetch_many(ASSET_ETFS, period),
    )

    best_sector = max(SECTOR_ETFS.keys(), key=lambda k: sector_data[k].get("change", 0))
    worst_sector = min(SECTOR_ETFS.keys(), key=lambda k: sector_data[k].get("change", 0))
    best_region = max(REGION_ETFS.keys(), key=lambda k: region_data[k].get("change", 0))
    worst_region = min(REGION_ETFS.keys(), key=lambda k: region_data[k].get("change", 0))

    bs_chg = sector_data[best_sector].get("change", 0)
    ws_chg = sector_data[worst_sector].get("change", 0)
    spx_chg = asset_data.get("US Equities", {}).get("change", 0)
    bonds_chg = asset_data.get("Bonds", {}).get("change", 0)
    gold_chg = asset_data.get("Gold", {}).get("change", 0)
    btc_chg = asset_data.get("Bitcoin", {}).get("change", 0)
    br_chg = region_data.get(best_region, {}).get("change", 0)

    tf_label = "week" if timeframe == "7D" else timeframe

    lines = [
        f"Money is rotating OUT of {worst_sector} ({ws_chg:+.1f}%) and INTO {best_sector} ({bs_chg:+.1f}%) this {tf_label}.",
        f"{best_region} leads globally ({br_chg:+.1f}%) while {worst_region} shows the weakest momentum.",
        f"{'Risk-ON' if spx_chg > bonds_chg else 'Risk-OFF'}: Equities {'outperform' if spx_chg > bonds_chg else 'underperform'} Bonds. Gold {gold_chg:+.1f}%, BTC {btc_chg:+.1f}%.",
    ]

    all_sectors = list(SECTOR_ETFS.keys())
    mid_sector = sorted(all_sectors, key=lambda k: sector_data[k].get("change", 0))[len(all_sectors) // 2]

    return {
        "timeframe": timeframe,
        "lines": lines,
        "signals": {
            "most_crowded": {"name": best_sector, "change": bs_chg},
            "most_hated": {"name": worst_sector, "change": ws_chg},
            "emerging": {"name": mid_sector, "change": sector_data[mid_sector].get("change", 0)},
        },
        "bull_bear": "bull" if spx_chg > 0 else "bear",
        "spx_change": spx_chg,
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
