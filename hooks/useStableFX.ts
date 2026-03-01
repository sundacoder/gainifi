/**
 * useStableFX — React hook for StableFX exchange operations
 * Manages the full RFQ → Trade → Settlement lifecycle.
 */

"use client";

import { useState, useCallback } from "react";

export type SwapStatus =
    | "idle"
    | "quoting"
    | "trading"
    | "funding"
    | "settling"
    | "settled"
    | "error";

export interface StableFXQuote {
    quoteId: string;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
    price: string;
    expiresAt: number;
}

export function useStableFX() {
    const [quote, setQuote] = useState<StableFXQuote | null>(null);
    const [tradeId, setTradeId] = useState<string | null>(null);
    const [status, setStatus] = useState<SwapStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const getQuote = useCallback(
        async (sellToken: string, buyToken: string, sellAmount: string) => {
            setStatus("quoting");
            setError(null);
            try {
                const res = await fetch("/api/stablefx/quote", {
                    method: "POST",
                    body: JSON.stringify({ sellToken, buyToken, sellAmount }),
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setQuote(data);
                setStatus("idle");
                return data;
            } catch (e: any) {
                setError(e.message);
                setStatus("error");
                throw e;
            }
        },
        []
    );

    const executeSwap = useCallback(async (quoteId: string) => {
        setStatus("trading");
        setError(null);
        try {
            // Step 1: Create trade
            const tradeRes = await fetch("/api/stablefx/trade", {
                method: "POST",
                body: JSON.stringify({ quoteId }),
                headers: { "Content-Type": "application/json" },
            });
            const tradeData = await tradeRes.json();
            if (!tradeRes.ok) throw new Error(tradeData.error);
            setTradeId(tradeData.tradeId);

            // Step 2: Poll for settlement (Arc 0.5s finality)
            setStatus("settling");
            let settled = false;
            let attempts = 0;
            while (!settled && attempts < 20) {
                await new Promise((r) => setTimeout(r, 500));
                const statusRes = await fetch(
                    `/api/stablefx/trade?id=${tradeData.tradeId}`
                );
                const statusData = await statusRes.json();
                if (statusData.status === "settled") {
                    settled = true;
                    setTxHash(statusData.settlementTxHash);
                    setStatus("settled");
                }
                attempts++;
            }
            if (!settled) throw new Error("Settlement timeout");
        } catch (e: any) {
            setError(e.message);
            setStatus("error");
            throw e;
        }
    }, []);

    const reset = useCallback(() => {
        setQuote(null);
        setTradeId(null);
        setStatus("idle");
        setError(null);
        setTxHash(null);
    }, []);

    return {
        quote,
        tradeId,
        status,
        error,
        txHash,
        getQuote,
        executeSwap,
        reset,
    };
}
