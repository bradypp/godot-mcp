/**
 * Edit Node Tool
 * Edits properties of existing nodes in Godot scenes
 */

import { ToolDefinition, ToolResponse } from '../../server/types';
import {
  prepareToolArgs,
  validateBasicArgs,
  validateProjectPath,
  validateScenePath,
  createSuccessResponse,
} from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { detectGodotPath } from '../../core/PathManager';
import { executeOperation } from '../../core/GodotExecutor';
import { logDebug } from '../../utils/Logger';

export const editNodeDefinition: ToolDefinition = {
  name: 'edit_node',
  description: 'Edit properties of an existing node in a Godot scene',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Godot project directory',
      },
      scenePath: {
        type: 'string',
        description: 'Path to the scene file (relative to project)',
      },
      nodePath: {
        type: 'string',
        description: 'Path to the node to edit (e.g., "Player", "UI/HealthBar")',
      },
      properties: {
        type: 'object',
        description: 'Properties to set on the node',
      },
    },
    required: ['projectPath', 'scenePath', 'nodePath', 'properties'],
  },
};

export const handleEditNode = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, [
    'projectPath',
    'scenePath',
    'nodePath',
    'properties',
  ]);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide projectPath, scenePath, nodePath, and properties',
    ]);
  }

  const projectValidationError = validateProjectPath(args.projectPath);
  if (projectValidationError) {
    return projectValidationError;
  }

  const sceneValidationError = validateScenePath(args.projectPath, args.scenePath);
  if (sceneValidationError) {
    return sceneValidationError;
  }

  try {
    // Ensure Godot path is available
    const godotPath = await detectGodotPath();
    if (!godotPath) {
      return createErrorResponse('Could not find a valid Godot executable path', [
        'Ensure Godot is installed correctly',
        'Set GODOT_PATH environment variable to specify the correct path',
      ]);
    }

    logDebug(`Editing node ${args.nodePath} in scene: ${args.scenePath}`);

    // Prepare parameters for the operation
    const params: any = {
      scenePath: args.scenePath,
      nodePath: args.nodePath,
      properties: args.properties,
    };

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'edit_node',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to edit node: ${stderr}`, [
        'Check if the node path exists in the scene',
        'Ensure the property names are valid for the node type',
        'Verify the scene file is not corrupted',
      ]);
    }

    return createSuccessResponse(`Node edited successfully: ${args.nodePath}\n\nOutput: ${stdout}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to edit node: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path and scene path are accessible',
    ]);
  }
};
