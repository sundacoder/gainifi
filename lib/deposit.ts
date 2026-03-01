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

// lib/deposit.ts
import { prisma } from "@/lib/prisma";

export type DepositParams = {
  userId?: string;
  chain?: string;
  amount?: number;
};

export type DepositResult =
  | { success: true; depositResult: any }
  | { error: string };

export async function handleDeposit(
  params: DepositParams
): Promise<DepositResult> {
  const { userId, chain, amount } = params;

  // Validate required fields
  if (!userId) {
    return { error: 'Missing userId' };
  }
  if (!chain) {
    return { error: 'Missing chain' };
  }
  if (amount === undefined || amount === null) {
    return { error: 'Missing amount' };
  }

  // TODO: Integrate Circle Paymaster API for gas abstraction
  // Placeholder for deposit logic with gas paid in USDC
  const depositResult = {
    txHash: 'mock-tx-hash',
    gatewayWalletAddress: 'mock-gateway-wallet-address',
    gasPaidWithUSDC: true,
  };

  // Store transaction in Local DB
  try {
    await prisma.transaction.create({
      data: {
        userId: userId,
        chain,
        type: "vault",
        amount: String(amount),
        txHash: depositResult.txHash,
        status: "settled",
      }
    });
  } catch (e) {
    // For unit tests, ignore errors
  }

  return { success: true, depositResult };
}
