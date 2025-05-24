#!/usr/bin/env node
/**
 * Godot MCP Server - Main Entry Point
 *
 * Refactored server using modular architecture with functional programming patterns.
 * This replaces the original 2200+ line monolithic implementation with a clean,
 * maintainable, and extensible structure.
 */

import { GodotMCPServer } from './server/GodotMCPServer';
import { logInfo, logError } from './utils/Logger';

/**
 * Main function to start the server
 */
const main = async (): Promise<void> => {
  try {
    const server = new GodotMCPServer();
    await server.start();

    // Handle graceful shutdown
    const handleShutdown = async (signal: string) => {
      logInfo(`Received ${signal}, shutting down gracefully...`);
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        logError(`Error during shutdown: ${error}`);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError(`Failed to start Godot MCP Server: ${errorMessage}`);
    process.exit(1);
  }
};

// Start the server
main().catch((error) => {
  logError(`Unhandled error in main: ${error}`);
  process.exit(1);
});
