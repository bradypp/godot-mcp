/**
 * Base tool handler functionality
 * Provides common utilities for all tool handlers
 */

import { validatePath, normalizeHandlerPaths } from '../core/PathManager';
import { normalizeParameters } from '../core/ParameterNormalizer';
import { createErrorResponse } from '../utils/ErrorHandler';
import { isGodotProject } from '../utils/FileUtils';
import { ToolResponse } from '../server/types';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Validate basic tool arguments
 */
export const validateBasicArgs = (args: any, requiredFields: string[]): string | null => {
  for (const field of requiredFields) {
    if (!args[field]) {
      return `${field} is required`;
    }
  }
  return null;
};

/**
 * Validate and normalize tool arguments
 */
export const prepareToolArgs = (args: any): any => {
  // Normalize parameters to camelCase
  args = normalizeParameters(args);
  // Normalize all path arguments
  args = normalizeHandlerPaths(args);
  return args;
};

/**
 * Validate project path and check if it's a valid Godot project
 */
export const validateProjectPath = (projectPath: string): ToolResponse | null => {
  if (!validatePath(projectPath)) {
    return createErrorResponse('Invalid project path', [
      'Provide a valid path without ".." or other potentially unsafe characters',
    ]);
  }

  // Check if the project directory exists and contains a project.godot file
  if (!isGodotProject(projectPath)) {
    return createErrorResponse(`Not a valid Godot project: ${projectPath}`, [
      'Ensure the path points to a directory containing a project.godot file',
      'Use list_projects to find valid Godot projects',
    ]);
  }

  return null;
};

/**
 * Validate scene path exists in project
 */
export const validateScenePath = (projectPath: string, scenePath: string): ToolResponse | null => {
  if (!validatePath(scenePath)) {
    return createErrorResponse('Invalid scene path', [
      'Provide a valid path without ".." or other potentially unsafe characters',
    ]);
  }

  // Check if the scene file exists
  const fullScenePath = join(projectPath, scenePath);
  if (!existsSync(fullScenePath)) {
    return createErrorResponse(`Scene file does not exist: ${scenePath}`, [
      'Ensure the scene path is correct',
      'Use create_scene to create a new scene first',
    ]);
  }

  return null;
};

/**
 * Validate file path exists in project
 */
export const validateFilePath = (projectPath: string, filePath: string): ToolResponse | null => {
  if (!validatePath(filePath)) {
    return createErrorResponse('Invalid file path', [
      'Provide a valid path without ".." or other potentially unsafe characters',
    ]);
  }

  // Check if the file exists
  const fullFilePath = join(projectPath, filePath);
  if (!existsSync(fullFilePath)) {
    return createErrorResponse(`File does not exist: ${filePath}`, [
      'Ensure the file path is correct',
    ]);
  }

  return null;
};

/**
 * Create a success response with text content
 */
export const createSuccessResponse = (text: string): ToolResponse => ({
  content: [
    {
      type: 'text',
      text: text,
    },
  ],
});

/**
 * Create a JSON response
 */
export const createJsonResponse = (data: any): ToolResponse => ({
  content: [
    {
      type: 'text',
      text: JSON.stringify(data, null, 2),
    },
  ],
});
