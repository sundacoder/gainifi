/**
 * NanoPayment Service — Stream orchestration layer
 * Maps directly to the NanoChannel.sol contract interface.
 * 
 * Mental Model: A leaky bucket — payer deposits USDC, receiver drains
 * it continuously at a fixed rate via signed vouchers.
 * On Arc: USDC is the gas token → predictable $-denominated fees.
 */

import {
    arcTestnet,
    USDC_ADDRESSES,
} from "@/lib/circle/gateway-sdk";

/* ──── NanoChannel ABI (matches NanoChannel.sol) ──── */
export const NANO_CHANNEL_ABI = [
    {
        type: "function",
        name: "openChannel",
        inputs: [
            { name: "receiver", type: "address" },
            { name: "deposit", type: "uint256" },
            { name: "ratePerSecond", type: "uint256" },
            { name: "duration", type: "uint256" },
        ],
        outputs: [{ name: "id", type: "bytes32" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "claimVoucher",
        inputs: [
            { name: "id", type: "bytes32" },
            { name: "cumulative", type: "uint256" },
            { name: "sig", type: "bytes" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "closeExpired",
        inputs: [{ name: "id", type: "bytes32" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "channels",
        inputs: [{ name: "id", type: "bytes32" }],
        outputs: [
            { name: "payer", type: "address" },
            { name: "receiver", type: "address" },
            { name: "deposit", type: "uint256" },
            { name: "withdrawn", type: "uint256" },
            { name: "ratePerSecond", type: "uint256" },
            { name: "openedAt", type: "uint256" },
            { name: "expiresAt", type: "uint256" },
            { name: "closed", type: "bool" },
        ],
        stateMutability: "view",
    },
    {
        type: "event",
        name: "ChannelOpened",
        inputs: [
            { name: "id", type: "bytes32", indexed: true },
            { name: "payer", type: "address" },
            { name: "receiver", type: "address" },
        ],
    },
    {
        type: "event",
        name: "VoucherClaimed",
        inputs: [
            { name: "id", type: "bytes32", indexed: true },
            { name: "amount", type: "uint256" },
        ],
    },
    {
        type: "event",
        name: "ChannelClosed",
        inputs: [
            { name: "id", type: "bytes32", indexed: true },
            { name: "refund", type: "uint256" },
        ],
    },
] as const;

/* ──── Types ──── */
export interface NanoChannel {
    id: string;
    payer: string;
    receiver: string;
    deposit: bigint;
    withdrawn: bigint;
    ratePerSecond: bigint;
    openedAt: number;
    expiresAt: number;
    closed: boolean;
}

export interface OpenChannelParams {
    receiver: string;
    depositUsdc: bigint; // e.g. 1_000_000n = $1 USDC (6 decimals)
    ratePerSecond: bigint; // e.g. 1n = $0.000001/s (1 micro-USDC)
    durationSeconds: number;
}

/* ──── Service Functions ──── */

/**
 * Compute claimable USDC right now on a streaming channel.
 * @param ratePerSecond — micro-USDC per second
 * @param openedAt — unix timestamp when channel opened
 * @param withdrawn — total already claimed by receiver
 * @returns claimable amount in micro-USDC
 */
export function claimableNow(
    ratePerSecond: bigint,
    openedAt: number,
    withdrawn: bigint
): bigint {
    const elapsed = BigInt(Math.floor(Date.now() / 1000) - openedAt);
    return elapsed * ratePerSecond - withdrawn;
}

/**
 * Compute the hash for a voucher message (matches NanoChannel._verifySig)
 */
export function voucherMessageHash(
    channelId: string,
    cumulativeAmount: bigint
): string {
    // keccak256(abi.encodePacked(id, amount))
    // In production, this would use viem's encodePacked + keccak256
    return `voucher:${channelId}:${cumulativeAmount.toString()}`;
}

/**
 * Format a micro-USDC amount for display
 * 1 USDC = 1,000,000 micro-USDC (6 decimals)
 */
export function formatMicroUsdc(amount: bigint): string {
    const whole = amount / 1_000_000n;
    const frac = amount % 1_000_000n;
    return `${whole}.${frac.toString().padStart(6, "0")}`;
}

/**
 * Parse a USDC string amount to micro-USDC bigint
 */
export function parseMicroUsdc(amount: string): bigint {
    const [whole = "0", frac = "0"] = amount.split(".");
    const fracPadded = frac.padEnd(6, "0").slice(0, 6);
    return BigInt(whole) * 1_000_000n + BigInt(fracPadded);
}

/* ──── Contract Config ──── */
export const NANO_CHANNEL_CONFIG = {
    chainId: arcTestnet.id,
    usdcAddress: USDC_ADDRESSES.arcTestnet,
    // Contract address would be set after deployment
    contractAddress: "0x0000000000000000000000000000000000000000" as const,
};
