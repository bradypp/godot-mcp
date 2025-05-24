/**
 * Launch Editor Tool
 * Launches the Godot editor for a specific project
 */

import { ToolDefinition, ToolResponse } from '../../server/types';
import {
  prepareToolArgs,
  validateBasicArgs,
  validateProjectPath,
  createSuccessResponse,
} from '../BaseToolHandler';
import { detectGodotPath } from '../../core/PathManager';
import { launchGodotEditor } from '../../core/ProcessManager';
import { createErrorResponse } from '../../utils/ErrorHandler';

export const launchEditorDefinition: ToolDefinition = {
  name: 'launch_editor',
  description: 'Launch Godot editor for a specific project',
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

export const handleLaunchEditor = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['projectPath']);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide a valid path to a Godot project directory',
    ]);
  }

  const projectValidationError = validateProjectPath(args.projectPath);
  if (projectValidationError) {
    return projectValidationError;
  }

  try {
    const godotPath = await detectGodotPath();
    if (!godotPath) {
      return createErrorResponse('Could not find a valid Godot executable path', [
        'Ensure Godot is installed correctly',
        'Set GODOT_PATH environment variable to specify the correct path',
      ]);
    }

    launchGodotEditor(godotPath, args.projectPath);

    return createSuccessResponse(
      `Godot editor launched successfully for project at ${args.projectPath}.`,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to launch Godot editor: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
