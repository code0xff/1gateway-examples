# 1gateway MCP in Claude Code (and Claude Desktop)

Remote MCP server: `https://1gateway.dev/mcp`. It uses Streamable HTTP, is stateless and needs no API key or OAuth.

## Claude Code

```bash
claude mcp add --transport http 1gateway https://1gateway.dev/mcp
claude mcp list
```

Or in a project `.mcp.json`:

```json
{
  "mcpServers": {
    "1gateway": { "type": "http", "url": "https://1gateway.dev/mcp" }
  }
}
```

## Claude Desktop

Open Settings → Connectors → Add custom connector, and set the URL to `https://1gateway.dev/mcp`.

## Paying for tool calls

`initialize` and `tools/list` are free. Each `tools/call` is paid per call with x402 v2, in USDC on any network the payment quote lists. The live list is in https://1gateway.dev/agents.md and in the quote itself.

Claude can list the tools and their prices, but it cannot sign x402 payments. A paid tool therefore returns its price quote and nothing is charged.

The payment flow:

1. Call the tool without payment. It returns `isError` with an x402 `PaymentRequired` object. Its `accepts` array has one option per network: CAIP-2 network, asset, amount in atomic units and payTo.
2. Sign one option with an x402 client (`exact` scheme).
3. Call the tool again with the signed payload in `params._meta["x402/payment"]`. A call that ends with `isError` is not charged.

**Paying from Claude.** A local stdio proxy that pays from your own wallet, with per-call and session spend caps, is coming soon. https://1gateway.dev/agents.md will name the package once it is published. Do not install look-alike packages before then.

**Paying from code.** `@x402/mcp` (`createx402MCPClient`) signs MCP tool calls. You can also call the HTTP endpoints with `@x402/fetch` (see `../examples`).
