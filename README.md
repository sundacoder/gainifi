# GainiFi - Arc Multichain Stablecoin Exchange with Nanopayments

GainiFi is an optimal Web3 DeFi platform demonstrating powerful USDC interoperability and unified balance management across EVM chains using the **Circle Gateway**, **Circle Developer-Controlled Wallets**, and **Arc Testnet**. 

GainiFi leverages Next.js, Radix UI, wagmi/viem for web3 connections, and Supabase + Prisma for a fast and robust database layer.

## Core Features
1. **Developer-Controlled Wallets:** Invisible, seamless, and programmable wallets abstracting gas and seed phrases from the end-user using the Circle W3S API.
2. **Unified Balances:** A unified USDC balance available seamlessly across multiple chains without manual bridging.
3. **Cross-Chain Transfers:** Execute rapid native deposits and mints using the Circle Gateway architecture and intent-based architecture (EIP-712).
4. **Smart Contracts Integrations:** Interaction with Nano Channels, StableFX Escrow, and USYC Vaults directly from the unified wallet address.

## Prerequisites

- Node.js 20.x or newer
- npm or yarn
- Docker (if running a local Supabase instance)
- Circle Developer Controlled Wallets [API key](https://console.circle.com/signin) and [Entity Secret](https://developers.circle.com/wallets/dev-controlled/register-entity-secret)
- Arc Testnet RPC node access

## Getting Started

### 1. Clone & Install
```bash
git clone <your-github-repo-url>
cd gainifi
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to create your own local environment file:
```bash
cp .env.example .env.local
```

You must fill in the mandatory variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key"

# Circle API (Testnet)
# Important: Prefix your Circle Testnet API key with "TEST_API_KEY:"
CIRCLE_API_KEY="TEST_API_KEY:your_id:your_secret"

# 32-byte Hex Entity Secret (Generated locally by your scripts)
CIRCLE_ENTITY_SECRET="your_64_character_hex_string"

# Arc / Smart Contracts
ARC_TESTNET_RPC_KEY="your_rpc_key"
NEXT_PUBLIC_NANO_CHANNEL_ADDRESS="0x..."
NEXT_PUBLIC_STABLEFX_ESCROW_ADDRESS="0x..."
NEXT_PUBLIC_USYC_VAULT_ADDRESS="0x..."
```

*(Note: If you need to generate a new Circle Entity Secret and the 684-character Ciphertext, run: `node scripts/generate-circle-secret.js`)*

### 3. Setup Database (Supabase & Prisma)
This project uses **Prisma** configured with **SQLite** for local development, or Supabase PostgreSQL depending on your `prisma.schema`. 
To push the schema and generate the client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard.

## Project Structure

- `/app`: Next.js 14+ App Router containing the dashboard, authentication, and layout loops.
- `/app/api`: Backend endpoints handling server-side interactions with the Circle W3S API (Wallet Set creation, Gateway APIs, etc.) keeping secrets completely hidden from the frontend.
- `/components`: Reusable UI components built with Radix UI and styled via Tailwind CSS.
- `/lib`: Helper utilities, configuration files, and the Prisma client instance.
- `/scripts`: Utility scripts including `generate-circle-secret.js` for automating the encryption of the Circle Entity Secret.

## Security & Best Practices
- **Never commit `.env.local` or `.env` to GitHub.** Our `.gitignore` is configured to ignore these files to prevent accidental leakage of `CIRCLE_API_KEY` and `CIRCLE_ENTITY_SECRET`.
- This template relies on storing the Base64 Entity Secret cipher locally via your Node config script, strictly for development or securely bound backend servers.
- This codebase is designed for **Testnet** usage.

## Resources
- [Circle Programmable Wallets](https://developers.circle.com/wallets)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi](https://wagmi.sh/react/getting-started)
- [Radix UI](https://www.radix-ui.com/)
