/**
 * Get Project Info Tool
 * Retrieves metadata about a Godot project
 */

import { ToolDefinition, ToolResponse } from '../../server/types';
import { prepareToolArgs, validateBasicArgs, validateProjectPath } from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { getProjectStructure } from '../../utils/FileUtils';
import { detectGodotPath } from '../../core/PathManager';
import { logDebug } from '../../utils/Logger';
import { promisify } from 'util';
import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { join, basename } from 'path';

const execAsync = promisify(exec);

export const getProjectInfoDefinition: ToolDefinition = {
  name: 'get_project_info',
  description: 'Retrieve metadata about a Godot project',
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

export const handleGetProjectInfo = async (args: any): Promise<ToolResponse> => {
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
    // Ensure Godot path is available
    const godotPath = await detectGodotPath();
    if (!godotPath) {
      return createErrorResponse('Could not find a valid Godot executable path', [
        'Ensure Godot is installed correctly',
        'Set GODOT_PATH environment variable to specify the correct path',
      ]);
    }

    logDebug(`Getting project info for: ${args.projectPath}`);

    // Get Godot version
    const execOptions = { timeout: 10000 }; // 10 second timeout
    const { stdout } = await execAsync(`"${godotPath}" --version`, execOptions);

    // Get project structure using the utility
    const projectStructure = getProjectStructure(args.projectPath);

    // Extract project name from project.godot file
    let projectName = basename(args.projectPath);
    try {
      const projectFile = join(args.projectPath, 'project.godot');
      const projectFileContent = readFileSync(projectFile, 'utf8');
      const configNameMatch = projectFileContent.match(/config\/name="([^"]+)"/);
      if (configNameMatch && configNameMatch[1]) {
        projectName = configNameMatch[1];
        logDebug(`Found project name in config: ${projectName}`);
      }
    } catch (error) {
      logDebug(`Error reading project file: ${error}`);
      // Continue with default project name if extraction fails
    }

    const projectInfo = {
      name: projectName,
      path: args.projectPath,
      godotVersion: stdout.trim(),
      structure: projectStructure,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projectInfo, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to get project info: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
