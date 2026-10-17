/**
 * Shared x402 client: wraps fetch so a 402 Payment Required is paid (USDC on Base) and retried automatically.
 * A per-payment spend cap (MAX_USD_PER_CALL, default $0.01) refuses anything pricier.
 */
import { wrapFetchWithPaymentFromConfig, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

export const BASE_URL = process.env.ONEGATEWAY_URL ?? "https://1gateway.dev";

export function payingFetch() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk || !/^0x[0-9a-fA-F]{64}$/.test(pk)) {
    throw new Error("Set PRIVATE_KEY (0x + 64 hex) to a Base wallet with a little USDC. See .env.example. Try `npm run quote` first: it needs no wallet.");
  }
  const account = privateKeyToAccount(pk as `0x${string}`);
  const cap = `$${process.env.MAX_USD_PER_CALL ?? "0.01"}`;
  return wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [{ network: "eip155:8453", client: new ExactEvmScheme(account) }], // Base mainnet
    spendControls: { maxAmountPerPayment: cap },
  });
}

/** Print the settlement receipt (tx hash) if the server returned one. */
export function receipt(res: Response): string {
  const h = res.headers.get("payment-response") ?? res.headers.get("x-payment-response");
  if (!h) return "no payment receipt (not charged)";
  const r = decodePaymentResponseHeader(h) as { transaction?: string; network?: string };
  return r.transaction ? `paid, tx https://basescan.org/tx/${r.transaction}` : "payment receipt without tx";
}
