/**
 * StableFX Service — Full RFQ → PvP → Settlement flow
 * Integrates with Circle's StableFX API and Gateway infrastructure
 * from the arc-multichain-wallet reference implementation.
 */

import { circleDeveloperSdk } from "@/lib/circle/sdk";
import {
    GATEWAY_WALLET_ADDRESS,
    USDC_ADDRESSES,
    arcTestnet,
    type SupportedChain,
} from "@/lib/circle/gateway-sdk";

const STABLEFX_API = "https://api.circle.com/v1/stablefx";

export interface StableFXQuote {
    quoteId: string;
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
    price: string;
    expiresAt: number;
}

export interface StableFXTrade {
    tradeId: string;
    status: "pending_funding" | "funded" | "settled" | "failed";
    escrowAddress: string;
    settlementTxHash?: string;
}

/**
 * Request an RFQ quote from Circle StableFX.
 * StableFX uses a Request-For-Quote (RFQ) model where Circle acts as
 * market maker for stablecoin FX pairs (USDC, EURC, BRLA, MXNB, etc.)
 */
export async function requestQuote(params: {
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    takerAddress: string;
}): Promise<StableFXQuote> {
    const res = await fetch(`${STABLEFX_API}/quotes`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sellToken: params.sellToken,
            buyToken: params.buyToken,
            sellAmount: params.sellAmount,
            takerAddress: params.takerAddress,
        }),
    });

    if (!res.ok) {
        throw new Error(`StableFX quote failed: ${res.status}`);
    }

    return res.json();
}

/**
 * Create a trade from a quoted price.
 * Step 2 in the flow: Sign an EIP-712 trade intent via Circle's
 * Developer-Controlled Wallets (MPC-based, no raw key exposure).
 */
export async function createTrade(
    quoteId: string,
    walletId: string
): Promise<StableFXTrade> {
    // Sign the trade intent using Circle's MPC wallet infrastructure
    const tradeTypedData = buildTradeTypedData(quoteId);

    const signResult = await circleDeveloperSdk.signTypedData({
        walletId,
        data: JSON.stringify(tradeTypedData),
    });

    const res = await fetch(`${STABLEFX_API}/trades`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            quoteId,
            signature: signResult.data?.signature,
        }),
    });

    if (!res.ok) {
        throw new Error(`StableFX trade creation failed: ${res.status}`);
    }

    return res.json();
}

/**
 * Fund a trade using Permit2 approval.
 * PvP (Payment vs Payment): Both sides fund before settlement occurs.
 * Uses the same EIP-2612 permit pattern from the arc-multichain-wallet.
 */
export async function fundTrade(
    tradeId: string,
    walletId: string,
    escrowAddress: string,
    sellTokenAddress: string,
    sellAmount: string,
    permit2Nonce: string,
    deadline: number
): Promise<{ status: string }> {
    const permit2Data = buildPermit2TypedData({
        token: sellTokenAddress,
        spender: escrowAddress,
        amount: sellAmount,
        nonce: permit2Nonce,
        deadline,
    });

    const permit2Sig = await circleDeveloperSdk.signTypedData({
        walletId,
        data: JSON.stringify(permit2Data),
    });

    const res = await fetch(`${STABLEFX_API}/trades/${tradeId}/fund`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            permit2Signature: permit2Sig.data?.signature,
        }),
    });

    if (!res.ok) {
        throw new Error(`StableFX trade funding failed: ${res.status}`);
    }

    return res.json();
}

/**
 * Poll trade status until settlement.
 * Arc's 0.5s finality makes this very fast.
 */
export async function awaitSettlement(
    tradeId: string,
    timeoutMs = 10_000
): Promise<string> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const res = await fetch(`${STABLEFX_API}/trades/${tradeId}`, {
            headers: { Authorization: `Bearer ${process.env.CIRCLE_API_KEY}` },
        });
        const trade = await res.json();

        if (trade.status === "settled") return trade.settlementTxHash;
        if (trade.status === "failed")
            throw new Error(`Trade failed: ${tradeId}`);

        await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error("Settlement timeout");
}

/* ── Internal helpers ── */

function buildTradeTypedData(quoteId: string) {
    return {
        domain: {
            name: "CircleStableFX",
            version: "1",
            chainId: arcTestnet.id,
        },
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "version", type: "string" },
                { name: "chainId", type: "uint256" },
            ],
            TradeIntent: [
                { name: "quoteId", type: "bytes32" },
                { name: "taker", type: "address" },
            ],
        },
        primaryType: "TradeIntent" as const,
        message: {
            quoteId,
            taker: "0x0000000000000000000000000000000000000000", // filled by wallet
        },
    };
}

function buildPermit2TypedData(params: {
    token: string;
    spender: string;
    amount: string;
    nonce: string;
    deadline: number;
}) {
    return {
        domain: {
            name: "Permit2",
            chainId: arcTestnet.id,
            verifyingContract: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
        },
        types: {
            EIP712Domain: [
                { name: "name", type: "string" },
                { name: "chainId", type: "uint256" },
                { name: "verifyingContract", type: "address" },
            ],
            PermitTransferFrom: [
                { name: "permitted", type: "TokenPermissions" },
                { name: "spender", type: "address" },
                { name: "nonce", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
            TokenPermissions: [
                { name: "token", type: "address" },
                { name: "amount", type: "uint256" },
            ],
        },
        primaryType: "PermitTransferFrom" as const,
        message: {
            permitted: { token: params.token, amount: params.amount },
            spender: params.spender,
            nonce: params.nonce,
            deadline: params.deadline,
        },
    };
}
