"use client";

import { useState, useEffect, useCallback } from "react";

/* ──── Types ──── */
interface StreamChannel {
    id: string;
    name: string;
    receiver: string;
    deposit: number;
    ratePerSecond: number;
    startedAt: number;
    duration: number;
    withdrawn: number;
    status: "streaming" | "closed" | "expired";
}

/* ──── Live Counter ──── */
function LiveDrain({
    rate,
    startedAt,
    withdrawn,
}: {
    rate: number;
    startedAt: number;
    withdrawn: number;
}) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const iv = setInterval(() => {
            const elapsed = (Date.now() - startedAt) / 1000;
            setVal(elapsed * rate + withdrawn);
        }, 50);
        return () => clearInterval(iv);
    }, [rate, startedAt, withdrawn]);

    return (
        <span className="nano-ticker font-mono text-lg font-bold gradient-text-emerald">
            ${val.toFixed(6)}
        </span>
    );
}

/* ──── Progress Bar ──── */
function StreamProgress({
    rate,
    startedAt,
    deposit,
    withdrawn,
}: {
    rate: number;
    startedAt: number;
    deposit: number;
    withdrawn: number;
}) {
    const [pct, setPct] = useState(0);
    useEffect(() => {
        const iv = setInterval(() => {
            const elapsed = (Date.now() - startedAt) / 1000;
            const drained = elapsed * rate + withdrawn;
            setPct(Math.min((drained / deposit) * 100, 100));
        }, 100);
        return () => clearInterval(iv);
    }, [rate, startedAt, deposit, withdrawn]);

    return (
        <div className="w-full h-2 rounded-full bg-secondary/50 overflow-hidden">
            <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--gainifi-emerald)] to-green-400 transition-all duration-100"
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

/* ──── Mock Data ──── */
const MOCK_STREAMS: StreamChannel[] = [
    {
        id: "0x7a3f...e1c2",
        name: "API Access — Compute Node",
        receiver: "0x742d...35Cc",
        deposit: 1.0,
        ratePerSecond: 0.000001,
        startedAt: Date.now() - 8040000,
        duration: 86400,
        withdrawn: 0.0001,
        status: "streaming",
    },
    {
        id: "0xc1e8...9f3d",
        name: "Content Subscription — Blog",
        receiver: "0x1234...abcd",
        deposit: 5.0,
        ratePerSecond: 0.000005,
        startedAt: Date.now() - 2700000,
        duration: 604800,
        withdrawn: 0.0,
        status: "streaming",
    },
    {
        id: "0xa4b2...7e1f",
        name: "Data Feed — Oracle",
        receiver: "0x5678...efgh",
        deposit: 10.0,
        ratePerSecond: 0.00001,
        startedAt: Date.now() - 5400000,
        duration: 259200,
        withdrawn: 0.002,
        status: "streaming",
    },
];

/* ──── Stream Card ──── */
function StreamCard({ stream }: { stream: StreamChannel }) {
    const isLive = stream.status === "streaming";

    return (
        <div className="glass-card rounded-2xl p-5 space-y-4 hover:scale-[1.005] transition-transform duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{stream.name}</h3>
                        {isLive && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--gainifi-emerald)]/10 text-[var(--gainifi-emerald)] text-[10px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gainifi-emerald)] animate-pulse-glow" />
                                LIVE
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                        Channel: {stream.id}
                    </div>
                </div>
                <div className="text-right">
                    {isLive ? (
                        <LiveDrain
                            rate={stream.ratePerSecond}
                            startedAt={stream.startedAt}
                            withdrawn={stream.withdrawn}
                        />
                    ) : (
                        <span className="text-lg font-bold font-mono text-muted-foreground">
                            ${stream.withdrawn.toFixed(6)}
                        </span>
                    )}
                    <div className="text-[10px] text-muted-foreground">drained</div>
                </div>
            </div>

            {isLive && (
                <StreamProgress
                    rate={stream.ratePerSecond}
                    startedAt={stream.startedAt}
                    deposit={stream.deposit}
                    withdrawn={stream.withdrawn}
                />
            )}

            <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                    <div className="text-muted-foreground">Rate</div>
                    <div className="font-mono font-medium">
                        ${stream.ratePerSecond}/s
                    </div>
                </div>
                <div>
                    <div className="text-muted-foreground">Deposit</div>
                    <div className="font-mono font-medium">
                        ${stream.deposit.toFixed(6)}
                    </div>
                </div>
                <div>
                    <div className="text-muted-foreground">Receiver</div>
                    <div className="font-mono font-medium">{stream.receiver}</div>
                </div>
            </div>

            {isLive && (
                <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl text-xs font-medium bg-secondary/50 hover:bg-secondary transition-colors border border-border/20">
                        Claim Voucher
                    </button>
                    <button className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10">
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

/* ──── New Stream Form ──── */
function NewStreamForm({ onClose }: { onClose: () => void }) {
    const [receiver, setReceiver] = useState("");
    const [deposit, setDeposit] = useState("1.000000");
    const [rate, setRate] = useState("0.000001");
    const [duration, setDuration] = useState("86400");
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        setCreating(true);
        await new Promise((r) => setTimeout(r, 1500));
        setCreating(false);
        onClose();
    };

    const presets = [
        { label: "$0.000001/s", rate: "0.000001", desc: "Micro (API)" },
        { label: "$0.000010/s", rate: "0.000010", desc: "Standard" },
        { label: "$0.000100/s", rate: "0.000100", desc: "Premium" },
        { label: "$0.001000/s", rate: "0.001000", desc: "High-freq" },
    ];

    return (
        <div className="glass-card rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Open NanoChannel</h3>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                        Receiver Address
                    </label>
                    <input
                        type="text"
                        value={receiver}
                        onChange={(e) => setReceiver(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/20 text-sm font-mono outline-none focus:border-primary/30 transition-colors"
                        id="receiver-address-input"
                    />
                </div>

                <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                        USDC Deposit
                    </label>
                    <input
                        type="text"
                        value={deposit}
                        onChange={(e) =>
                            setDeposit(e.target.value.replace(/[^0-9.]/g, ""))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/20 text-sm font-mono outline-none focus:border-primary/30 transition-colors"
                        id="deposit-amount-input"
                    />
                </div>

                <div>
                    <label className="text-xs text-muted-foreground block mb-2">
                        Drain Rate (USDC/sec)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {presets.map((p) => (
                            <button
                                key={p.rate}
                                onClick={() => setRate(p.rate)}
                                className={`py-2 px-2 rounded-xl text-center transition-all ${rate === p.rate
                                        ? "bg-primary/10 border border-primary/20 text-primary"
                                        : "bg-secondary/30 border border-border/20 text-muted-foreground hover:bg-secondary/50"
                                    }`}
                            >
                                <div className="text-[10px] font-mono font-medium">
                                    {p.label}
                                </div>
                                <div className="text-[9px] text-muted-foreground mt-0.5">
                                    {p.desc}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">
                        Duration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: "1 Hour", val: "3600" },
                            { label: "1 Day", val: "86400" },
                            { label: "1 Week", val: "604800" },
                        ].map((d) => (
                            <button
                                key={d.val}
                                onClick={() => setDuration(d.val)}
                                className={`py-2 rounded-xl text-xs font-medium transition-all ${duration === d.val
                                        ? "bg-primary/10 border border-primary/20 text-primary"
                                        : "bg-secondary/30 border border-border/20 text-muted-foreground hover:bg-secondary/50"
                                    }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cost summary */}
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/10 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-mono font-medium">${deposit} USDC</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Drain</span>
                        <span className="font-mono">
                            ${(parseFloat(rate) * parseInt(duration)).toFixed(6)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract</span>
                        <span className="font-mono text-[var(--gainifi-emerald)]">
                            NanoChannel.sol
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={creating || !receiver}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[var(--gainifi-emerald)] to-green-500 text-white font-semibold transition-all hover:opacity-90 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="open-channel-btn"
                >
                    {creating ? "⚡ Opening NanoChannel..." : "Open NanoChannel"}
                </button>
            </div>
        </div>
    );
}

/* ──── Main Stream Page ──── */
export default function StreamPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [totalDrained, setTotalDrained] = useState(0);

    // Aggregate total drained
    useEffect(() => {
        const iv = setInterval(() => {
            let total = 0;
            MOCK_STREAMS.forEach((s) => {
                if (s.status === "streaming") {
                    const elapsed = (Date.now() - s.startedAt) / 1000;
                    total += elapsed * s.ratePerSecond + s.withdrawn;
                }
            });
            setTotalDrained(total);
        }, 100);
        return () => clearInterval(iv);
    }, []);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Nanopayment Streams</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Real-time USDC payment channels · $0.000001/sec resolution
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--gainifi-emerald)] to-green-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                    id="toggle-create-stream"
                >
                    {showCreate ? "Cancel" : "+ New Stream"}
                </button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-4 text-center">
                    <div className="nano-ticker font-mono text-xl font-bold gradient-text-emerald">
                        ${totalDrained.toFixed(6)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        Total Drained
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold gradient-text">
                        {MOCK_STREAMS.filter((s) => s.status === "streaming").length}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        Active Channels
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                    <div className="text-xl font-bold">
                        ${MOCK_STREAMS.reduce((s, c) => s + c.deposit, 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        Total Locked
                    </div>
                </div>
            </div>

            {/* Create form */}
            {showCreate && <NewStreamForm onClose={() => setShowCreate(false)} />}

            {/* Stream list */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Channels
                </h2>
                {MOCK_STREAMS.filter((s) => s.status === "streaming").map((stream) => (
                    <StreamCard key={stream.id} stream={stream} />
                ))}
            </div>

            {/* How it works */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-4">How NanoChannels Work</h3>
                <div className="grid grid-cols-4 gap-4 text-center text-xs">
                    {[
                        {
                            step: "1",
                            label: "Deposit",
                            desc: "Lock USDC in channel",
                            color: "blue",
                        },
                        {
                            step: "2",
                            label: "Stream",
                            desc: "Rate drains per second",
                            color: "emerald",
                        },
                        {
                            step: "3",
                            label: "Voucher",
                            desc: "Payer signs off-chain",
                            color: "violet",
                        },
                        {
                            step: "4",
                            label: "Claim",
                            desc: "Receiver claims on-chain",
                            color: "amber",
                        },
                    ].map((s) => (
                        <div key={s.step}>
                            <div
                                className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold ${s.color === "blue"
                                        ? "bg-blue-500"
                                        : s.color === "emerald"
                                            ? "bg-emerald-500"
                                            : s.color === "violet"
                                                ? "bg-violet-500"
                                                : "bg-amber-500"
                                    }`}
                            >
                                {s.step}
                            </div>
                            <div className="font-medium">{s.label}</div>
                            <div className="text-muted-foreground text-[10px] mt-0.5">
                                {s.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
