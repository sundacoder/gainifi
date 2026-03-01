/**
 * USYC Vault Service — Yield-bearing LP vault
 * Maps to USYCVault.sol contract interface.
 *
 * Mental Model: Any idle USDC in the LP pool earns yield via USYC.
 * Think Compound cTokens, but regulated real-world asset yield.
 * Depositors get vault shares (nfxV); vault holds USYC internally.
 * On redemption: USYC → USDC, 24/7, near-instant via Circle.
 */

import {
    arcTestnet,
    USDC_ADDRESSES,
} from "@/lib/circle/gateway-sdk";

/* ──── USYCVault ABI (matches USYCVault.sol) ──── */
export const USYC_VAULT_ABI = [
    {
        type: "function",
        name: "deposit",
        inputs: [{ name: "usdcAmount", type: "uint256" }],
        outputs: [{ name: "shares", type: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "withdraw",
        inputs: [{ name: "shares", type: "uint256" }],
        outputs: [{ name: "usdcOut", type: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "totalValue",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "totalSupply",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "event",
        name: "Deposited",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "usdc", type: "uint256" },
            { name: "shares", type: "uint256" },
        ],
    },
    {
        type: "event",
        name: "Withdrawn",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "usdc", type: "uint256" },
            { name: "shares", type: "uint256" },
        ],
    },
] as const;

/* ──── IUSYC Interface ABI ──── */
export const USYC_ABI = [
    {
        type: "function",
        name: "subscribe",
        inputs: [{ name: "usdcAmount", type: "uint256" }],
        outputs: [{ name: "shares", type: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "redeem",
        inputs: [{ name: "shares", type: "uint256" }],
        outputs: [{ name: "usdcAmount", type: "uint256" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "pricePerShare",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
] as const;

/* ──── Types ──── */
export interface VaultPosition {
    shares: bigint;
    usdcValue: bigint;
    yieldEarned: bigint;
}

export interface VaultStats {
    totalValueLocked: bigint;
    totalShares: bigint;
    pricePerShare: bigint; // 18 decimals
    currentApy: number; // percentage
}

/* ──── Utility Functions ──── */

/**
 * Calculate projected annual yield in USDC
 */
export function projectedAnnualYield(
    principal: bigint,
    apy: number
): bigint {
    // principal is in micro-USDC (6 decimals), apy is percentage
    return (principal * BigInt(Math.floor(apy * 10000))) / 10000n;
}

/**
 * Calculate share price from USYC price
 * USYC pricePerShare has 18 decimals
 */
export function shareToUsdc(
    shares: bigint,
    pricePerShare: bigint
): bigint {
    return (shares * pricePerShare) / 10n ** 18n;
}

/**
 * Calculate shares from USDC deposit
 */
export function usdcToShares(
    usdcAmount: bigint,
    pricePerShare: bigint
): bigint {
    return (usdcAmount * 10n ** 18n) / pricePerShare;
}

/* ──── Contract Config ──── */
export const USYC_VAULT_CONFIG = {
    chainId: arcTestnet.id,
    usdcAddress: USDC_ADDRESSES.arcTestnet,
    // Contract addresses would be set after deployment
    vaultAddress: "0x0000000000000000000000000000000000000000" as const,
    usycAddress: "0x0000000000000000000000000000000000000000" as const,
    vaultSymbol: "nfxV",
    vaultName: "NanoFX Vault",
};
