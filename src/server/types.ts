/**
 * Shared types and interfaces for the Godot MCP Server
 */

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ToolHandler {
  (args: any): Promise<ToolResponse>;
}

export interface ToolRegistry {
  [toolName: string]: {
    definition: ToolDefinition;
    handler: ToolHandler;
  };
}
