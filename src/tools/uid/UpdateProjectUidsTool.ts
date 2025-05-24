/**
 * Update Project UIDs Tool
 * Updates UID references in a Godot project by resaving resources (for Godot 4.4+)
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
import { executeOperation, getGodotVersion, isGodot44OrLater } from '../../core/GodotExecutor';
import { logDebug } from '../../utils/Logger';

export interface UpdateProjectUidsArgs {
  projectPath: string;
}

export const updateProjectUidsDefinition: ToolDefinition = {
  name: 'update_project_uids',
  description: 'Update UID references in a Godot project by resaving resources (for Godot 4.4+)',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Godot project directory',
      },
    },
    required: ['projectPath'],
  },
};

/**
 * Handle the update_project_uids tool
 */
export const handleUpdateProjectUids = async (args: any): Promise<ToolResponse> => {
  // Validate and normalize arguments
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['projectPath']);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide a valid path to a Godot project directory',
    ]);
  }

  // Validate project path
  const projectValidation = validateProjectPath(args.projectPath);
  if (projectValidation) {
    return projectValidation;
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

    // Get Godot version to check if UIDs are supported
    const version = await getGodotVersion(godotPath);
    if (!isGodot44OrLater(version)) {
      return createErrorResponse(
        `UIDs are only supported in Godot 4.4 or later. Current version: ${version}`,
        [
          'Upgrade to Godot 4.4 or later to use UIDs',
          'Use resource paths instead of UIDs for this version of Godot',
        ],
      );
    }

    logDebug(`Updating project UIDs for: ${args.projectPath}`);

    // Prepare parameters for the operation
    const params = {
      projectPath: args.projectPath,
    };

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'resave_resources',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to update project UIDs: ${stderr}`, [
        'Check if the project is valid',
        'Ensure you have write permissions to the project directory',
      ]);
    }

    return createSuccessResponse(`Project UIDs updated successfully.\n\nOutput: ${stdout}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to update project UIDs: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
