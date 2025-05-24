/**
 * Get Debug Output Tool
 * Retrieves debug output from the currently running Godot process
 */

import { ToolDefinition, ToolResponse } from '../../server/types';
import { createJsonResponse } from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { getActiveProcess } from '../../core/ProcessManager';

export const getDebugOutputDefinition: ToolDefinition = {
  name: 'get_debug_output',
  description: 'Get the current debug output and errors',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

export const handleGetDebugOutput = async (): Promise<ToolResponse> => {
  const activeProcess = getActiveProcess();
  if (!activeProcess) {
    return createErrorResponse('No active Godot process.', [
      'Use run_project to start a Godot project first',
      'Check if the Godot process crashed unexpectedly',
    ]);
  }

  return createJsonResponse({
    output: activeProcess.output,
    errors: activeProcess.errors,
  });
};
