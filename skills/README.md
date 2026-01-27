# Eraser Skills

Agent skills for AI coding assistants to generate architecture diagrams from code, infrastructure, or descriptions.

## Quick Start

```bash
npx skills add eraserlabs/eraser-io
```

## Available Skills

| Skill | Description | Use Case |
|-------|-------------|----------|
| [eraser-diagrams](eraser-diagrams/) | Core diagram generation | General purpose - works with any code or description |
| [terraform-diagrams](terraform-diagrams/) | Terraform visualization | Generate diagrams from `.tf` files |
| [aws-diagrams](aws-diagrams/) | AWS infrastructure | Visualize AWS resources from CLI or CloudFormation |
| [azure-diagrams](azure-diagrams/) | Azure resources | Generate diagrams from ARM templates or Azure CLI |
| [bicep-diagrams](bicep-diagrams/) | Azure Bicep | Create diagrams from Bicep files |

## Features

- **Zero Configuration** - Works out of the box, no API key required for free tier
- **Multiple Formats** - Cloud architecture, sequence diagrams, ER diagrams, flowcharts, and more
- **Editable Output** - Get an Eraser link to edit diagrams manually or with AI
- **Free Tier** - Generate watermarked diagrams without an API key
- **Paid Tier** - Remove watermarks and get high-resolution output

## Configuration (Optional)

For watermark-free, high-resolution diagrams:

1. Get your API key from the [Eraser documentation](https://docs.eraser.io/reference/api-token)

2. Add to a `.env` file in your project root:

   ```bash
   ERASER_API_KEY=your_key_here
   ERASER_THEME=dark   # or "light" (default: dark)
   ```

   Or set as environment variables:

   ```bash
   export ERASER_API_KEY=your_key_here
   export ERASER_THEME=dark
   ```

3. The skill will automatically detect and use your settings

## Documentation

- [Eraser API Documentation](https://docs.eraser.io)
- [Get an API Token](https://docs.eraser.io/reference/api-token)

## License

MIT - see [LICENSE](../LICENSE) for details.
