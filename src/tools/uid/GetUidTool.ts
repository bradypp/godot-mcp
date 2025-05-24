/**
 * Get UID Tool
 * Gets UIDs for files in Godot projects (for Godot 4.4+)
 */

import { promisify } from 'util';
import { exec } from 'child_process';

import { ToolDefinition, ToolResponse } from '../../server/types';
import {
  prepareToolArgs,
  validateBasicArgs,
  validateProjectPath,
  validateFilePath,
  createSuccessResponse,
} from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { detectGodotPath } from '../../core/PathManager';
import { executeOperation } from '../../core/GodotExecutor';
import { logDebug } from '../../utils/Logger';

const execAsync = promisify(exec);

/**
 * Check if Godot version is 4.4 or later
 */
const isGodot44OrLater = (version: string): boolean => {
  const versionMatch = version.match(/(\d+)\.(\d+)/);
  if (!versionMatch) return false;

  const major = parseInt(versionMatch[1]);
  const minor = parseInt(versionMatch[2]);

  return major > 4 || (major === 4 && minor >= 4);
};

export const getUidDefinition: ToolDefinition = {
  name: 'get_uid',
  description: 'Get the UID for a specific file in a Godot project (for Godot 4.4+)',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Godot project directory',
      },
      filePath: {
        type: 'string',
        description: 'Path to the file (relative to project) for which to get the UID',
      },
    },
    required: ['projectPath', 'filePath'],
  },
};

export const handleGetUid = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['projectPath', 'filePath']);
  if (validationError) {
    return createErrorResponse(validationError, ['Provide projectPath and filePath']);
  }

  const projectValidationError = validateProjectPath(args.projectPath);
  if (projectValidationError) {
    return projectValidationError;
  }

  const fileValidationError = validateFilePath(args.projectPath, args.filePath);
  if (fileValidationError) {
    return fileValidationError;
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
    const { stdout: versionOutput } = await execAsync(`"${godotPath}" --version`);
    const version = versionOutput.trim();

    if (!isGodot44OrLater(version)) {
      return createErrorResponse(
        `UIDs are only supported in Godot 4.4 or later. Current version: ${version}`,
        [
          'Upgrade to Godot 4.4 or later to use UIDs',
          'Use resource paths instead of UIDs for this version of Godot',
        ],
      );
    }

    logDebug(`Getting UID for file: ${args.filePath} in project: ${args.projectPath}`);

    // Prepare parameters for the operation
    const params = {
      filePath: args.filePath,
    };

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'get_uid',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to get UID: ${stderr}`, [
        'Check if the file exists and is a valid resource',
        'Ensure the file is imported in Godot',
      ]);
    }

    return createSuccessResponse(`UID for ${args.filePath}: ${stdout.trim()}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to get UID: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
