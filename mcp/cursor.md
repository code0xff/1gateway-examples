# 1gateway MCP in Cursor

Add to `~/.cursor/mcp.json` (all projects) or `.cursor/mcp.json` (this project):

```json
{
  "mcpServers": {
    "1gateway": { "url": "https://1gateway.dev/mcp" }
  }
}
```

Tools are listed for free; each tool call is paid per call with x402 (USDC on Base). An unpaid call returns a
payment-required result with the price, and nothing is charged. See `claude-code.md` for how payment works.
