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
        </LangProvider>
      </body>
    </html>
  );
}
