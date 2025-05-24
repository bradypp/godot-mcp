/**
 * List Projects Tool
 * Lists Godot projects in a directory
 */

import { existsSync } from 'fs';

import { ToolDefinition, ToolResponse } from '../../server/types';
import { prepareToolArgs, validateBasicArgs } from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { findGodotProjects } from '../../utils/FileUtils';
import { logDebug } from '../../utils/Logger';

export const listProjectsDefinition: ToolDefinition = {
  name: 'list_projects',
  description: 'List Godot projects in a directory',
  inputSchema: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description: 'Directory to search for Godot projects',
      },
      recursive: {
        type: 'boolean',
        description: 'Whether to search recursively (default: false)',
      },
    },
    required: ['directory'],
  },
};

export const handleListProjects = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['directory']);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide a valid directory path to search for Godot projects',
    ]);
  }

  try {
    logDebug(`Listing Godot projects in directory: ${args.directory}`);

    if (!existsSync(args.directory)) {
      return createErrorResponse(`Directory does not exist: ${args.directory}`, [
        'Provide a valid directory path that exists on the system',
      ]);
    }

    const recursive = args.recursive === true;
    const projects = findGodotProjects(args.directory, recursive);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to list projects: ${errorMessage}`, [
      'Ensure the directory exists and is accessible',
      'Check if you have permission to read the directory',
    ]);
  }
};
