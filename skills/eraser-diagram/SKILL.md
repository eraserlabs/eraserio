---
name: eraser-diagram
description: 'Generates architecture diagrams from code, infrastructure, or descriptions. Use when user asks to visualize, diagram, or document system architecture.'
license: MIT
compatibility: Requires network access to call Eraser API
allowed-tools: Read Write Bash(curl:*)
metadata:
  version: "1.0.0"
  author: Eraser Labs
  tags: diagram, architecture, infrastructure, visualization, terraform, aws, azure, cloud
---

# Eraser Diagram Generator

Generates professional architecture diagrams directly from code, infrastructure files, or natural language descriptions using the Eraser API.

## When to Use

Activate this skill when:

- User asks to create, generate, or visualize a diagram
- User wants to document architecture from code
- User has Terraform, AWS, Azure, or infrastructure files
- User describes a system and wants it visualized
- User mentions "diagram", "architecture", "visualize", or "draw"

## How It Works

1. **Analyze the source**: Extract architecture information from code, files, or descriptions
2. **Generate Eraser DSL**: Create Eraser DSL code that describes the diagram
3. **Call the Eraser API**: Make an HTTP POST request to render the diagram
4. **Return the result**: Present the image URL and editor link to the user

## API Integration

### Endpoint

```
POST https://app.eraser.io/api/render/elements
Content-Type: application/json
Authorization: Bearer ${ERASER_API_KEY}
X-Skill-Source: eraser-skill
```

**Note**: The `X-Skill-Source` header identifies the AI agent. Replace `eraser-skill` with your agent name (see instructions below).

### Diagram Types

Available `diagramType` values:

- `"cloud-architecture-diagram"` - For infrastructure, AWS, Azure, GCP diagrams
- `"sequence-diagram"` - For sequence/interaction diagrams
- `"entity-relationship-diagram"` - For database/ER diagrams
- `"flowchart-diagram"` - For process flows
- `"bpmn-diagram"` - For BPMN process diagrams

### Response Format

```json
{
  "imageUrl": "https://storage.googleapis.com/eraser-images/...",
  "createEraserFileUrl": "https://app.eraser.io/new?requestId=abc123&state=xyz789",
  "renderedElements": [...]
}
```

**Note**: `createEraserFileUrl` is now always returned, regardless of whether an API token is provided. The URL uses a short `requestId` and `state` format instead of base64-encoded data, making it more reliable for large diagrams.

### Error Responses

| Status | Error | Cause | Solution |
| --- | --- | --- | --- |
| 400 | `Diagram element has no code` | Missing `code` field in element | Ensure element has valid DSL code |
| 400 | `Diagram element has no diagramType` | Missing `diagramType` field | Add valid diagramType to element |
| 400 | `Invalid diagramType` | Unsupported diagram type | Use one of the supported types listed above |
| 401 | `Unauthorized` | Invalid or expired API key | Check `ERASER_API_KEY` is valid |
| 500 | `Internal server error` | Server-side issue | Retry the request; if persistent, contact support |

**Error Response Format:**

```json
{
  "error": {
    "message": "Diagram element has no code",
    "status": 400
  }
}
```

**Troubleshooting Tips:**

- Verify DSL syntax is correct before making the API call
- Ensure `diagramType` matches the DSL content (e.g., sequence DSL with `sequence-diagram`)
- For auth errors, verify the API key is set correctly as an environment variable

## Instructions

When the user requests a diagram:

1. **Extract Information**

   - If code/files are provided, analyze the structure, resources, and relationships
   - If description is provided, identify key components and connections
   - Determine the appropriate diagram type

2. **Generate Eraser DSL**

   - Create Eraser DSL code that represents the architecture
   - **CRITICAL: Label Formatting Rules**
     - Labels MUST be on a single line - NEVER use newlines inside label attributes
     - Keep labels simple and readable - prefer separate labels over concatenating too much metadata
     - Format DSL with proper line breaks (one node/group per line, but labels stay on single lines)
   - For cloud architecture diagrams, use this syntax:
     ```
     main-vpc [label: VPC] {
       public-subnet [label: "Public Subnet"] {
         web-server [icon: aws-ec2, label: "Web Server"]
         load-balancer [icon: aws-elb]
       }
       private-subnet [label: "Private Subnet"] {
         database [icon: aws-rds]
       }
     }
     load-balancer -> web-server
     web-server -> database
     ```
   - For sequence diagrams, use:
     ```
     title User Login Flow
     User > API: POST /login
     API > Database: Query user
     Database > API: Return user data
     API > User: Return JWT token
     ```
   - For ER diagrams, use:
     ```
     User {
       id: int
       name: string
       email: string
     }
     Order {
       id: int
       userId: int
       total: decimal
     }
     User -> Order
     ```

3. **Create Element Definition**

   - Create an element object with:
     - `type: "diagram"`
     - `id: "diagram-1"` (or generate a unique ID)
     - `code: "<your generated DSL code>"`
     - `diagramType: "<appropriate type>"`

4. **Make the HTTP Request**

   **IMPORTANT**: You MUST execute this curl command after generating the DSL. Never stop after generating DSL without making the API call.

   **CRITICAL**: In the `X-Skill-Source` header below, you MUST replace the value with your AI agent name:
   - If you are Claude (Anthropic), use: `claude`
   - If you are running in Cursor, use: `cursor`
   - If you are ChatGPT (OpenAI), use: `chatgpt`
   - If you are Gemini (Google), use: `gemini`
   - Otherwise, use your model/agent name in lowercase

   ```bash
   curl -X POST https://app.eraser.io/api/render/elements \
     -H "Content-Type: application/json" \
     -H "X-Skill-Source: eraser-skill" \
     -H "Authorization: Bearer ${ERASER_API_KEY}" \
     -d '{
       "elements": [{
         "type": "diagram",
         "id": "diagram-1",
         "code": "<your generated DSL>",
         "diagramType": "cloud-architecture-diagram"
       }],
       "scale": 2,
       "theme": "${ERASER_THEME:-dark}"
     }'
   ```

5. **Track Sources During Analysis**

   As you analyze files and resources to generate the diagram, track:

   - **Internal files**: Record each file path you read and what information was extracted (e.g., `infra/main.tf` - VPC and subnet definitions)
   - **External references**: Note any documentation, examples, or URLs consulted (e.g., AWS VPC best practices documentation)
   - **Annotations**: For each source, note what it contributed to the diagram

6. **Handle the Response**

   **CRITICAL: Minimal Output Format**

   Your response MUST always include these elements with clear headers:

   1. **Diagram Preview**: Display with a header
      ```
      ## Diagram
      ![{Title}]({imageUrl})
      ```
      Use the ACTUAL `imageUrl` from the API response.

   2. **Editor Link**: Display with a header
      ```
      ## Open in Eraser
      [Edit this diagram in the Eraser editor]({createEraserFileUrl})
      ```
      Use the ACTUAL URL from the API response.

   3. **Sources section**: Brief list of files/resources analyzed (if applicable)
      ```
      ## Sources
      - `path/to/file` - What was extracted
      ```

   4. **Diagram Code section**: The Eraser DSL in a code block with `eraser` language tag
      ```
      ## Diagram Code
      ```eraser
      {DSL code here}
      ```
      ```

   5. **Learn More link**: `You can learn more about Eraser at https://docs.eraser.io!`

   **Additional content rules:**
   - If the user ONLY asked for a diagram, include NOTHING beyond the 5 elements above
   - If the user explicitly asked for more (e.g., "explain the architecture", "suggest improvements"), you may include that additional content
   - Never add unrequested sections like Overview, Security Considerations, Testing, etc.

   The default output should be SHORT. The diagram image speaks for itself.

7. **Error Handling**
   - If API call fails, explain the error
   - Suggest checking API key if authentication fails
   - Offer to regenerate DSL code as fallback

## Eraser DSL Syntax Guide

### Cloud Architecture Diagrams

**Basic Syntax:**

- Nodes: `node-name [icon: aws-ec2, label: "Display Name"]`
- Groups/Containers: `group-name [label: VPC] { ... }` or `group-name [label: "My VPC"] { ... }`
- Connections: `node-name-1 -> node-name-2` or `node-name-1 <-> node-name-2`
- Node names are unique identifiers (like variable names, no spaces or special chars)
- Icons set via `[icon: aws-ec2]` property
- Labels set via `[label: ...]` property:
  - Simple labels: `[label: VPC]` (no quotes needed)
  - Labels with spaces: `[label: "Public Subnet"]` (quotes required)
  - Labels with special chars: `[label: "Subnet (10.0.1.0/24)"]` (quotes required)
  - Labels with metadata: `[label: "VPC 10.0.0.0/16"]` (all on one line, quoted)
  - **NEVER** split labels across lines: ❌ `[label: VPC\n10.0.0.0/16]` ✅ `[label: "VPC 10.0.0.0/16"]`
- **Formatting**: Each node/group/connection on its own line for readability, but labels must be single-line
- Connections reference node names, not icon types

**Example:**

```
main-vpc [label: VPC] {
  public-subnet {
    web-server [icon: aws-ec2]
    load-balancer [icon: aws-elb]
  }
  private-subnet {
    database [icon: aws-rds]
    cache [icon: aws-elasticache]
  }
}
load-balancer -> web-server
web-server -> database
```

### Sequence Diagrams

**Basic Syntax:**

- Actors: `ActorName` (one per line or inline)
- Messages: `Actor1 > Actor2: message text`
- Blocks: `alt [label] { ... }`, `loop [label] { ... }`, etc.

**Example:**

```
title API Request Flow
Client > API Gateway: POST /api/users
API Gateway > Lambda: Invoke function
Lambda > DynamoDB: Query users
DynamoDB > Lambda: Return results
Lambda > API Gateway: Return response
API Gateway > Client: 200 OK
```

### Entity Relationship Diagrams

**Basic Syntax:**

- Entities: `EntityName { field: type }`
- Relationships: `Entity1 -> Entity2`

**Example:**

```
User {
  id: int
  name: string
  email: string
}
Order {
  id: int
  userId: int
  total: decimal
}
User -> Order
```

## Best Practices

- **Generate Valid DSL**: Ensure the DSL syntax is correct before calling the API
- **Quote Labels Properly**: Always quote labels that contain spaces, special characters, or numbers
- **Single-Line Labels**: Labels MUST be on a single line - never use newlines inside label attributes
- **Format for Readability**: Put each node, group, and connection on its own line (but keep labels single-line)
- **Include Metadata**: If including CIDR blocks, instance types, etc., put them in the same quoted label string: `[label: "VPC 10.0.0.0/16"]`
- **Use Appropriate Diagram Type**: Choose the right `diagramType` for the content
- **Group Related Items**: Use containers (VPCs, modules) to group related components
- **Specify Connections**: Show data flows, dependencies, and relationships
- **Handle Large Systems**: Break down very large systems into focused diagrams
- **Include Source Header**: Always include `X-Skill-Source` header with your AI agent name (claude, cursor, chatgpt, etc.)

## Examples

### Example 1: Simple Infrastructure

**User Input:**

```
I have a web app with a load balancer, 3 EC2 instances, and an RDS database
```

**Expected Behavior:**

1. Generates DSL:

   ```
   main-vpc [label: VPC] {
     public-subnet {
       load-balancer [icon: aws-elb]
       web-server-1 [icon: aws-ec2]
       web-server-2 [icon: aws-ec2]
       web-server-3 [icon: aws-ec2]
     }
     private-subnet {
       database [icon: aws-rds]
     }
   }
   load-balancer -> web-server-1, web-server-2, web-server-3
   web-server-1 -> database
   web-server-2 -> database
   web-server-3 -> database
   ```

2. Calls API with `diagramType: "cloud-architecture-diagram"`

### Example 2: From Terraform Code

**User Input:**

```
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_instance" "web" {
  subnet_id = aws_subnet.public.id
  instance_type = "t3.micro"
}
```

**Expected Behavior:**

1. Parse Terraform to identify resources
2. Extract relationships (subnets in VPC, EC2 in subnet, etc.)
3. Generate DSL code with proper formatting:
   ```
   main-vpc [label: "VPC 10.0.0.0/16"] {
     public-subnet [label: "Public Subnet 10.0.1.0/24"] {
       web-instance [icon: aws-ec2, label: "Web Instance t3.micro"]
     }
   }
   ```
   **Important**: All label text must be on a single line within quotes. If including metadata like CIDR blocks or instance types, include them in the same quoted string, separated by spaces.
4. Call API with `diagramType: "cloud-architecture-diagram"`

### Example 3: Sequence Diagram

**User Input:**

```
Show the flow: User -> API Gateway -> Lambda -> DynamoDB
```

**Expected Behavior:**

1. Generates DSL:

   ```
   title User Request Flow
   User > API Gateway: Request
   API Gateway > Lambda: Invoke
   Lambda > DynamoDB: Query
   DynamoDB > Lambda: Results
   Lambda > API Gateway: Response
   API Gateway > User: Response
   ```

2. Calls API with `diagramType: "sequence-diagram"`

## Environment Variables

If the user has set `ERASER_API_KEY`, use it in the Authorization header for watermark-free, high-resolution diagrams.

## Notes

- Free tier diagrams include a watermark but are fully functional
- The `createEraserFileUrl` is always returned (works for both free and paid tiers) and allows users to edit diagrams in the Eraser web editor
- URLs use a secure `requestId` + `state` pattern, making them short and reliable even for large diagrams
- The DSL code can be used to regenerate or modify diagrams
- API responses are cached, so identical requests return quickly
- Always include `X-Skill-Source` header with your AI agent name (claude, cursor, chatgpt, etc.) to help track usage
