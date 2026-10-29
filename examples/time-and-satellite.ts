/**
 * Scheduling + satellite endpoints, paid per call with x402 (each call is a separate payment):
 *   PRIVATE_KEY=0x... npm run time-and-satellite
 * See a quote first without paying:
 *   npm run quote -- "/v1/time/overlap?zones=America/New_York,Europe/London,Asia/Seoul"
 * Prices: see https://1gateway.dev/agents.md (the 402 quote is authoritative).
 * Invalid input returns 400 before payment; satellite calls with no usable scene return 404 and are not charged.
 */
import { BASE_URL, payingFetch, receipt } from "./client";

const payFetch = payingFetch();

async function call(label: string, path: string) {
  const res = await payFetch(BASE_URL + path);
  const body = await res.json();
  console.log(`\n## ${label}  (HTTP ${res.status}, ${receipt(res)})`);
  console.log(JSON.stringify(body, null, 2).slice(0, 1200));
}

// Working-hours overlap across IANA time zones (~$0.002)
await call("NY / London / Seoul overlap", "/v1/time/overlap?zones=America/New_York,Europe/London,Asia/Seoul&date=2026-11-03&work_start=09:00&work_end=18:00");
// Business days: add N business days, or count between dates; KR uses KASI holidays (~$0.003)
await call("US +5 business days from 2026-12-22", "/v1/time/business-days?start=2026-12-22&days=5&country=US");
await call("KR business days 2026-12-22..2027-01-15", "/v1/time/business-days?start=2026-12-22&end=2027-01-15&country=KR");
// Sentinel-2 before/after comparison around a point (~$0.018)
await call("Seoul City Hall before/after", "/v1/geo/satellite/compare?lat=37.5665&lon=126.978&radius_m=2000&before=2026-04-15&after=2026-10-08");
// Monthly vegetation/change trend around a point (~$0.012; up to 12 months, may take longer)
await call("Daejeon 6-month trend", "/v1/geo/satellite/trend?lat=36.35&lon=127.38&radius_m=2000&months=6");
