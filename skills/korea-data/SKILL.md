---
name: korea-data
description: "South Korean public data as clean English JSON through the remote 1gateway API, paid per call with x402 (USDC on Base): apartment sale transactions and district price summaries (MOLIT), public holidays (KASI), short-term weather forecasts (KMA), trade statistics (Korea Customs export flash, HS-code trade, trade pulse) and Bank of Korea ECOS series. Remote, no install needed. Use when an agent needs Korean real estate, holiday, weather, trade or macro data without a Korean API key."
license: MIT
homepage: https://1gateway.dev
metadata:
  author: code0xff
  version: "1.0.0"
  openclaw:
    emoji: "🇰🇷"
    homepage: https://1gateway.dev
    requires:
      anyBins: ["npx", "curl", "node"]
    envVars:
      - name: X402_WALLET_KEY
        required: false
        description: "Only for the optional @x402/fetch snippet: private key of a low-balance Base wallet with USDC. Not needed with npx agentcash or npx awal, which manage their own wallet."
  tags: ["korea", "real-estate", "weather", "trade", "bank-of-korea"]
---

# Korean data (remote)

Remote, no install needed. 1gateway wraps Korean government open APIs (which need a Korean account and key, and
answer in Korean XML) and returns normalized English JSON with Korean names kept alongside.

## Endpoints and prices (USDC per call)

| Path | What | Price |
|---|---|---|
| `/v1/realestate/apartment-trades` | Korea apartment sale transactions (MOLIT) — English JSON with KRW & USD | $0.0045 |
| `/v1/realestate/apartment-trades/summary` | Korea apartment price summary for a district-month (count, median/avg price and price per m²) | $0.0045 |
| `/v1/calendar/holidays` | Korea public holidays for a year (KASI), English names | $0.0027 |
| `/v1/weather/forecast` | Korea short-term weather forecast (KMA) by latitude/longitude | $0.0045 |
| `/v1/trade/pulse` | Korea Trade Pulse: latest export flash, 12-month trend and semiconductor detail in one call | $0.0045 |
| `/v1/trade/exports/10day` | Korea 10-day export flash (Korea Customs): totals, YoY, top items and markets | $0.0045 |
| `/v1/trade/hs` | Korea monthly exports/imports by HS code (Korea Customs), English HS descriptions, YoY | $0.0045 |
| `/v1/macro/ecos` | Bank of Korea ECOS statistics (BOK-authored series only) with attribution | $0.0045 |

## How to call (remote, no install needed)

Nothing to install or host: this skill calls the remote 1gateway API over HTTPS. Each call is paid per request
with USDC on Base through the x402 protocol (HTTP 402). No signup, no API key.

1. Optional, free: see the exact price. An unpaid request returns `HTTP 402` with a `PAYMENT-REQUIRED` header
   (base64 JSON quote). `curl -i "https://1gateway.dev/v1/calendar/holidays?year=2026"`
2. Pay and get the data with any x402 client that has a funded Base wallet, for example:
   - `npx agentcash fetch "https://1gateway.dev/v1/calendar/holidays?year=2026"` (AgentCash wallet)
   - `npx awal x402 pay "https://1gateway.dev/v1/calendar/holidays?year=2026"` (Coinbase Agentic Wallet)
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
const res = await payFetch("https://1gateway.dev/v1/calendar/holidays?year=2026");
console.log(await res.json());
```

## Endpoint details

### Korea apartment sale transactions (MOLIT) — English JSON with KRW & USD ($0.0045)

`GET /v1/realestate/apartment-trades`. Source: MOLIT via data.go.kr #15126469.

- `region` (required): 5-digit 시군구 code (LAWD_CD), e.g. 11680 = Seoul Gangnam-gu, 11110 = Jongno-gu, 41135 = Seongnam Bundang-gu. Unknown codes → 400 (not charged).
- `month` (required): Contract month YYYYMM, 200601 to the current month (KST)

```bash
npx agentcash fetch "https://1gateway.dev/v1/realestate/apartment-trades?region=11680&month=202609"
```

### Korea apartment price summary for a district-month (count, median/avg price and price per m²) ($0.0045)

`GET /v1/realestate/apartment-trades/summary`. Source: MOLIT via data.go.kr #15126469 (aggregated).

- `region` (required): 5-digit 시군구 code (LAWD_CD), e.g. 11680 = Seoul Gangnam-gu. Unknown codes → 400 (not charged).
- `month` (required): Contract month YYYYMM, 200601 to the current month (KST)

```bash
npx agentcash fetch "https://1gateway.dev/v1/realestate/apartment-trades/summary?region=11680&month=202609"
```

### Korea public holidays for a year (KASI), English names ($0.0027)

`GET /v1/calendar/holidays`. Source: KASI via data.go.kr #15012690.

- `year` (required): Year YYYY (2004–2100)

```bash
npx agentcash fetch "https://1gateway.dev/v1/calendar/holidays?year=2026"
```

### Korea short-term weather forecast (KMA) by latitude/longitude ($0.0045)

`GET /v1/weather/forecast`. Source: KMA via data.go.kr #15084084.

- `lat` (required): Latitude, WGS84 decimal degrees (KMA domain ≈ 32–44; outside → 400, not charged)
- `lon` (required): Longitude, WGS84 decimal degrees (KMA domain ≈ 123–133)

```bash
npx agentcash fetch "https://1gateway.dev/v1/weather/forecast?lat=37.5665&lon=126.978"
```

### Korea Trade Pulse: latest export flash, 12-month trend and semiconductor detail in one call ($0.0045)

`GET /v1/trade/pulse`. Source: Korea Customs Service via data.go.kr #15157908, #15157941, #15101609 (aggregated).



```bash
npx agentcash fetch "https://1gateway.dev/v1/trade/pulse"
```

### Korea 10-day export flash (Korea Customs): totals, YoY, top items and markets ($0.0045)

`GET /v1/trade/exports/10day`. Source: Korea Customs Service via data.go.kr #15157908, #15157941.

- `month` (optional): Release month YYYYMM (default: latest release; data from 2024-09)
- `period` (optional): 10 (days 1-10), 20 (days 1-20) or full; requires month. Default: latest available for the month

```bash
npx agentcash fetch "https://1gateway.dev/v1/trade/exports/10day?month=202609&period=full"
```

### Korea monthly exports/imports by HS code (Korea Customs), English HS descriptions, YoY ($0.0045)

`GET /v1/trade/hs`. Source: Korea Customs Service via data.go.kr #15101609.

- `hs` (required): HS code prefix, 2-10 digits (e.g. 8542 integrated circuits, 870323 passenger cars)
- `month` (optional): Month YYYYMM (default: latest finalized month)
- `limit` (optional): Max 10-digit lines returned (1-100, default 20)
- `sort` (optional): Line order (default exports)

```bash
npx agentcash fetch "https://1gateway.dev/v1/trade/hs?hs=8542&month=202608&limit=20&sort=exports"
```

### Bank of Korea ECOS statistics (BOK-authored series only) with attribution ($0.0045)

`GET /v1/macro/ecos`. Source: Bank of Korea ECOS Open API.

- `stat` (required): ECOS statistic table code, e.g. 722Y001 (base rate). Non-BOK tables → 403 (not charged).
- `cycle` (required): A annual, S semi-annual, Q quarterly, M monthly, SM semi-monthly, D daily
- `start` (required): Start period in ECOS format (A: YYYY, Q: YYYYQn, M: YYYYMM, D: YYYYMMDD)
- `end` (required): End period, same format as start
- `item` (optional): Item code 1 (e.g. 0101000). Optional item2..item4 also accepted.

```bash
npx agentcash fetch "https://1gateway.dev/v1/macro/ecos?stat=722Y001&cycle=M&start=202401&end=202412&item=0101000"
```

Region codes for apartment data are 5-digit LAWD_CD district codes (e.g. 11680 Gangnam-gu, Seoul). No data for a
period returns 404 and is not charged.

## More

- Every route, parameter and response shape: https://1gateway.dev/agents.md · OpenAPI: https://1gateway.dev/openapi.json
- Remote MCP server (same tools): `https://1gateway.dev/mcp` (tools/list free, tools/call paid with x402)
- Status and uptime: https://1gateway.dev/status
- Prices here are from the 1gateway catalog as of 2026-10-17; the 402 quote is always authoritative.
