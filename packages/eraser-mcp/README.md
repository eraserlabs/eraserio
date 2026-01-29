# Eraser MCP Server

Model Context Protocol (MCP) server for generating diagrams with [Eraser](https://eraser.io).

## Quick Start

```bash
npx @eraserlabs/eraser-mcp
```

## Configuration

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "eraser": {
      "command": "npx",
      "args": ["@eraserlabs/eraser-mcp"],
      "env": {
        "ERASER_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "eraser": {
      "command": "npx",
      "args": ["@eraserlabs/eraser-mcp"],
      "env": {
        "ERASER_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ERASER_API_TOKEN` | Yes | Your Eraser API token |
| `ERASER_API_URL` | No | Custom API URL (default: `https://app.eraser.io/api/mcp`) |
| `ERASER_OUTPUT_DIR` | No | Directory to save rendered diagrams (default: `.eraser/scratchpad`) |

## Available Tools

| Tool | Description |
|------|-------------|
| `renderSequenceDiagram` | Render sequence diagrams |
| `renderEntityRelationshipDiagram` | Render ERD diagrams |
| `renderCloudArchitectureDiagram` | Render cloud architecture diagrams |
| `renderFlowchart` | Render flowcharts |
| `renderBpmnDiagram` | Render BPMN diagrams |
| `renderPrompt` | Generate diagrams from natural language using AI |
| `renderElements` | Render multiple diagram elements |

## Documentation

- [Eraser Agent Integration Documentation](https://docs.eraser.io/docs/using-ai-agent-integrations)
- [Get an API Token](https://docs.eraser.io/reference/api-token)

## License

MIT
