/**
 * Copyright 2026 Circle Internet Group, Inc.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from "next/server";
import { circleDeveloperSdk } from "@/lib/circle/sdk";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function PUT(req: NextRequest) {
  try {
    const { entityName } = await req.json();

    if (!entityName.trim()) {
      return NextResponse.json(
        { error: "entityName is required" },
        { status: 400 }
      );
    }

    const response = await circleDeveloperSdk.createWalletSet({
      name: entityName,
    });

    if (!response.data) {
      return NextResponse.json(
        "The response did not include a valid wallet set",
        { status: 500 }
      );
    }

    return NextResponse.json({ ...response.data.walletSet }, { status: 201 });
  } catch (error: any) {
    console.error(`Wallet set creation failed: ${error.message}`);
    return NextResponse.json(
      { error: "Failed to create wallet set" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if wallet already exists for this user
    const existingWallet = await prisma.wallet.findFirst({
      where: { userId, network: "MULTICHAIN" },
    });

    if (existingWallet) {
      return NextResponse.json({
        success: true,
        message: "Wallet set already exists for this user",
      });
    }

    // Create wallet set
    const walletSetResponse = await circleDeveloperSdk.createWalletSet({
      name: `User ${userId.substring(0, 8)} - Wallet Set`,
    });

    if (!walletSetResponse.data?.walletSet) {
      throw new Error("Failed to create wallet set");
    }

    const walletSetId = walletSetResponse.data.walletSet.id;

    // Create ONE multichain SCA wallet (works across all EVM chains)
    const walletsResponse = await circleDeveloperSdk.createWallets({
      accountType: "SCA",
      blockchains: ["ARC-TESTNET"],
      count: 1,
      walletSetId,
    });

    if (!walletsResponse.data?.wallets || walletsResponse.data.wallets.length === 0) {
      throw new Error("Failed to create wallet");
    }

    const wallet = walletsResponse.data.wallets[0];

    // Store ONE multichain wallet in database using Prisma
    const newWallet = await prisma.wallet.create({
      data: {
        address: wallet.address,
        userId: userId,
        network: "MULTICHAIN",
      },
    });

    return NextResponse.json({
      success: true,
      walletSetId,
      wallets: [newWallet],
    });
  } catch (error: any) {
    console.error("Wallet set creation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create wallet set" },
      { status: 500 }
    );
  }
}
