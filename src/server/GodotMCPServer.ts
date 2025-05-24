/**
 * Godot MCP Server
 * Simplified server implementation using modular architecture
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { config } from '../config/config';
import { logInfo, logDebug, logError } from '../utils/Logger';
import { detectGodotPath } from '../core/PathManager';
import { getAllToolDefinitions, getToolHandler, isToolRegistered } from '../tools/ToolRegistry';
import { createErrorResponse } from '../utils/ErrorHandler';

export class GodotMCPServer {
  private server: Server;
  private transport: StdioServerTransport;
  constructor() {
    this.server = new Server(
      {
        name: config.SERVER_NAME,
        version: config.SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.transport = new StdioServerTransport();
    this.setupHandlers();
  }

  /**
   * Setup all server request handlers
   */
  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logDebug('Listing available tools');
      const tools = getAllToolDefinitions();
      logDebug(`Available tools: ${tools.map((t) => t.name).join(', ')}`);

      return {
        tools,
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;

      logDebug(`Handling tool request: ${toolName}`);

      if (!isToolRegistered(toolName)) {
        logError(`Unknown tool: ${toolName}`);
        return createErrorResponse(`Unknown tool: ${toolName}`, [
          'Use list_tools to see available tools',
        ]) as any;
      }

      try {
        const handler = getToolHandler(toolName);
        if (!handler) {
          logError(`No handler found for tool: ${toolName}`);
          return createErrorResponse(`No handler found for tool: ${toolName}`, [
            'This appears to be a server configuration error',
          ]) as any;
        }

        const result = await handler(args || {});
        logDebug(`Tool ${toolName} completed successfully`);
        return result as any;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logError(`Tool ${toolName} failed: ${errorMessage}`);
        return createErrorResponse(`Tool execution failed: ${errorMessage}`, [
          'Check the server logs for more details',
          'Ensure all required parameters are provided',
        ]) as any;
      }
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      logInfo('Starting Godot MCP Server...');

      // Initialize Godot path detection
      logDebug('Detecting Godot installation...');
      const godotPath = await detectGodotPath();
      if (godotPath) {
        logInfo(`Found Godot at: ${godotPath}`);
      } else {
        logInfo(
          'Godot not found in standard locations. Set GODOT_PATH environment variable if needed.',
        );
      }

      // Connect server to transport
      await this.server.connect(this.transport);

      logInfo(
        `Godot MCP Server started successfully (${config.SERVER_NAME} v${config.SERVER_VERSION})`,
      );
      logInfo(`Debug mode: ${config.DEBUG_MODE ? 'enabled' : 'disabled'}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(`Failed to start server: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    try {
      logInfo('Stopping Godot MCP Server...');
      await this.server.close();
      logInfo('Godot MCP Server stopped');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logError(`Error stopping server: ${errorMessage}`);
      throw error;
    }
  }
}
