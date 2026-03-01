/**
 * StableFX Quote API Route
 * POST /api/stablefx/quote
 * 
 * Requests an RFQ quote from Circle's StableFX for stablecoin FX swaps.
 */

import { NextRequest, NextResponse } from "next/server";
import { requestQuote } from "@/lib/services/stablefx.service";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sellToken, buyToken, sellAmount, takerAddress } = body;

        if (!sellToken || !buyToken || !sellAmount) {
            return NextResponse.json(
                { error: "Missing required fields: sellToken, buyToken, sellAmount" },
                { status: 400 }
            );
        }

        const quote = await requestQuote({
            sellToken,
            buyToken,
            sellAmount,
            takerAddress: takerAddress || "0x0000000000000000000000000000000000000000",
        });

        return NextResponse.json(quote);
    } catch (error: any) {
        console.error("StableFX quote error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get quote" },
            { status: 500 }
        );
    }
}
