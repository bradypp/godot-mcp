/**
 * Create Scene Tool
 * Creates new scenes in Godot projects
 */

import { ToolDefinition, ToolResponse } from '../../server/types';
import {
  prepareToolArgs,
  validateBasicArgs,
  validateProjectPath,
  createSuccessResponse,
} from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { detectGodotPath } from '../../core/PathManager';
import { executeOperation } from '../../core/GodotExecutor';
import { logDebug } from '../../utils/Logger';

export const createSceneDefinition: ToolDefinition = {
  name: 'create_scene',
  description: 'Create a new scene in a Godot project',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Godot project directory',
      },
      scenePath: {
        type: 'string',
        description: 'Path for the new scene file (relative to project)',
      },
      rootNodeType: {
        type: 'string',
        description: 'Type of the root node (default: Node2D)',
      },
    },
    required: ['projectPath', 'scenePath'],
  },
};

export const handleCreateScene = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['projectPath', 'scenePath']);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide valid paths for both the project and the scene',
    ]);
  }

  const projectValidationError = validateProjectPath(args.projectPath);
  if (projectValidationError) {
    return projectValidationError;
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

    logDebug(`Creating scene: ${args.scenePath} in project: ${args.projectPath}`);

    // Prepare parameters for the operation
    const params = {
      scenePath: args.scenePath,
      rootNodeType: args.rootNodeType || 'Node2D',
    };

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'create_scene',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to create scene: ${stderr}`, [
        'Check if the root node type is valid',
        'Ensure you have write permissions to the scene path',
        'Verify the scene path is valid',
      ]);
    }

    return createSuccessResponse(
      `Scene created successfully: ${args.scenePath}\n\nOutput: ${stdout}`,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to create scene: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
