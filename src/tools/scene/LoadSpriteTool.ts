/**
 * Load Sprite Tool
 * Loads sprites and textures into Sprite2D nodes in Godot scenes
 */

import { ToolDefinition, ToolResponse } from '../../server/types';
import {
  prepareToolArgs,
  validateBasicArgs,
  validateProjectPath,
  validateScenePath,
  validateFilePath,
  createSuccessResponse,
} from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { detectGodotPath } from '../../core/PathManager';
import { executeOperation } from '../../core/GodotExecutor';
import { logDebug } from '../../utils/Logger';

export const loadSpriteDefinition: ToolDefinition = {
  name: 'load_sprite',
  description: 'Load a sprite/texture into a Sprite2D node in a Godot scene',
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
        description: 'Path to the Sprite2D node in the scene',
      },
      texturePath: {
        type: 'string',
        description: 'Path to the texture file (relative to project)',
      },
    },
    required: ['projectPath', 'scenePath', 'nodePath', 'texturePath'],
  },
};

export const handleLoadSprite = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, [
    'projectPath',
    'scenePath',
    'nodePath',
    'texturePath',
  ]);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide projectPath, scenePath, nodePath, and texturePath',
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

  const textureValidationError = validateFilePath(args.projectPath, args.texturePath);
  if (textureValidationError) {
    return textureValidationError;
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

    logDebug(
      `Loading sprite ${args.texturePath} into node ${args.nodePath} in scene: ${args.scenePath}`,
    );

    // Prepare parameters for the operation
    const params = {
      scenePath: args.scenePath,
      nodePath: args.nodePath,
      texturePath: args.texturePath,
    };

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'load_sprite',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to load sprite: ${stderr}`, [
        'Check if the node path exists and is a Sprite2D node',
        'Ensure the texture file is a valid image format',
        'Verify the texture path is correct',
      ]);
    }

    return createSuccessResponse(
      `Sprite loaded successfully: ${args.texturePath} into ${args.nodePath}\n\nOutput: ${stdout}`,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to load sprite: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify all file paths are accessible',
    ]);
  }
};
