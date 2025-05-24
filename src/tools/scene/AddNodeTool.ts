/**
 * Add Node Tool
 * Adds nodes to existing scenes in Godot projects
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

export const addNodeDefinition: ToolDefinition = {
  name: 'add_node',
  description: 'Add a node to an existing scene in a Godot project',
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
      nodeType: {
        type: 'string',
        description: 'Type of the node to add (e.g., Node2D, Sprite2D, RigidBody2D)',
      },
      nodeName: {
        type: 'string',
        description: 'Name for the new node',
      },
      parentNodePath: {
        type: 'string',
        description: 'Path to the parent node (optional, defaults to root)',
      },
      properties: {
        type: 'object',
        description: 'Additional properties to set on the node (optional)',
      },
    },
    required: ['projectPath', 'scenePath', 'nodeType', 'nodeName'],
  },
};

export const handleAddNode = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, [
    'projectPath',
    'scenePath',
    'nodeType',
    'nodeName',
  ]);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide projectPath, scenePath, nodeType, and nodeName',
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

    logDebug(`Adding node ${args.nodeName} (${args.nodeType}) to scene: ${args.scenePath}`);

    // Prepare parameters for the operation
    const params: any = {
      scenePath: args.scenePath,
      nodeType: args.nodeType,
      nodeName: args.nodeName,
    };

    // Add optional parameters
    if (args.parentNodePath) {
      params.parentNodePath = args.parentNodePath;
    }

    if (args.properties) {
      params.properties = args.properties;
    }

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'add_node',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to add node: ${stderr}`, [
        'Check if the node type is valid',
        'Ensure the parent node path exists',
        'Verify the scene file is not corrupted',
      ]);
    }

    return createSuccessResponse(
      `Node added successfully: ${args.nodeName} (${args.nodeType})\n\nOutput: ${stdout}`,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to add node: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path and scene path are accessible',
    ]);
  }
};
