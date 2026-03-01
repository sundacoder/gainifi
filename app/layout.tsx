import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { WagmiProvider } from "@/components/wagmi-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Gainifi — Stablecoin Exchange & Nanopayments on Arc",
  description:
    "The premier stablecoin exchange with sub-cent nanopayment streams, cross-chain USDC liquidity via Circle Gateway, and on-chain yield via USYC — all built on Arc L1 with 0.5s finality.",
  keywords: [
    "stablecoin exchange",
    "nanopayments",
    "USDC",
    "Arc network",
    "Circle Gateway",
    "StableFX",
    "USYC",
    "DeFi",
    "cross-chain",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WagmiProvider>{children}</WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
