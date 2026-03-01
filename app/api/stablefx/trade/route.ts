/**
 * StableFX Trade API Route
 * POST /api/stablefx/trade — create a new trade from a quote
 * GET  /api/stablefx/trade?id=<tradeId> — poll trade status
 */

import { NextRequest, NextResponse } from "next/server";
import { createTrade, awaitSettlement } from "@/lib/services/stablefx.service";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { quoteId, walletId } = body;

        if (!quoteId) {
            return NextResponse.json(
                { error: "Missing quoteId" },
                { status: 400 }
            );
        }

        // In production, walletId comes from authenticated session
        const trade = await createTrade(
            quoteId,
            walletId || "demo-wallet-id"
        );

        return NextResponse.json(trade);
    } catch (error: any) {
        console.error("StableFX trade error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create trade" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const tradeId = request.nextUrl.searchParams.get("id");
        if (!tradeId) {
            return NextResponse.json(
                { error: "Missing trade id" },
                { status: 400 }
            );
        }

        const txHash = await awaitSettlement(tradeId, 5000);
        return NextResponse.json({
            tradeId,
            status: "settled",
            settlementTxHash: txHash,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message, status: "pending" },
            { status: 200 }
        );
    }
}
