# 1gateway MCP in Cursor

Add the server to `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (this project):

```json
{
  "mcpServers": {
    "1gateway": { "url": "https://1gateway.dev/mcp" }
  }
}
```

Cursor uses the `url` field for Streamable HTTP. Restart Cursor, or toggle the server in its MCP settings. Logs are under Output → MCP Logs.

Tools are listed for free. Each tool call is paid per call with x402, in USDC on any network the payment quote lists.

Cursor shows the tools and prices, but it cannot sign x402 payments, so a paid call through the remote URL returns its price quote and nothing is charged. To pay from your own wallet, use the local stdio proxy [`1gateway-mcp`](https://www.npmjs.com/package/1gateway-mcp) instead:

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

Use a dedicated wallet with a small USDC balance. The proxy pays on any network in the quote that it can sign for, and stays within the per-call and session caps.

See `claude-code.md` for how the payment flow works.
