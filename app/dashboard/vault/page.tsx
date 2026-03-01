"use client";

import { useState, useEffect } from "react";

/* ──── Yield Ticker ──── */
function YieldTicker({ principal, apy }: { principal: number; apy: number }) {
    const [earned, setEarned] = useState(0);
    useEffect(() => {
        const ratePerMs = (principal * apy) / (365.25 * 24 * 60 * 60 * 1000);
        const start = Date.now();
        const iv = setInterval(() => {
            setEarned((Date.now() - start) * ratePerMs);
        }, 50);
        return () => clearInterval(iv);
    }, [principal, apy]);

    return (
        <span className="nano-ticker font-mono text-sm gradient-text-emerald">
            +${earned.toFixed(8)}
        </span>
    );
}

/* ──── Main Vault Page ──── */
export default function VaultPage() {
    const [depositAmount, setDepositAmount] = useState("1000");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
    const [processing, setProcessing] = useState(false);

    // Mock vault data
    const vaultData = {
        tvl: 2450000,
        apy: 0.0524,
        userDeposited: 5000,
        userShares: 4875.32,
        usycPrice: 1.0256,
        totalYieldEarned: 42.18,
    };

    const handleAction = async () => {
        setProcessing(true);
        await new Promise((r) => setTimeout(r, 2000));
        setProcessing(false);
    };

    const projectedYield =
        activeTab === "deposit"
            ? (parseFloat(depositAmount || "0") * vaultData.apy).toFixed(2)
            : "0.00";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">USYC Yield Vault</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Earn regulated yield on idle USDC via Circle&apos;s USYC ·
                    Redeemable 24/7
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">TVL</div>
                    <div className="text-xl font-bold">
                        ${(vaultData.tvl / 1e6).toFixed(2)}M
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">APY</div>
                    <div className="text-xl font-bold gradient-text-emerald">
                        {(vaultData.apy * 100).toFixed(2)}%
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">
                        USYC Price
                    </div>
                    <div className="text-xl font-bold">
                        ${vaultData.usycPrice.toFixed(4)}
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">
                        Your Yield
                    </div>
                    <div className="text-xl font-bold gradient-text-emerald">
                        ${vaultData.totalYieldEarned.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Main card */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Deposit / Withdraw form */}
                <div className="lg:col-span-3 glass-card rounded-3xl p-6 space-y-5">
                    {/* Tabs */}
                    <div className="flex gap-1 p-1 rounded-xl bg-secondary/30">
                        <button
                            onClick={() => setActiveTab("deposit")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "deposit"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            id="deposit-tab"
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => setActiveTab("withdraw")}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "withdraw"
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            id="withdraw-tab"
                        >
                            Withdraw
                        </button>
                    </div>

                    {activeTab === "deposit" ? (
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>USDC Amount</span>
                                    <span>Available: 12,450.82 USDC</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/20 focus-within:border-primary/30 transition-colors">
                                    <input
                                        type="text"
                                        value={depositAmount}
                                        onChange={(e) =>
                                            setDepositAmount(
                                                e.target.value.replace(/[^0-9.]/g, "")
                                            )
                                        }
                                        className="flex-1 bg-transparent text-xl font-bold outline-none font-mono"
                                        placeholder="0.00"
                                        id="vault-deposit-input"
                                    />
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm font-medium">
                                        🇺🇸 USDC
                                    </div>
                                </div>

                                {/* Quick amounts */}
                                <div className="flex gap-2 mt-2">
                                    {["100", "500", "1000", "5000"].map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setDepositAmount(amt)}
                                            className={`px-3 py-1 rounded-lg text-xs transition-colors ${depositAmount === amt
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border border-border/20"
                                                }`}
                                        >
                                            ${amt}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setDepositAmount("12450.82")}
                                        className="px-3 py-1 rounded-lg text-xs bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border border-border/20"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>

                            {/* Projected yield */}
                            <div className="p-4 rounded-xl bg-[var(--gainifi-emerald)]/5 border border-[var(--gainifi-emerald)]/10 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        Projected Annual Yield
                                    </span>
                                    <span className="font-mono font-medium text-[var(--gainifi-emerald)]">
                                        ${projectedYield} / year
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        USYC Shares (est.)
                                    </span>
                                    <span className="font-mono">
                                        {(
                                            parseFloat(depositAmount || "0") / vaultData.usycPrice
                                        ).toFixed(4)}{" "}
                                        nfxV
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Vault Contract</span>
                                    <span className="font-mono text-[var(--gainifi-violet)]">
                                        USYCVault.sol
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                    <span>Vault Shares</span>
                                    <span>
                                        Available: {vaultData.userShares.toFixed(2)} nfxV
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/20 focus-within:border-primary/30 transition-colors">
                                    <input
                                        type="text"
                                        value={withdrawAmount}
                                        onChange={(e) =>
                                            setWithdrawAmount(
                                                e.target.value.replace(/[^0-9.]/g, "")
                                            )
                                        }
                                        className="flex-1 bg-transparent text-xl font-bold outline-none font-mono"
                                        placeholder="0.00"
                                        id="vault-withdraw-input"
                                    />
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm font-medium">
                                        ◈ nfxV
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-secondary/20 border border-border/10 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        You Receive (est.)
                                    </span>
                                    <span className="font-mono font-medium">
                                        $
                                        {(
                                            parseFloat(withdrawAmount || "0") * vaultData.usycPrice
                                        ).toFixed(6)}{" "}
                                        USDC
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Redemption
                                    </span>
                                    <span className="font-mono text-[var(--gainifi-emerald)]">
                                        Near-instant via Circle
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAction}
                        disabled={processing}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--gainifi-violet)] to-purple-500 text-white font-semibold transition-all hover:opacity-90 shadow-xl shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        id="vault-action-btn"
                    >
                        {processing
                            ? activeTab === "deposit"
                                ? "⏳ Subscribing USYC..."
                                : "⏳ Redeeming USYC..."
                            : activeTab === "deposit"
                                ? "Deposit USDC → USYC Vault"
                                : "Withdraw Vault → USDC"}
                    </button>
                </div>

                {/* Your Position */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-card rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold">Your Position</h3>

                        <div className="text-center py-4">
                            <div className="text-3xl font-bold">
                                ${(vaultData.userDeposited + vaultData.totalYieldEarned).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Total Value (USDC + Yield)
                            </div>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-2 border-b border-border/20">
                                <span className="text-muted-foreground">Deposited</span>
                                <span className="font-mono">
                                    ${vaultData.userDeposited.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/20">
                                <span className="text-muted-foreground">Vault Shares</span>
                                <span className="font-mono">
                                    {vaultData.userShares.toFixed(4)} nfxV
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border/20">
                                <span className="text-muted-foreground">Yield Earned</span>
                                <span className="font-mono text-[var(--gainifi-emerald)]">
                                    ${vaultData.totalYieldEarned.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">
                                    Real-time Yield
                                </span>
                                <YieldTicker
                                    principal={vaultData.userDeposited}
                                    apy={vaultData.apy}
                                />
                            </div>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="glass-card rounded-2xl p-5">
                        <h3 className="text-sm font-semibold mb-3">How USYC Vault Works</h3>
                        <div className="space-y-3 text-xs text-muted-foreground">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    1
                                </div>
                                <p>
                                    Deposit USDC → vault subscribes to Circle USYC (regulated
                                    real-world asset yield)
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    2
                                </div>
                                <p>
                                    Receive nfxV vault shares proportional to USYC deposited.
                                    APY accrues continuously.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    3
                                </div>
                                <p>
                                    Withdraw anytime: burn nfxV → redeem USYC → receive USDC
                                    with accrued yield. 24/7.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
