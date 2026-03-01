/**
 * useNanoChannel — React hook for NanoPayment stream management
 * Tracks channel state, computes real-time drain, handles voucher signing.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface NanoChannelState {
    id: string;
    payer: string;
    receiver: string;
    deposit: number;
    withdrawn: number;
    ratePerSecond: number;
    openedAt: number;
    expiresAt: number;
    closed: boolean;
}

export function useNanoChannel(channel?: NanoChannelState) {
    const [currentDrain, setCurrentDrain] = useState(0);
    const [claimable, setClaimable] = useState(0);
    const animRef = useRef<number>();

    // Real-time drain ticker
    useEffect(() => {
        if (!channel || channel.closed) return;

        const tick = () => {
            const now = Date.now() / 1000;
            const elapsed = now - channel.openedAt;
            const totalDrained = elapsed * channel.ratePerSecond + channel.withdrawn;
            const capped = Math.min(totalDrained, channel.deposit);
            setCurrentDrain(capped);
            setClaimable(capped - channel.withdrawn);
            animRef.current = requestAnimationFrame(tick);
        };

        animRef.current = requestAnimationFrame(tick);
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [channel]);

    const percentDrained = channel
        ? Math.min((currentDrain / channel.deposit) * 100, 100)
        : 0;

    const timeRemaining = channel
        ? Math.max(
            channel.deposit / channel.ratePerSecond -
            (Date.now() / 1000 - channel.openedAt),
            0
        )
        : 0;

    return {
        currentDrain,
        claimable,
        percentDrained,
        timeRemaining,
        isLive: channel ? !channel.closed && percentDrained < 100 : false,
    };
}

/**
 * useNanoChannels — manage multiple streams
 */
export function useNanoChannels(channels: NanoChannelState[]) {
    const [totalDrain, setTotalDrain] = useState(0);
    const [activeCount, setActiveCount] = useState(0);

    useEffect(() => {
        const iv = setInterval(() => {
            let total = 0;
            let active = 0;
            const now = Date.now() / 1000;

            channels.forEach((ch) => {
                if (ch.closed) return;
                const elapsed = now - ch.openedAt;
                const drained = Math.min(
                    elapsed * ch.ratePerSecond + ch.withdrawn,
                    ch.deposit
                );
                total += drained;
                if (drained < ch.deposit) active++;
            });

            setTotalDrain(total);
            setActiveCount(active);
        }, 100);

        return () => clearInterval(iv);
    }, [channels]);

    return { totalDrain, activeCount };
}
