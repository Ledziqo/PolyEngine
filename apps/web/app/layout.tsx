import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PolyEngine | AI Polymarket Paper Trading",
  description: "Live AI terminal for Polymarket analysis, automatic paper trading, and copy-wallet signals."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
