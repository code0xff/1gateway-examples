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

**Paying from Claude.** Run the local stdio proxy [`1gateway-mcp`](https://www.npmjs.com/package/1gateway-mcp) instead of the remote URL. It forwards every tool, and when a call returns a quote it pays from your own wallet within spend caps, then retries the call.

Claude Code:

```bash
claude mcp add 1gateway --env ONEGATEWAY_EVM_PRIVATE_KEY=0x... -- npx -y 1gateway-mcp
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "1gateway": {
      "command": "npx",
      "args": ["-y", "1gateway-mcp"],
      "env": {
        "ONEGATEWAY_EVM_PRIVATE_KEY": "0x...",
        "ONEGATEWAY_MAX_PER_CALL_USD": "0.05",
        "ONEGATEWAY_MAX_TOTAL_USD": "1.00"
      }
    }
  }
}
```

Use a dedicated wallet that holds only a small USDC balance. The proxy pays on any network in the quote that it can sign for: any EVM network with `ONEGATEWAY_EVM_PRIVATE_KEY`, and Solana with `ONEGATEWAY_SVM_PRIVATE_KEY`. `ONEGATEWAY_NETWORKS` narrows the list, for example `base,polygon`. Defaults: $0.05 per call, $1.00 per session, payTo pinned to 1gateway. All options are in the package README.

**Paying from code.** `@x402/mcp` (`createx402MCPClient`) signs MCP tool calls. You can also call the HTTP endpoints with `@x402/fetch` (see `../examples`).
