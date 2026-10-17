---
name: hwp-remote-to-markdown
description: "Convert Korean HWP/HWPX (Hancom Office) documents, and also PDF, DOCX and web pages, to clean Markdown through the remote 1gateway API, paid per call with x402 (USDC on Base). Remote, no install needed. Use when a user or agent has a .hwp/.hwpx file or URL (Korean government notices, forms, reports) and needs its text as Markdown."
license: MIT
homepage: https://1gateway.dev
metadata:
  author: code0xff
  version: "1.0.0"
  openclaw:
    emoji: "📄"
    homepage: https://1gateway.dev
    requires:
      anyBins: ["npx", "curl", "node"]
    envVars:
      - name: X402_WALLET_KEY
        required: false
        description: "Only for the optional @x402/fetch snippet: private key of a low-balance Base wallet with USDC. Not needed with npx agentcash or npx awal, which manage their own wallet."
  tags: ["hwp", "hwpx", "markdown", "korean", "document-conversion"]
---

# HWP/HWPX to Markdown (remote)

Remote, no install needed. Converts a document to Markdown on 1gateway's server: no Hancom Office, LibreOffice,
Python or native parser on the agent's machine.

## When to use

- The input is a `.hwp` or `.hwpx` file or URL (common for Korean public-sector documents) and you need its text.
- Also works for PDF, DOCX, HTML pages and plain text.

## Price (USDC per call, decided before payment from the detected type)

| Type | Price |
|---|---|
| Web page / HTML / plain text | $0.0027 |
| PDF, DOCX | $0.0045 |
| HWP, HWPX (Hancom) | $0.009 |

## Endpoint

`GET /v1/convert/markdown?url=<document URL>` or `POST /v1/convert/markdown` with the file (multipart field `file`, raw bytes, or JSON
`{"contentBase64": "...", "filename": "report.hwp"}`).

- `url` (optional): Public http(s) URL of a web page, PDF, DOCX, HWP or HWPX within the per-format size caps (see 413 in /openapi.json). For uploads use POST instead.
- `type` (optional): Optional expected type; a mismatch is rejected before payment (415, not charged)

The URL must be publicly reachable; if 1gateway cannot fetch it the call fails with 502 and is not charged.

Size caps on the current server plan (checked before payment, 413 and not charged if exceeded): HWP 48 KB;
HWPX 100 KB of uncompressed section XML (about 12 KB as a typical .hwpx file). See `/openapi.json` for the live caps.

Response 200: JSON with `markdown`, `title`, `sourceType`, `priceTier`, `bytes`, `chars`, `warnings` (and `sections`/`pages` when known).

## How to call (remote, no install needed)

Nothing to install or host: this skill calls the remote 1gateway API over HTTPS. Each call is paid per request
with USDC on Base through the x402 protocol (HTTP 402). No signup, no API key.

1. Optional, free: see the exact price. An unpaid request returns `HTTP 402` with a `PAYMENT-REQUIRED` header
   (base64 JSON quote). `curl -i "https://1gateway.dev/v1/convert/markdown?url=<URL-encoded public .hwp/.hwpx link>"`
2. Pay and get the data with any x402 client that has a funded Base wallet, for example:
   - `npx agentcash fetch "https://1gateway.dev/v1/convert/markdown?url=<URL-encoded public .hwp/.hwpx link>"` (AgentCash wallet)
   - `npx awal x402 pay "https://1gateway.dev/v1/convert/markdown?url=<URL-encoded public .hwp/.hwpx link>"` (Coinbase Agentic Wallet)
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
const docUrl = "https://…/notice.hwpx"; // a public .hwp/.hwpx link
const res = await payFetch(`https://1gateway.dev/v1/convert/markdown?url=${encodeURIComponent(docUrl)}`);
console.log(await res.json());
```

Upload a local file (POST, JSON body):

```ts
import { readFile } from "node:fs/promises";
const bytes = await readFile("report.hwp");
const res = await payFetch("https://1gateway.dev/v1/convert/markdown", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ contentBase64: bytes.toString("base64"), filename: "report.hwp" }),
});
const { markdown } = await res.json();
```

## More

- Every route, parameter and response shape: https://1gateway.dev/agents.md · OpenAPI: https://1gateway.dev/openapi.json
- Remote MCP server (same tools): `https://1gateway.dev/mcp` (tools/list free, tools/call paid with x402)
- Status and uptime: https://1gateway.dev/status
- Prices here are from the 1gateway catalog as of 2026-10-17; the 402 quote is always authoritative.
