Paste below configuration into `.claude.json` when setting up claude code on new computer:

```json
"mcpServers": {
    "framelinkFigma": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "-p",
        "image-q",
        "-p",
        "figma-developer-mcp@0.12.0",
        "figma-developer-mcp",
        "--figma-api-key",
        "<your-figma-api-key>",
        "--no-telemetry",
        "--stdio"
      ]
    },
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "--registry",
        "https://registry.npmjs.org",
        "chrome-devtools-mcp@latest",
        "--autoConnect"
      ]
    }
  },
```
