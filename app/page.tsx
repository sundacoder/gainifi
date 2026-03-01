"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

/* ──── Animated Nano Counter ──── */
function NanoCounter() {
  const [count, setCount] = useState(0.0);
  useEffect(() => {
    const iv = setInterval(() => setCount((c) => c + 0.000001), 100);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className="nano-ticker font-mono text-2xl md:text-4xl font-bold gradient-text-emerald inline-block min-w-[200px]">
      ${count.toFixed(6)}
    </span>
  );
}

/* ──── Floating Orbs Background ──── */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-[var(--gainifi-blue)] opacity-[0.06] blur-[120px] animate-float" />
      <div
        className="absolute top-[60%] right-[10%] w-[350px] h-[350px] rounded-full bg-[var(--gainifi-violet)] opacity-[0.06] blur-[100px] animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-[20%] left-[40%] w-[300px] h-[300px] rounded-full bg-[var(--gainifi-emerald)] opacity-[0.04] blur-[100px] animate-float"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}

/* ──── Feature Card ──── */
function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: string;
}) {
  return (
    <div
      className="glass-card rounded-2xl p-6 md:p-8 hover:scale-[1.02] transition-all duration-500 group cursor-pointer"
      style={{ animationDelay: delay }}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${gradient} text-white text-xl transition-transform group-hover:scale-110 duration-300`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ──── Stats Live Ticker ──── */
function StatItem({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold gradient-text">
        {value}
        {suffix && (
          <span className="text-muted-foreground text-lg">{suffix}</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

/* ──── Main Landing Page ──── */
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col relative grid-bg">
      <FloatingOrbs />

      {/* Nav */}
      <nav className="relative z-20 w-full flex justify-center border-b border-border/30 h-16 backdrop-blur-xl bg-background/60">
        <div className="w-full max-w-7xl flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--gainifi-blue)] to-[var(--gainifi-violet)] flex items-center justify-center text-white font-bold text-sm">
              G
            </div>
            <span className="text-lg font-bold tracking-tight">Gainifi</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/exchange"
              className="hover:text-foreground transition-colors"
            >
              Exchange
            </Link>
            <Link
              href="/dashboard/stream"
              className="hover:text-foreground transition-colors"
            >
              Nanopay
            </Link>
            <Link
              href="/dashboard/vault"
              className="hover:text-foreground transition-colors"
            >
              Vault
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[var(--gainifi-blue)] to-[var(--gainifi-violet)] text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-secondary/50 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--gainifi-emerald)] animate-pulse-glow" />
            Live on Arc Testnet · 0.5s Finality
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            The Future of{" "}
            <span className="gradient-text">Stablecoin</span>{" "}
            <br className="hidden md:block" />
            Exchange & <span className="gradient-text-emerald">Nanopayments</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Swap stablecoins at institutional FX rates. Stream micro-payments at{" "}
            <strong className="text-foreground">$0.000001/sec</strong>. Earn yield on idle
            capital. All on Circle&apos;s Arc with USDC-denominated gas.
          </p>

          {/* Live nano counter */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs text-muted-foreground uppercase tracking-widest">
              Live Nanopayment Stream
            </div>
            <NanoCounter />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/sign-up"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--gainifi-blue)] to-[var(--gainifi-violet)] text-white font-semibold text-base hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Launch Exchange
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-2xl border border-border/50 font-semibold text-base hover:bg-secondary/50 transition-all backdrop-blur-sm"
            >
              View Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-12 border-y border-border/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
          <StatItem label="Finality" value="0.5" suffix="s" />
          <StatItem label="Min Payment" value="$0.000001" />
          <StatItem label="FX Pairs" value="12+" />
          <StatItem label="USYC APY" value="5.2" suffix="%" />
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 md:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three Protocols. <span className="gradient-text">One Platform.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Gainifi composes Circle&apos;s StableFX, Nanopayments, and USYC into a
              seamless DeFi experience on Arc.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              }
              title="StableFX Exchange"
              description="Atomic PvP stablecoin swaps with zero counterparty risk. Institutional-grade FX rates for USDC, EURC, BRLA, MXNB and more."
              gradient="bg-gradient-to-br from-[var(--gainifi-blue)] to-blue-600"
              delay="0s"
            />
            <FeatureCard
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              }
              title="Nanopayment Streams"
              description="Real-time USDC payment channels from $0.000001/sec. Perfect for API metering, AI compute billing, and micro-subscriptions."
              gradient="bg-gradient-to-br from-[var(--gainifi-emerald)] to-green-600"
              delay="0.1s"
            />
            <FeatureCard
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              title="USYC Yield Vault"
              description="Earn 5%+ APY on idle USDC via Circle's USYC. Regulated real-world asset yield, redeemable 24/7 with near-instant settlement."
              gradient="bg-gradient-to-br from-[var(--gainifi-violet)] to-purple-600"
              delay="0.2s"
            />
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="relative z-10 py-20 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Built on <span className="gradient-text">Circle&apos;s Full Stack</span>
            </h2>
          </div>

          <div className="glass-card rounded-2xl p-6 md:p-8 font-mono text-sm space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs">gainifi — architecture</span>
            </div>
            <pre className="text-xs md:text-sm overflow-x-auto">
              <code>
                {`┌─────────────────────────────────────────────────────────────┐
│  LAYER 3 — APPLICATION                                       │
│  StableFX Exchange UI · Nanopayment Stream · USYC Vault      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2 — SETTLEMENT & LIQUIDITY                            │
│  StableFX RFQ · PvP Escrow · CCTP V2 · Circle Gateway        │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1 — CHAIN / INFRASTRUCTURE                            │
│  Arc L1 (0.5s finality) · EVM-compatible · USDC gas          │
└─────────────────────────────────────────────────────────────┘`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--gainifi-blue)] to-[var(--gainifi-violet)] flex items-center justify-center text-white font-bold text-[10px]">
              G
            </div>
            <span className="text-sm font-semibold">Gainifi</span>
            <span className="text-xs text-muted-foreground">· Powered by Circle Arc</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a
              href="https://docs.arc.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Arc Docs
            </a>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Testnet Faucet
            </a>
            <a
              href="https://github.com/circlefin/arc-multichain-wallet"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <ThemeSwitcher />
          </div>
        </div>
      </footer>
    </main>
  );
}
