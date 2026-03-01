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

/**
 * Creates EOA (Externally Owned Account) wallets for Gateway signing across all chains using Circle Wallets SDK
 * The same wallet ID will be used across all EVM chains (since Circle wallets derive to same address)
 * These wallets will be used to sign Gateway burn intents and must deposit funds to Gateway
 */

import { prisma } from "@/lib/prisma";
import { circleDeveloperSdk } from "@/lib/circle/sdk";

export interface GatewayEOAWallet {
  chain: string;
  address: string;
  walletId: string;
  name: string;
}

/**
 * Create a single multichain EOA wallet using Circle Wallets SDK
 * Creates one EOA wallet that works across all EVM chains
 * Circle SDK automatically derives the same address across all chains
 */
export async function generateGatewayEOAWallet(walletSetId: string): Promise<GatewayEOAWallet> {
  // Create one EOA wallet on ARC-TESTNET (will have same address on all chains)
  const response = await circleDeveloperSdk.createWallets({
    walletSetId,
    accountType: "EOA",
    blockchains: ["ARC-TESTNET"],
    count: 1,
  });

  if (!response.data?.wallets || response.data.wallets.length === 0) {
    throw new Error("Failed to create Gateway EOA wallet via Circle SDK");
  }

  const wallet = response.data.wallets[0];
  console.log(`Created Gateway EOA wallet ${wallet.address} via Circle SDK`);

  return {
    chain: wallet.blockchain,
    address: wallet.address,
    walletId: wallet.id,
    name: wallet.name || "Gateway Signer (Multichain)",
  };
}

/**
 * Create wallet set and Gateway EOA wallet for a user
 * Creates one multichain EOA wallet that can sign for all chains
 */
export async function storeGatewayEOAWalletForUser(userId: string, walletSetId: string) {
  // Create one EOA wallet in the wallet set
  const wallet = await generateGatewayEOAWallet(walletSetId);

  // Store wallet information in database - one record for the multichain wallet
  const newWallet = await prisma.wallet.create({
    data: {
      userId: userId,
      address: wallet.address,
      network: "EOA",
    },
  });

  console.log(
    `Stored Gateway EOA wallet for user ${userId} with address ${wallet.address}`
  );
  return [newWallet];
}

/**
 * Get Gateway EOA wallet ID for a user (works for all blockchains)
 * Returns the Circle wallet ID which can be used with Circle SDK for transactions
 */
export async function getGatewayEOAWalletId(
  userId: string,
  blockchain: string
): Promise<{ walletId: string; address: string }> {
  // Get the multichain EOA wallet
  const wallet = await prisma.wallet.findFirst({
    where: { userId, network: "EOA" },
  });

  if (!wallet) {
    throw new Error(`Gateway EOA wallet not found for user ${userId}`);
  }

  return {
    walletId: wallet.id,
    address: wallet.address,
  };
}

/**
 * Get or create Gateway EOA wallet for a user
 * If wallet doesn't exist, creates it for the user using their SCA wallet set
 */
export async function getOrCreateGatewayEOAWallet(
  userId: string,
  blockchain: string
): Promise<{ walletId: string; address: string }> {
  try {
    // Try to get existing wallet
    return await getGatewayEOAWalletId(userId, blockchain);
  } catch (error) {
    // Wallet doesn't exist, create it using the user's existing wallet set
    console.log(`Creating Gateway EOA wallet for user ${userId}`);

    // Get the user's existing wallet_set_id from their SCA wallets
    const scaWallet = await prisma.wallet.findFirst({
      where: { userId, network: "MULTICHAIN" },
    });

    if (!scaWallet) {
      throw new Error(`No SCA wallet found for user ${userId}. Cannot create EOA wallet.`);
    }

    await storeGatewayEOAWalletForUser(userId, scaWallet.id);

    // Now get the newly created wallet
    return await getGatewayEOAWalletId(userId, blockchain);
  }
}
