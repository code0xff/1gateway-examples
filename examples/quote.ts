/**
 * No wallet needed: call an endpoint without paying and read the price quote from the 402 response.
 *   npm run quote -- /v1/calendar/holidays?year=2026
 */
import { BASE_URL } from "./client";

const path = process.argv[2] ?? "/v1/calendar/holidays?year=2026";
const res = await fetch(BASE_URL + path);
console.log("HTTP", res.status);
const header = res.headers.get("payment-required");
if (res.status !== 402 || !header) {
  console.log(await res.text());
  process.exit(0);
}
const quote = JSON.parse(Buffer.from(header, "base64").toString("utf8"));
for (const a of quote.accepts) {
  console.log(`price: $${Number(a.amount) / 1e6} USDC (${a.amount} atomic) on ${a.network}, scheme ${a.scheme}, payTo ${a.payTo}`);
}
