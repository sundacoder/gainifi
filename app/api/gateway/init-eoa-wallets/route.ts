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
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if EOA wallet already exists for this user
    const existingWallet = await prisma.wallet.findFirst({
      where: { userId, network: "EOA" }
    });

    if (existingWallet) {
      return NextResponse.json({
        success: true,
        message: "Gateway EOA wallet already exists for this user",
        wallet: existingWallet,
      });
    }

    // Get the user's wallet_set_id from their SCA wallet
    const scaWallet = await prisma.wallet.findFirst({
      where: { userId, network: "MULTICHAIN" }
    });

    if (!scaWallet) {
      return NextResponse.json(
        { error: "No SCA wallet found. Please create a wallet first." },
        { status: 404 }
      );
    }

    // Create multichain EOA wallet for the user using mock
    const newWallet = await prisma.wallet.create({
      data: {
        address: "0xMockEOAWalletAddress123",
        userId,
        network: "EOA",
      }
    });

    return NextResponse.json({
      success: true,
      message: "Gateway EOA wallet created successfully",
      wallet: newWallet,
    });
  } catch (error: any) {
    console.error("Error initializing EOA wallet:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize EOA wallet" },
      { status: 500 }
    );
  }
}
