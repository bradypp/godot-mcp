/**
 * Save Scene Tool
 * Saves scenes with options for creating variants
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

export const saveSceneDefinition: ToolDefinition = {
  name: 'save_scene',
  description: 'Save a scene, optionally as a new variant',
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
      newPath: {
        type: 'string',
        description: 'Optional: New path to save as variant (relative to project)',
      },
    },
    required: ['projectPath', 'scenePath'],
  },
};

export const handleSaveScene = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['projectPath', 'scenePath']);
  if (validationError) {
    return createErrorResponse(validationError, ['Provide projectPath and scenePath']);
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

    const isVariant = Boolean(args.newPath);
    logDebug(`Saving scene: ${args.scenePath}${isVariant ? ` as variant: ${args.newPath}` : ''}`);

    // Prepare parameters for the operation
    const params: any = {
      scenePath: args.scenePath,
    };

    if (args.newPath) {
      params.newPath = args.newPath;
    }

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'save_scene',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to save scene: ${stderr}`, [
        'Check if you have write permissions',
        'Ensure the scene file is not corrupted',
        'Verify the output path is valid',
      ]);
    }

    const savedPath = args.newPath || args.scenePath;
    return createSuccessResponse(`Scene saved successfully: ${savedPath}\n\nOutput: ${stdout}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to save scene: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
