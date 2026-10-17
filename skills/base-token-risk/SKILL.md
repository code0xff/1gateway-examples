---
name: base-token-risk
description: "Token safety / scam check for a Base ERC-20 through the remote 1gateway API, paid per call with x402 (USDC on Base): honeypot test via buy/sell simulation with taxes, rug-pull signals (owner, mint/pause/blacklist/fee functions, proxy admin, owner-held supply, pool depth) and other contract risk signals with on-chain evidence. Remote, no install needed. Use before an agent buys, swaps into or integrates an unfamiliar Base token. Returns signals, not a safe/unsafe verdict."
license: MIT
homepage: https://1gateway.dev
metadata:
  author: code0xff
  version: "1.0.0"
  openclaw:
    emoji: "🛡️"
    homepage: https://1gateway.dev
    requires:
      anyBins: ["npx", "curl", "node"]
    envVars:
      - name: X402_WALLET_KEY
        required: false
        description: "Only for the optional @x402/fetch snippet: private key of a low-balance Base wallet with USDC. Not needed with npx agentcash or npx awal, which manage their own wallet."
  tags: ["base", "token-safety", "honeypot", "rug-pull", "erc20"]
---

# Base token risk / safety check (remote)

Remote, no install needed. One call reads Base mainnet chain state (no third-party risk database) and returns
contract risk signals, each with the block number and evidence.

## Price

$0.009 USDC per call. Invalid addresses, bad checksums and EOAs (no contract code) are rejected with 400
before payment, so they are not charged.

## Endpoint

`GET /v1/onchain/base/token-risk?address=<token contract on Base>`

- `address` (required): Token contract on Base mainnet (0x + 40 hex; mixed case must be a valid EIP-55 checksum). EOAs, bad checksums → 400 before payment (not charged)

What it checks (from the endpoint description): JSON contract risk signals with block+evidence: honeypot test (buy/sell simulation, taxes), rug-pull signals (owner, mint/pause/blacklist/fee functions, proxy+admin, owner-held supply, Uniswap v2/v3/v4 + Aerodrome pool depth), notChecked. Signals, not a safe verdict.

Response 200 includes `riskLevel`, `summary` (counts by severity), `token`, `contract` (proxy, owner, matched
selectors), `liquidity` (pools and approximate depth), `supplyHeld`, `simulation` (buyOk, sellOk, taxes),
`signals[]` (id, severity, title, method, block, evidence), `checksRun`, `notChecked` and a `disclaimer`.

## How to read the result

- Treat it as evidence to weigh, not a guarantee: `notChecked` lists what could not be verified.
- `simulation.sellOk: false` or a high `sellTaxPct` is the classic honeypot signal.
- Owner-controlled mint, pause, blacklist or fee functions and an upgradeable proxy with an EOA admin are common
  rug-pull levers; check `contract.owner.type` (renounced, eoa, contract, undeclared, unknown).

## How to call (remote, no install needed)

Nothing to install or host: this skill calls the remote 1gateway API over HTTPS. Each call is paid per request
with USDC on Base through the x402 protocol (HTTP 402). No signup, no API key.

1. Optional, free: see the exact price. An unpaid request returns `HTTP 402` with a `PAYMENT-REQUIRED` header
   (base64 JSON quote). `curl -i "https://1gateway.dev/v1/onchain/base/token-risk?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"`
2. Pay and get the data with any x402 client that has a funded Base wallet, for example:
   - `npx agentcash fetch "https://1gateway.dev/v1/onchain/base/token-risk?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"` (AgentCash wallet)
   - `npx awal x402 pay "https://1gateway.dev/v1/onchain/base/token-risk?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"` (Coinbase Agentic Wallet)
   - Node: `@x402/fetch`, see below
3. Billing: payment settles only after a 2xx response. Any 4xx/5xx (bad input, no data, upstream error) is not
   charged. Inputs are validated before the 402 wherever possible.

```ts
// npm i @x402/fetch @x402/evm viem
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";
const payFetch = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: "eip155:8453", client: new ExactEvmScheme(privateKeyToAccount(process.env.X402_WALLET_KEY as `0x${string}`)) }],
  spendControls: { maxAmountPerPayment: "$0.01" }, // refuse anything pricier than expected
});
const res = await payFetch("https://1gateway.dev/v1/onchain/base/token-risk?address=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
console.log(await res.json());
```

## More

- Every route, parameter and response shape: https://1gateway.dev/agents.md · OpenAPI: https://1gateway.dev/openapi.json
- Remote MCP server (same tools): `https://1gateway.dev/mcp` (tools/list free, tools/call paid with x402)
- Status and uptime: https://1gateway.dev/status
- Prices here are from the 1gateway catalog as of 2026-10-17; the 402 quote is always authoritative.
