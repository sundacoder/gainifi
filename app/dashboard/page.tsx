"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ──── Mini Nano Counter ──── */
function MiniNanoCounter({ rate }: { rate: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setVal((v) => v + rate), 100);
    return () => clearInterval(iv);
  }, [rate]);
  return (
    <span className="nano-ticker font-mono text-sm gradient-text-emerald">
      ${val.toFixed(6)}
    </span>
  );
}

/* ──── Stat Card ──── */
function StatCard({
  label,
  value,
  change,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  change?: string;
  icon: string;
  gradient: string;
}) {
  const isPositive = change && !change.startsWith("-");
  return (
    <div className="glass-card rounded-2xl p-5 hover:scale-[1.01] transition-transform duration-300">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg ${gradient}`}
        >
          {icon}
        </div>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${isPositive
                ? "bg-[var(--gainifi-emerald)]/10 text-[var(--gainifi-emerald)]"
                : "bg-red-500/10 text-red-400"
              }`}
          >
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

/* ──── Activity Item ──── */
function ActivityItem({
  type,
  pair,
  amount,
  time,
  status,
}: {
  type: string;
  pair: string;
  amount: string;
  time: string;
  status: "settled" | "streaming" | "pending";
}) {
  const statusColor = {
    settled: "text-[var(--gainifi-emerald)]",
    streaming: "text-[var(--gainifi-blue)]",
    pending: "text-[var(--gainifi-amber)]",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${type === "swap"
              ? "bg-blue-500/10 text-blue-400"
              : type === "stream"
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-violet-500/10 text-violet-400"
            }`}
        >
          {type === "swap" ? "⇄" : type === "stream" ? "⚡" : "◈"}
        </div>
        <div>
          <div className="text-sm font-medium">{pair}</div>
          <div className="text-xs text-muted-foreground">{time}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono">{amount}</div>
        <div className={`text-[10px] font-medium ${statusColor[status]}`}>
          {status === "streaming" ? "● LIVE" : status.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

/* ──── Dashboard Overview ──── */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your unified stablecoin portfolio on Arc
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="$"
          label="Unified Balance"
          value="$12,450.82"
          change="+4.2%"
          gradient="bg-gradient-to-br from-[var(--gainifi-blue)] to-blue-600"
        />
        <StatCard
          icon="⇄"
          label="24h Volume"
          value="$89,234"
          change="+12.5%"
          gradient="bg-gradient-to-br from-[var(--gainifi-violet)] to-purple-600"
        />
        <StatCard
          icon="⚡"
          label="Active Streams"
          value="3"
          gradient="bg-gradient-to-br from-[var(--gainifi-emerald)] to-green-600"
        />
        <StatCard
          icon="◈"
          label="Vault Yield (APY)"
          value="5.24%"
          change="+0.12%"
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick action cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/exchange"
              className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gainifi-blue)] to-blue-600 flex items-center justify-center text-white">
                  ⇄
                </div>
                <div>
                  <div className="text-sm font-semibold">Swap</div>
                  <div className="text-[10px] text-muted-foreground">
                    StableFX
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Swap USDC ↔ EURC at institutional FX rates
              </p>
            </Link>

            <Link
              href="/dashboard/stream"
              className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gainifi-emerald)] to-green-600 flex items-center justify-center text-white">
                  ⚡
                </div>
                <div>
                  <div className="text-sm font-semibold">Stream</div>
                  <div className="text-[10px] text-muted-foreground">
                    Nanopay
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Open a $0.000001/sec payment channel
              </p>
            </Link>

            <Link
              href="/dashboard/vault"
              className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gainifi-violet)] to-purple-600 flex items-center justify-center text-white">
                  ◈
                </div>
                <div>
                  <div className="text-sm font-semibold">Deposit</div>
                  <div className="text-[10px] text-muted-foreground">
                    USYC Vault
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Earn 5.2% APY on idle USDC
              </p>
            </Link>
          </div>

          {/* Active Streams Panel */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Active Streams</h2>
              <Link
                href="/dashboard/stream"
                className="text-xs text-primary hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: "API Access — Compute Node",
                  rate: 0.000001,
                  deposited: "1.000000",
                  elapsed: "2h 14m",
                },
                {
                  name: "Content Subscription — Blog",
                  rate: 0.000005,
                  deposited: "5.000000",
                  elapsed: "45m",
                },
                {
                  name: "Data Feed — Oracle",
                  rate: 0.00001,
                  deposited: "10.000000",
                  elapsed: "1h 30m",
                },
              ].map((stream, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/30 border border-border/20"
                >
                  <div>
                    <div className="text-sm font-medium">{stream.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      ${stream.rate}/sec · Deposited: ${stream.deposited} ·{" "}
                      {stream.elapsed}
                    </div>
                  </div>
                  <div className="text-right">
                    <MiniNanoCounter rate={stream.rate} />
                    <div className="text-[10px] text-[var(--gainifi-emerald)] font-medium mt-0.5">
                      ● STREAMING
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar — Activity */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Activity</h2>
            <Link
              href="/dashboard/history"
              className="text-xs text-primary hover:underline"
            >
              View All
            </Link>
          </div>

          <div>
            <ActivityItem
              type="swap"
              pair="USDC → EURC"
              amount="$5,000.00"
              time="2 min ago"
              status="settled"
            />
            <ActivityItem
              type="stream"
              pair="NanoChannel #7a3f"
              amount="$0.008142"
              time="Live"
              status="streaming"
            />
            <ActivityItem
              type="vault"
              pair="USYC Deposit"
              amount="$2,500.00"
              time="1 hour ago"
              status="settled"
            />
            <ActivityItem
              type="swap"
              pair="EURC → USDC"
              amount="€3,200.00"
              time="3 hours ago"
              status="settled"
            />
            <ActivityItem
              type="stream"
              pair="NanoChannel #c1e8"
              amount="$1.042371"
              time="Closed"
              status="settled"
            />
          </div>

          {/* Gateway Balance */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              Gateway Balance
            </div>
            <div className="space-y-2">
              {[
                { chain: "Arc Testnet", balance: "$8,200.50", color: "blue" },
                { chain: "Base Sepolia", balance: "$2,150.32", color: "violet" },
                {
                  chain: "Avalanche Fuji",
                  balance: "$2,100.00",
                  color: "emerald",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${item.color === "blue"
                          ? "bg-blue-400"
                          : item.color === "violet"
                            ? "bg-violet-400"
                            : "bg-emerald-400"
                        }`}
                    />
                    <span className="text-muted-foreground text-xs">
                      {item.chain}
                    </span>
                  </div>
                  <span className="font-mono text-xs">{item.balance}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
