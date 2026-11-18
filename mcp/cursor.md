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

Cursor shows the tools and prices, but it cannot sign x402 payments, so a paid call returns its price quote and nothing is charged. A local stdio proxy that pays from your own wallet, with spend caps, is coming soon; https://1gateway.dev/agents.md will name it once it is published. Until then, pay from code with `@x402/mcp`.

See `claude-code.md` for how the payment flow works.
