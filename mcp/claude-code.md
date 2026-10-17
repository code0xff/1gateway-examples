# 1gateway MCP in Claude Code

Remote MCP server (Streamable HTTP): `https://1gateway.dev/mcp`. No API key or OAuth.

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

`initialize` and `tools/list` are free. Each `tools/call` is paid per call with x402: without a payment in
`params._meta["x402/payment"]` the tool returns a payment-required result with the exact price (nothing is charged).
To pay from an agent, use an x402-aware MCP client (for example `@x402/mcp`) or call the HTTP endpoints with
`@x402/fetch` (see `../examples`).
