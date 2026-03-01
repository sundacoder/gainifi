"use client";

import { useState, useEffect, useCallback } from "react";

/* ──── Token Data ──── */
const TOKENS = [
    { symbol: "USDC", name: "USD Coin", flag: "🇺🇸", decimals: 6 },
    { symbol: "EURC", name: "Euro Coin", flag: "🇪🇺", decimals: 6 },
    { symbol: "BRLA", name: "Brazilian Real", flag: "🇧🇷", decimals: 6 },
    { symbol: "MXNB", name: "Mexican Peso", flag: "🇲🇽", decimals: 6 },
    { symbol: "SGDS", name: "Singapore Dollar", flag: "🇸🇬", decimals: 6 },
    { symbol: "GBPC", name: "British Pound", flag: "🇬🇧", decimals: 6 },
];

const FX_RATES: Record<string, number> = {
    "USDC-EURC": 0.9234,
    "EURC-USDC": 1.083,
    "USDC-BRLA": 5.812,
    "BRLA-USDC": 0.172,
    "USDC-MXNB": 17.25,
    "MXNB-USDC": 0.058,
    "USDC-SGDS": 1.345,
    "SGDS-USDC": 0.7435,
    "USDC-GBPC": 0.792,
    "GBPC-USDC": 1.2626,
    "EURC-BRLA": 6.296,
    "BRLA-EURC": 0.1588,
};

/* ──── Token Selector ──── */
function TokenSelector({
    selected,
    onChange,
    exclude,
}: {
    selected: string;
    onChange: (s: string) => void;
    exclude: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-colors text-sm font-medium border border-border/30"
            >
                <span className="text-base">
                    {TOKENS.find((t) => t.symbol === selected)?.flag}
                </span>
                {selected}
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div className="absolute top-full mt-2 right-0 w-48 glass-card rounded-xl border border-border/30 p-1 z-50 shadow-2xl">
                    {TOKENS.filter((t) => t.symbol !== exclude).map((token) => (
                        <button
                            key={token.symbol}
                            onClick={() => {
                                onChange(token.symbol);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-secondary/50 transition-colors ${token.symbol === selected ? "bg-primary/10 text-primary" : ""
                                }`}
                        >
                            <span>{token.flag}</span>
                            <span className="font-medium">{token.symbol}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                                {token.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ──── Exchange Page ──── */
export default function ExchangePage() {
    const [sellToken, setSellToken] = useState("USDC");
    const [buyToken, setBuyToken] = useState("EURC");
    const [sellAmount, setSellAmount] = useState("1000");
    const [status, setStatus] = useState<
        "idle" | "quoting" | "trading" | "settling" | "settled" | "error"
    >("idle");
    const [quoteTimer, setQuoteTimer] = useState(15);
    const [showDetails, setShowDetails] = useState(false);

    const pair = `${sellToken}-${buyToken}`;
    const rate = FX_RATES[pair] || 1;
    const buyAmount = (parseFloat(sellAmount || "0") * rate).toFixed(6);

    // Quote timer
    useEffect(() => {
        if (status !== "idle" || !sellAmount) return;
        setQuoteTimer(15);
        const iv = setInterval(() => {
            setQuoteTimer((t) => {
                if (t <= 1) return 15;
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(iv);
    }, [sellAmount, status, pair]);

    const handleSwapTokens = useCallback(() => {
        const s = sellToken;
        setSellToken(buyToken);
        setBuyToken(s);
    }, [sellToken, buyToken]);

    const handleExecute = useCallback(async () => {
        setStatus("quoting");
        await new Promise((r) => setTimeout(r, 800));
        setStatus("trading");
        await new Promise((r) => setTimeout(r, 1200));
        setStatus("settling");
        await new Promise((r) => setTimeout(r, 600));
        setStatus("settled");
        setTimeout(() => setStatus("idle"), 3000);
    }, []);

    return (
        <div className="max-w-lg mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">StableFX Exchange</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Atomic PvP stablecoin swaps · Zero counterparty risk
                </p>
            </div>

            {/* Exchange Card */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
                {/* Sell */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>You Sell</span>
                        <span>Balance: 12,450.82 USDC</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/20 focus-within:border-primary/30 transition-colors">
                        <input
                            type="text"
                            value={sellAmount}
                            onChange={(e) =>
                                setSellAmount(e.target.value.replace(/[^0-9.]/g, ""))
                            }
                            className="flex-1 bg-transparent text-2xl font-bold outline-none font-mono placeholder:text-muted-foreground/40"
                            placeholder="0.00"
                            id="sell-amount-input"
                        />
                        <TokenSelector
                            selected={sellToken}
                            onChange={setSellToken}
                            exclude={buyToken}
                        />
                    </div>
                </div>

                {/* Swap button */}
                <div className="flex justify-center -my-1 relative z-10">
                    <button
                        onClick={handleSwapTokens}
                        className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center hover:bg-secondary/50 transition-all hover:scale-110 shadow-lg"
                        id="swap-direction-btn"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <polyline points="19 12 12 19 5 12" />
                        </svg>
                    </button>
                </div>

                {/* Buy */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>You Receive</span>
                        <span>Balance: 3,200.00 {buyToken}</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/20">
                        <div className="flex-1 text-2xl font-bold font-mono text-muted-foreground">
                            {parseFloat(buyAmount) > 0 ? buyAmount : "0.00"}
                        </div>
                        <TokenSelector
                            selected={buyToken}
                            onChange={setBuyToken}
                            exclude={sellToken}
                        />
                    </div>
                </div>

                {/* Rate + Details */}
                <div className="space-y-3">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span>
                            1 {sellToken} = {rate.toFixed(6)} {buyToken}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                Quote refreshes in {quoteTimer}s
                            </span>
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`transition-transform ${showDetails ? "rotate-180" : ""}`}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </button>

                    {showDetails && (
                        <div className="space-y-2 p-3 rounded-xl bg-secondary/20 text-xs border border-border/10">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Protocol</span>
                                <span className="font-medium">Circle StableFX (RFQ → PvP)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Settlement</span>
                                <span className="font-medium text-[var(--gainifi-emerald)]">
                                    Atomic (0.5s on Arc)
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Permit Type</span>
                                <span className="font-medium">EIP-2612 / Permit2</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Counterparty Risk</span>
                                <span className="font-medium text-[var(--gainifi-emerald)]">
                                    None (PvP Escrow)
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Gas</span>
                                <span className="font-medium">Paid in USDC on Arc</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Slippage</span>
                                <span className="font-medium">0% (Quoted Rate)</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Execute Button */}
                <button
                    onClick={handleExecute}
                    disabled={
                        status !== "idle" || !sellAmount || parseFloat(sellAmount) <= 0
                    }
                    className={`w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 ${status === "settled"
                            ? "bg-[var(--gainifi-emerald)] text-white"
                            : status !== "idle"
                                ? "bg-primary/80 text-primary-foreground animate-pulse"
                                : "bg-gradient-to-r from-[var(--gainifi-blue)] to-[var(--gainifi-violet)] text-white hover:opacity-90 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    id="execute-swap-btn"
                >
                    {status === "idle" && `Swap ${sellToken} → ${buyToken}`}
                    {status === "quoting" && "⏳ Requesting RFQ Quote..."}
                    {status === "trading" && "🔐 Signing PvP Trade Intent..."}
                    {status === "settling" && "⚡ Settling on Arc (0.5s)..."}
                    {status === "settled" && "✓ Trade Settled!"}
                    {status === "error" && "✕ Trade Failed — Retry"}
                </button>

                {/* Settlement flow indicator */}
                {status !== "idle" && status !== "settled" && (
                    <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
                        <span
                            className={
                                status === "quoting"
                                    ? "text-primary font-medium"
                                    : "text-[var(--gainifi-emerald)]"
                            }
                        >
                            Quote
                        </span>
                        <span>→</span>
                        <span
                            className={
                                status === "trading"
                                    ? "text-primary font-medium"
                                    : status === "settling"
                                        ? "text-[var(--gainifi-emerald)]"
                                        : "text-muted-foreground/40"
                            }
                        >
                            Sign
                        </span>
                        <span>→</span>
                        <span
                            className={
                                status === "settling"
                                    ? "text-primary font-medium animate-pulse"
                                    : "text-muted-foreground/40"
                            }
                        >
                            Settle
                        </span>
                    </div>
                )}
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-lg font-bold gradient-text">$0</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        Slippage
                    </div>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <div className="text-lg font-bold gradient-text-emerald">0.5s</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        Finality
                    </div>
                </div>
            </div>

            {/* Supported pairs */}
            <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-3">Supported FX Pairs</h3>
                <div className="grid grid-cols-3 gap-2">
                    {Object.keys(FX_RATES).map((p) => {
                        const [from, to] = p.split("-");
                        const fromToken = TOKENS.find((t) => t.symbol === from);
                        const toToken = TOKENS.find((t) => t.symbol === to);
                        return (
                            <button
                                key={p}
                                onClick={() => {
                                    setSellToken(from);
                                    setBuyToken(to);
                                }}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${pair === p
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "hover:bg-secondary/50 text-muted-foreground"
                                    }`}
                            >
                                <span className="text-[10px]">{fromToken?.flag}</span>
                                <span className="font-mono">
                                    {from}→{to}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
