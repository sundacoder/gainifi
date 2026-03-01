"use client";

/* ──── Transaction History Page ──── */
export default function HistoryPage() {
  const transactions = [
    {
      id: "tx_001",
      type: "swap" as const,
      pair: "USDC → EURC",
      amount: "$5,000.00",
      received: "€4,617.00",
      time: "2 min ago",
      status: "settled" as const,
      txHash: "0xa1b2...c3d4",
      chain: "Arc Testnet",
    },
    {
      id: "tx_002",
      type: "stream" as const,
      pair: "NanoChannel #7a3f",
      amount: "$1.000000",
      received: "$0.008142",
      time: "Live",
      status: "streaming" as const,
      txHash: "0xe5f6...g7h8",
      chain: "Arc Testnet",
    },
    {
      id: "tx_003",
      type: "vault" as const,
      pair: "USYC Deposit",
      amount: "$2,500.00",
      received: "2,437.66 nfxV",
      time: "1 hour ago",
      status: "settled" as const,
      txHash: "0xi9j0...k1l2",
      chain: "Arc Testnet",
    },
    {
      id: "tx_004",
      type: "swap" as const,
      pair: "EURC → USDC",
      amount: "€3,200.00",
      received: "$3,465.60",
      time: "3 hours ago",
      status: "settled" as const,
      txHash: "0xm3n4...o5p6",
      chain: "Arc Testnet",
    },
    {
      id: "tx_005",
      type: "transfer" as const,
      pair: "Cross-Chain Transfer",
      amount: "$1,000.00",
      received: "$1,000.00",
      time: "5 hours ago",
      status: "settled" as const,
      txHash: "0xq7r8...s9t0",
      chain: "Arc → Base Sepolia",
    },
    {
      id: "tx_006",
      type: "stream" as const,
      pair: "NanoChannel #c1e8",
      amount: "$5.000000",
      received: "$1.042371",
      time: "8 hours ago",
      status: "closed" as const,
      txHash: "0xu1v2...w3x4",
      chain: "Arc Testnet",
    },
    {
      id: "tx_007",
      type: "vault" as const,
      pair: "USYC Withdrawal",
      amount: "500 nfxV",
      received: "$512.80",
      time: "1 day ago",
      status: "settled" as const,
      txHash: "0xy5z6...a7b8",
      chain: "Arc Testnet",
    },
    {
      id: "tx_008",
      type: "swap" as const,
      pair: "USDC → BRLA",
      amount: "$500.00",
      received: "R$2,906.00",
      time: "2 days ago",
      status: "settled" as const,
      txHash: "0xc9d0...e1f2",
      chain: "Arc Testnet",
    },
  ];

  const typeConfig = {
    swap: {
      icon: "⇄",
      color: "bg-blue-500/10 text-blue-400",
      label: "Swap",
    },
    stream: {
      icon: "⚡",
      color: "bg-emerald-500/10 text-emerald-400",
      label: "Stream",
    },
    vault: {
      icon: "◈",
      color: "bg-violet-500/10 text-violet-400",
      label: "Vault",
    },
    transfer: {
      icon: "↗",
      color: "bg-amber-500/10 text-amber-400",
      label: "Transfer",
    },
  };

  const statusConfig = {
    settled: {
      color: "text-[var(--gainifi-emerald)]",
      bg: "bg-[var(--gainifi-emerald)]/10",
    },
    streaming: {
      color: "text-[var(--gainifi-blue)]",
      bg: "bg-[var(--gainifi-blue)]/10",
    },
    closed: {
      color: "text-muted-foreground",
      bg: "bg-secondary/50",
    },
    pending: {
      color: "text-[var(--gainifi-amber)]",
      bg: "bg-amber-500/10",
    },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All swaps, streams, vault operations, and cross-chain transfers
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Swaps", "Streams", "Vault", "Transfers"].map((filter) => (
          <button
            key={filter}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "All"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border border-border/20"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 font-medium">
          <span>Type</span>
          <span>Details</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
          <span className="text-right">Chain</span>
        </div>

        {transactions.map((tx) => {
          const type = typeConfig[tx.type];
          const status =
            statusConfig[tx.status as keyof typeof statusConfig] ||
            statusConfig.settled;

          return (
            <div
              key={tx.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 items-center border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors"
            >
              {/* Type icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${type.color}`}
              >
                {type.icon}
              </div>

              {/* Details */}
              <div>
                <div className="text-sm font-medium">{tx.pair}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                  <span className="font-mono">{tx.txHash}</span>
                  <span>·</span>
                  <span>{tx.time}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className="text-sm font-mono">{tx.amount}</div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  → {tx.received}
                </div>
              </div>

              {/* Status */}
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}
                >
                  {tx.status === "streaming" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-glow" />
                  )}
                  {tx.status.toUpperCase()}
                </span>
              </div>

              {/* Chain */}
              <div className="text-right text-[10px] text-muted-foreground">
                {tx.chain}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
