/**
 * HWP / HWPX (Hancom Office) → Markdown, paid per call with x402.
 *   PRIVATE_KEY=0x... npm run hwp-to-markdown -- ./report.hwp
 *   PRIVATE_KEY=0x... npm run hwp-to-markdown -- https://example.com/notice.hwpx
 * The type and price tier are decided BEFORE payment (HWP/HWPX tier, see /agents.md); invalid, unsupported or
 * too-large files are rejected with 4xx before any payment, and failed conversions are never charged.
 * Size caps for HWP/HWPX on the current plan are published in the endpoint description (openapi.json).
 */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { BASE_URL, payingFetch, receipt } from "./client";

const input = process.argv[2];
if (!input) {
  console.error("usage: npm run hwp-to-markdown -- <file.hwp|file.hwpx|https://...>");
  process.exit(1);
}
const payFetch = payingFetch();

let res: Response;
if (/^https?:\/\//.test(input)) {
  res = await payFetch(`${BASE_URL}/v1/convert/markdown?url=${encodeURIComponent(input)}`);
} else {
  // JSON body with base64 content (multipart field "file" and raw bytes also work)
  const bytes = await readFile(input);
  res = await payFetch(`${BASE_URL}/v1/convert/markdown`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentBase64: bytes.toString("base64"), filename: basename(input) }),
  });
}
const body = (await res.json()) as { markdown?: string; [k: string]: unknown };
console.error(`HTTP ${res.status}, ${receipt(res)}`);
if (!res.ok) {
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}
const { markdown, ...meta } = body;
console.error(JSON.stringify(meta, null, 2));
console.log(markdown);
