# 1gateway examples

Examples for [1gateway](https://1gateway.dev): pay-per-call data APIs for AI agents. Each request is paid with
USDC on Base over [x402](https://x402.org) (HTTP 402). No signup, no API key. Responses are clean English JSON.
Failed calls (any 4xx/5xx) are never charged.

- Agent guide (every route, params, example, response shape): https://1gateway.dev/agents.md
- OpenAPI: https://1gateway.dev/openapi.json · llms.txt: https://1gateway.dev/llms.txt
- Remote MCP: `https://1gateway.dev/mcp` · Status and uptime: https://1gateway.dev/status

## Agent skills (skills.sh / ClawHub format)

Three ready-made skills in [`skills/`](skills). Each is remote, no install needed: the skill only tells the agent
how to call the hosted API with an x402 client (`npx agentcash fetch`, `npx awal x402 pay` or `@x402/fetch`).

| Skill | What | Price (USDC/call) |
|---|---|---|
| [`hwp-remote-to-markdown`](skills/hwp-remote-to-markdown/SKILL.md) | HWP/HWPX (also PDF, DOCX, HTML) to Markdown | $0.0027–$0.009 |
| [`korea-data`](skills/korea-data/SKILL.md) | Apartment trades, holidays, weather, trade stats, Bank of Korea ECOS | $0.0027–$0.0045 |
| [`base-token-risk`](skills/base-token-risk/SKILL.md) | Base ERC-20 token safety check: honeypot and rug-pull signals | $0.009 |

```bash
npx skills add code0xff/1gateway-examples                       # pick skills and agents interactively
npx skills add code0xff/1gateway-examples --skill base-token-risk
```

Each `skills/<name>/` folder is also a ClawHub/OpenClaw skill (`SKILL.md` with `metadata.openclaw`).

## Quick start

```bash
git clone https://github.com/code0xff/1gateway-examples && cd 1gateway-examples
npm install

# 1) No wallet: see the price quote (HTTP 402 + PAYMENT-REQUIRED header)
npm run quote -- "/v1/calendar/holidays?year=2026"

# 2) Pay per call: a Base wallet with a little USDC (use a dedicated low-balance wallet)
cp .env.example .env   # set PRIVATE_KEY, then:
node --env-file=.env --import tsx examples/korea-data.ts
node --env-file=.env --import tsx examples/hwp-to-markdown.ts ./report.hwp
```

The client in [`examples/client.ts`](examples/client.ts) uses `@x402/fetch` + `@x402/evm`: on a 402 it signs a
USDC `transferWithAuthorization` for the quoted amount and retries. A spend cap (`MAX_USD_PER_CALL`, default
$0.01) refuses any payment above it.

```ts
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

const payFetch = wrapFetchWithPaymentFromConfig(fetch, {
  schemes: [{ network: "eip155:8453", client: new ExactEvmScheme(privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`)) }],
  spendControls: { maxAmountPerPayment: "$0.01" },
});
const res = await payFetch("https://1gateway.dev/v1/calendar/holidays?year=2026");
console.log(await res.json());
```

## Examples

| File | What it does |
|---|---|
| [`examples/quote.ts`](examples/quote.ts) | Unpaid call, decodes the 402 price quote (no wallet) |
| [`examples/korea-data.ts`](examples/korea-data.ts) | Korean holidays, Gangnam apartment trades, Seoul weather, trade pulse |
| [`examples/hwp-to-markdown.ts`](examples/hwp-to-markdown.ts) | HWP/HWPX (Hancom) file or URL → Markdown |
| [`mcp/claude-code.md`](mcp/claude-code.md) | Add the remote MCP server to Claude Code |
| [`mcp/cursor.md`](mcp/cursor.md) | Add the remote MCP server to Cursor |

## MCP

```bash
claude mcp add --transport http 1gateway https://1gateway.dev/mcp
```

Cursor (`~/.cursor/mcp.json`):

```json
{ "mcpServers": { "1gateway": { "url": "https://1gateway.dev/mcp" } } }
```

`tools/list` is free; each `tools/call` is paid with x402 in `params._meta["x402/payment"]`. An unpaid call
returns a payment-required result with the price and charges nothing.

## Endpoints and prices

Prices as of 2026-10-17, USDC per call. The 402 quote is always authoritative; see `/agents.md` for parameters.

| Path | What | Price |
|---|---|---|
| `/v1/realestate/apartment-trades` | Korea apartment sale transactions (MOLIT) — English JSON with KRW & USD | $0.0045 |
| `/v1/realestate/apartment-trades/summary` | Korea apartment price summary for a district-month (count, median/avg price and price per m²) | $0.0045 |
| `/v1/macro/ecos` | Bank of Korea ECOS statistics (BOK-authored series only) with attribution | $0.0045 |
| `/v1/weather/forecast` | Korea short-term weather forecast (KMA) by latitude/longitude | $0.0045 |
| `/v1/calendar/holidays` | Korea public holidays for a year (KASI), English names | $0.0027 |
| `/v1/trade/exports/10day` | Korea 10-day export flash (Korea Customs): totals, YoY, top items and markets | $0.0045 |
| `/v1/trade/hs` | Korea monthly exports/imports by HS code (Korea Customs), English HS descriptions, YoY | $0.0045 |
| `/v1/trade/pulse` | Korea Trade Pulse: latest export flash, 12-month trend and semiconductor detail in one call | $0.0045 |
| `/v1/web/metadata` | URL metadata / link preview: title, description, Open Graph, Twitter card, icons, feeds, JSON-LD | $0.002 |
| `/v1/domain/lookup` | Domain lookup: DNS records, mail provider, SPF/DMARC, RDAP registrar, creation/expiry dates | $0.0045 |
| `/v1/fx/rates` | FX reference rates (ECB): 30 currencies incl. KRW, any base, conversion, last 90 days | $0.002 |
| `/v1/time/convert` | Time-zone conversion: one instant in many zones, DST-aware, offsets, business hours | $0.002 |
| `/v1/web/site-profile` | Site profile: page metadata + security headers + robots/llms.txt + DNS, mail auth and domain age in one call | $0.009 |
| `/v1/onchain/base/token-risk` | Base token / contract risk signals: proxy, owner, privileged functions, pools, buy/sell simulation | $0.009 |
| `/v1/onchain/base/balances` | Base wallet balances: ETH + many ERC-20s in one call, with nonce and contract flag | $0.002 |
| `/v1/onchain/base/token-info` | Base ERC-20 token info: name, symbol, decimals, total supply, optional holder balance and allowance | $0.002 |
| `/v1/onchain/base/tx` | Base transaction status with decoded ERC-20 transfers, fee and confirmations | $0.0045 |
| `/v1/convert/markdown` | Document to Markdown: web pages, PDF, DOCX and Korean HWP/HWPX | $0.0027–$0.009 |

## Notes

- Payments settle on Base mainnet through the Coinbase CDP facilitator, only after a 2xx response.
- Never commit a private key. `.env` is git-ignored; use a wallet that holds only what you plan to spend.
- License: MIT.
