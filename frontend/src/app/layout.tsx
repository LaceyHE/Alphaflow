import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";
import FloatingChat from "@/components/FloatingChat";
import { LangProvider } from "@/contexts/LangContext";

export const metadata: Metadata = {
  title: "AlphaFlow — Capital Rotation Research",
  description: "Institutional-grade capital flow analytics. Track where money is moving across regions, sectors, and asset classes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <TopNav />
          <div style={{ paddingTop: 56 }}>
            {children}
          </div>
          <FloatingChat />
          <footer style={{
            borderTop: "1px solid #f1f5f9",
            padding: "9px 24px",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap" as const,
          }}>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              Market data: Yahoo Finance · ETF price returns used as capital flow proxy · Prices may be delayed up to 15 min
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              For informational purposes only · Not investment advice · AlphaFlow Research Platform
            </span>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}
