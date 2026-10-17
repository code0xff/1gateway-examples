/**
 * Korean data endpoints, paid per call with x402 (each call is a separate payment):
 *   PRIVATE_KEY=0x... npm run korea-data
 * Prices: see https://1gateway.dev/agents.md (the 402 quote is authoritative).
 */
import { BASE_URL, payingFetch, receipt } from "./client";

const payFetch = payingFetch();

async function call(label: string, path: string) {
  const res = await payFetch(BASE_URL + path);
  const body = await res.json();
  console.log(`\n## ${label}  (HTTP ${res.status}, ${receipt(res)})`);
  console.log(JSON.stringify(body, null, 2).slice(0, 1200));
}

// Public holidays (KASI) for a year
await call("Korea public holidays 2026", "/v1/calendar/holidays?year=2026");
// Apartment sale transactions (MOLIT): region = 5-digit LAWD_CD (11680 = Gangnam-gu, Seoul), month = YYYYMM
await call("Gangnam-gu apartment trades", "/v1/realestate/apartment-trades?region=11680&month=202609");
// Short-term weather forecast (KMA) by coordinates
await call("Seoul weather forecast", "/v1/weather/forecast?lat=37.5665&lon=126.978");
// Trade pulse: latest export flash + monthly trade in one call
await call("Korea trade pulse", "/v1/trade/pulse");
