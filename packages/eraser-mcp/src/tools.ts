import { z } from 'zod';

type JsonSchema = Record<string, unknown>;

/**
 * Settings duplicated from @eraserlabs/shared/modules/diagram-parser/settings
 * We avoid importing to keep eraser-mcp buildable independently.
 */
export const colorModeSettings = ['pastel', 'bold', 'outline'] as const;
export const styleModeSettings = ['plain', 'shadow', 'watercolor'] as const;
export const typefaceSettings = ['rough', 'clean', 'mono'] as const;
export const directionSettings = ['up', 'down', 'left', 'right'] as const;

/**
 * The diagram types supported by the MCP tools.
 * Duplicated from DiagramTypes enum, excluding 'custom-diagram'.
 */
export enum DiagramTypes {
  SD = 'sequence-diagram',
  ERD = 'entity-relationship-diagram',
  CAD = 'cloud-architecture-diagram',
  FLOW = 'flowchart-diagram',
  BPMN = 'bpmn-diagram',
}

const diagramElementSchema = z.object({
  type: z.literal('diagram'),
  diagramType: z.nativeEnum(DiagramTypes),
  code: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
});

const renderOptionsSchema = z
  .object({
    padding: z.number().optional(),
    imageQuality: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    background: z.boolean().optional(),
    theme: z.enum(['light', 'dark']).optional(),
    format: z.enum(['png', 'jpeg']).optional(),
    selection: z.array(z.string()).optional(),
    ignoreElements: z.array(z.string()).optional(),
    limitToSelection: z.boolean().optional(),
    customIcons: z.array(z.unknown()).optional(),
    typeface: z.enum(typefaceSettings).optional(),
    colorMode: z.enum(colorModeSettings).optional(),
    styleMode: z.enum(styleModeSettings).optional(),
    direction: z.enum(directionSettings).optional(),
    title: z.string().optional(),
  })
  .passthrough();

const renderPromptSchema = renderOptionsSchema
  .extend({
    text: z.string(),
    returnFile: z.boolean().optional(),
    diagramType: z.string().optional(),
    mode: z.string().optional(),
    priorRequestId: z.string().optional(),
    attachments: z.array(z.unknown()).optional(),
    contextId: z.string().optional(),
    git: z.unknown().optional(),
    fileOptions: z
      .object({
        create: z.boolean().optional(),
        linkAccess: z
          .enum([
            'no-link-access',
            'anyone-with-link-can-edit',
            'publicly-viewable',
            'publicly-editable',
          ])
          .optional(),
      })
      .optional(),
  })
  .passthrough();

const renderElementsSchema = renderOptionsSchema
  .extend({
    elements: z.array(diagramElementSchema),
    returnFile: z.boolean().optional(),
    fileName: z.string().optional(),
    teamId: z.string().optional(),
    returnElements: z.boolean().optional(),
    skipCache: z.boolean().optional(),
  })
  .passthrough();

// Schema for individual diagram type tools
const singleDiagramSchema = z.object({
  code: z.string(),
  theme: z.enum(['light', 'dark']).optional(),
  colorMode: z.enum(colorModeSettings).optional(),
  styleMode: z.enum(styleModeSettings).optional(),
  typeface: z.enum(typefaceSettings).optional(),
  background: z.boolean().optional(),
  imageQuality: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
});

export type RenderPromptInput = z.infer<typeof renderPromptSchema>;
export type DiagramElementInput = z.infer<typeof diagramElementSchema>;
export type RenderElementsInput = z.infer<typeof renderElementsSchema>;
export type SingleDiagramInput = z.infer<typeof singleDiagramSchema>;

export type McpToolDefinition<TInput> = {
  name: string;
  description: string;
  schema: z.ZodType<TInput>;
  jsonSchema: JsonSchema;
};

const renderPromptJsonSchema: JsonSchema = {
  type: 'object',
  additionalProperties: true,
  required: ['text'],
  properties: {
    text: { type: 'string' },
    returnFile: { type: 'boolean' },
    diagramType: { type: 'string' },
    mode: { type: 'string' },
    priorRequestId: { type: 'string' },
    attachments: { type: 'array', items: {} },
    contextId: { type: 'string' },
    git: {},
    fileOptions: {
      type: 'object',
      additionalProperties: false,
      properties: {
        create: { type: 'boolean' },
        linkAccess: {
          type: 'string',
          enum: [
            'no-link-access',
            'anyone-with-link-can-edit',
            'publicly-viewable',
            'publicly-editable',
          ],
        },
      },
    },
    padding: { type: 'number' },
    imageQuality: { type: 'number', enum: [1, 2, 3] },
    background: { type: 'boolean' },
    theme: { type: 'string', enum: ['light', 'dark'] },
    format: { type: 'string', enum: ['png', 'jpeg'] },
    selection: { type: 'array', items: { type: 'string' } },
    typeface: { type: 'string', enum: [...typefaceSettings] },
    colorMode: { type: 'string', enum: [...colorModeSettings] },
    styleMode: { type: 'string', enum: [...styleModeSettings] },
    direction: { type: 'string', enum: [...directionSettings] },
    title: { type: 'string' },
  },
};

const renderElementsJsonSchema: JsonSchema = {
  type: 'object',
  additionalProperties: true,
  required: ['elements'],
  properties: {
    elements: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'diagramType', 'code'],
        properties: {
          type: { type: 'string', const: 'diagram' },
          diagramType: {
            type: 'string',
            enum: Object.values(DiagramTypes),
          },
          code: { type: 'string' },
        },
      },
    },
    fileName: { type: 'string' },
    teamId: { type: 'string' },
    returnElements: { type: 'boolean' },
    skipCache: { type: 'boolean' },
    padding: { type: 'number' },
    imageQuality: { type: 'number', enum: [1, 2, 3] },
    background: { type: 'boolean' },
    theme: { type: 'string', enum: ['light', 'dark'] },
    format: { type: 'string', enum: ['png', 'jpeg'] },
    typeface: { type: 'string', enum: [...typefaceSettings] },
    colorMode: { type: 'string', enum: [...colorModeSettings] },
    styleMode: { type: 'string', enum: [...styleModeSettings] },
    direction: { type: 'string', enum: [...directionSettings] },
  },
};

const singleDiagramJsonSchema: JsonSchema = {
  type: 'object',
  required: ['code'],
  properties: {
    code: { type: 'string', description: 'The diagram code in Eraser syntax' },
    theme: { type: 'string', enum: ['light', 'dark'] },
    colorMode: { type: 'string', enum: [...colorModeSettings] },
    styleMode: { type: 'string', enum: [...styleModeSettings] },
    typeface: { type: 'string', enum: [...typefaceSettings] },
    background: { type: 'boolean', description: 'Whether to include a solid background' },
    imageQuality: { type: 'number', enum: [1, 2, 3] },
  },
};

// Diagram type descriptions with syntax examples
const SEQUENCE_DIAGRAM_DESCRIPTION = `Render a sequence diagram. Use Eraser's sequence diagram syntax.

Example syntax:
\`\`\`
title Authentication Flow
autoNumber on

Client [icon: monitor, color: gray]
Server [icon: server, color: blue]
Service [icon: tool, color: green]

Client > Server: Data request
activate Server
Server <> Service: Service request

loop [label: until success, color: green] {
  Service > Service: Check availability
}

Server - Service: Data processing
Server --> Client: Data response
deactivate Server
\`\`\``;

const ERD_DESCRIPTION = `Render an entity-relationship diagram. Use Eraser's ERD syntax.

Example syntax:
\`\`\`
title E-commerce Database

// Define tables with columns
users [icon: user, color: blue] {
  id int pk
  email string
  name string
  created_at timestamp
}

orders [icon: shopping-cart, color: green] {
  id int pk
  user_id int
  total decimal
  status string
  created_at timestamp
}

products [icon: box, color: orange] {
  id int pk
  name string
  price decimal
  stock int
}

order_items [icon: list] {
  order_id int pk
  product_id int pk
  quantity int
  price decimal
}

// Relationships
users.id < orders.user_id
orders.id < order_items.order_id
products.id < order_items.product_id
\`\`\``;

const CLOUD_ARCHITECTURE_DESCRIPTION = `Render a cloud architecture diagram. Use Eraser's cloud architecture syntax.

Example syntax:
\`\`\`
title AWS Microservices Architecture

// Groups with cloud provider icons
AWS Cloud [icon: aws] {
  VPC [icon: aws-vpc] {
    Public Subnet {
      ALB [icon: aws-elb]
      NAT Gateway [icon: aws-nat-gateway]
    }
    Private Subnet {
      ECS Cluster [icon: aws-ecs] {
        API Service [icon: aws-lambda]
        Worker Service [icon: aws-lambda]
      }
      RDS [icon: aws-rds]
      ElastiCache [icon: aws-elasticache]
    }
  }
  S3 [icon: aws-s3]
  CloudFront [icon: aws-cloudfront]
}

Users [icon: users]

// Connections
Users > CloudFront
CloudFront > ALB
ALB > API Service
API Service > RDS
API Service > ElastiCache
Worker Service > S3
\`\`\``;

const FLOWCHART_DESCRIPTION = `Render a flowchart diagram. Use Eraser's flowchart syntax. Prefer horizontal layout (direction right) unless the user wants a vertical diagram.

Example syntax:
\`\`\`
title User Registration Flow
direction right

// Nodes with shapes and icons
Start [shape: oval, icon: play]
Enter Details [icon: edit]
Valid Email? [shape: diamond, icon: help-circle]
Send Verification [icon: mail]
Email Verified? [shape: diamond]
Create Account [icon: user-plus, color: green]
Show Error [icon: alert-triangle, color: red]
End [shape: oval, icon: check]

// Groups
Validation [color: blue] {
  Check Password Strength [icon: lock]
  Password OK? [shape: diamond]
}

// Connections with labels
Start > Enter Details
Enter Details > Valid Email?
Valid Email? > Send Verification: Yes
Valid Email? > Show Error: No
Send Verification > Email Verified?
Email Verified? > Create Account: Yes
Email Verified? > Show Error: No
Create Account > End
Show Error > Enter Details
\`\`\``;

const BPMN_DESCRIPTION = `Render a BPMN (Business Process Model and Notation) diagram. Use Eraser's BPMN syntax.

Example syntax:
\`\`\`
title Order Fulfillment Process

// Swimlanes (pools)
Customer [color: blue] {
  Place Order [type: event, icon: shopping-cart]
  Receive Confirmation [type: event, icon: mail]
  Receive Package [type: event, icon: package]
}

Sales [color: green] {
  Process Order [icon: clipboard]
  Check Inventory [icon: database]
  In Stock? [type: gateway, icon: help-circle]
  Create Backorder [icon: clock]
  Confirm Order [icon: check]
}

Warehouse [color: orange] {
  Pick Items [icon: box]
  Pack Order [icon: package]
  Ship Order [icon: truck]
}

// Flow connections (use --> for message flows between pools)
Place Order --> Process Order: Order details
Process Order > Check Inventory
Check Inventory > In Stock?
In Stock? > Confirm Order: Yes
In Stock? > Create Backorder: No
Confirm Order --> Receive Confirmation: Confirmation email
Confirm Order > Pick Items
Pick Items > Pack Order
Pack Order > Ship Order
Ship Order --> Receive Package: Delivery
\`\`\``;

export const mcpTools: ReadonlyArray<McpToolDefinition<unknown>> = [
  {
    name: 'renderPrompt',
    description:
      'Generate a diagram using AI from a natural language prompt, existing code, infrastructure configuration, or other diagram languages. Best for when you want AI to create the diagram code for you.',
    schema: renderPromptSchema,
    jsonSchema: renderPromptJsonSchema,
  },
  {
    name: 'renderElements',
    description:
      'Render multiple diagram elements. Advanced use case for rendering multiple diagrams at once.',
    schema: renderElementsSchema,
    jsonSchema: renderElementsJsonSchema,
  },
  {
    name: 'renderSequenceDiagram',
    description: SEQUENCE_DIAGRAM_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramJsonSchema,
  },
  {
    name: 'renderEntityRelationshipDiagram',
    description: ERD_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramJsonSchema,
  },
  {
    name: 'renderCloudArchitectureDiagram',
    description: CLOUD_ARCHITECTURE_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramJsonSchema,
  },
  {
    name: 'renderFlowchart',
    description: FLOWCHART_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramJsonSchema,
  },
  {
    name: 'renderBpmnDiagram',
    description: BPMN_DESCRIPTION,
    schema: singleDiagramSchema,
    jsonSchema: singleDiagramJsonSchema,
  },
];

export type McpToolName = typeof mcpTools[number]['name'];

export function isMcpToolName(name: unknown): name is McpToolName {
  return mcpTools.some((tool) => tool.name === name);
}

export const mcpToolMap = new Map(mcpTools.map((tool) => [tool.name, tool]));

// Mapping from single diagram tool names to their diagram types
export const singleDiagramTools: Record<string, DiagramTypes> = {
  renderSequenceDiagram: DiagramTypes.SD,
  renderEntityRelationshipDiagram: DiagramTypes.ERD,
  renderCloudArchitectureDiagram: DiagramTypes.CAD,
  renderFlowchart: DiagramTypes.FLOW,
  renderBpmnDiagram: DiagramTypes.BPMN,
};

export function isSingleDiagramTool(name: string): name is keyof typeof singleDiagramTools {
  return name in singleDiagramTools;
}
