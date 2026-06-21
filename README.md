# AlphaFlow — Capital Rotation Research Platform

Institutional-grade capital flow analytics. Track where money is moving across regions, sectors, and asset classes in real time.

## Features

- **Global Capital Flow Map** — Sankey diagram showing money flow across asset classes, regions, sectors
- **AI Flow Summary** — Auto-generated daily narrative explaining market moves
- **Region / Sector / Asset Flow** — ETF-based performance dashboards with historical PE valuation
- **Macro Index** — Key indices with AI commentary and trade signals
- **Floating AI Chatbot** — Ask questions about capital flows in English or Chinese
- **Language Toggle** — English / 中文 support
- **Daily Report** — Auto-generated daily flow report with trade signals

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Charts**: Recharts + D3.js (Sankey)
- **Backend**: Python FastAPI
- **Data**: Yahoo Finance API (free), CoinGecko (free)

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Frontend is deployed on Vercel. Backend can be deployed on Railway or Render.
