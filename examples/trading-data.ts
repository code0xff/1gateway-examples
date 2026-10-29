/**
 * Trading data endpoints, paid per call with x402 (each call is a separate payment):
 *   PRIVATE_KEY=0x... npm run trading-data
 * See a quote first without paying:
 *   npm run quote -- "/v1/crypto/hyperliquid/funding-history?coin=BTC"
 * Prices: see https://1gateway.dev/agents.md (the 402 quote is authoritative).
 * Invalid input (unknown coin, bad token) returns 400 before payment; /extremes returns 503 (not charged) until 24h of snapshots exist.
 */
import { BASE_URL, payingFetch, receipt } from "./client";

const payFetch = payingFetch();

async function call(label: string, path: string) {
  const res = await payFetch(BASE_URL + path);
  const body = await res.json();
  console.log(`\n## ${label}  (HTTP ${res.status}, ${receipt(res)})`);
  console.log(JSON.stringify(body, null, 2).slice(0, 1200));
}

// Hyperliquid funding history: APR, percentile/z-score vs 7d/30d, OI change (~$0.004)
await call("BTC funding history (7d)", "/v1/crypto/hyperliquid/funding-history?coin=BTC&hours=168");
// Funding extremes + open-interest movers across all perps (~$0.006)
await call("Funding extremes / OI movers", "/v1/crypto/hyperliquid/extremes?limit=10");
// Batch DEX prices + buy price impact, up to 25 Base/Solana tokens (~$0.008)
await call("WETH + AERO, $5k buy", "/v1/onchain/prices/batch?tokens=base:0x4200000000000000000000000000000000000006,base:0x940181a94A35A4569E4529A3CDfB74e38FD98631&amount_usd=5000");
