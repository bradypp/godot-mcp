/**
 * Export Mesh Library Tool
 * Exports 3D scenes as MeshLibrary resources for GridMap usage
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

export const exportMeshLibraryDefinition: ToolDefinition = {
  name: 'export_mesh_library',
  description: 'Export a 3D scene as a MeshLibrary resource for GridMap',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Godot project directory',
      },
      scenePath: {
        type: 'string',
        description: 'Path to the 3D scene file (relative to project)',
      },
      outputPath: {
        type: 'string',
        description: 'Path for the output MeshLibrary resource (relative to project)',
      },
      meshItemNames: {
        type: 'array',
        items: {
          type: 'string',
        },
        description: 'Names of specific mesh items to include (optional)',
      },
    },
    required: ['projectPath', 'scenePath', 'outputPath'],
  },
};

export const handleExportMeshLibrary = async (args: any): Promise<ToolResponse> => {
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['projectPath', 'scenePath', 'outputPath']);
  if (validationError) {
    return createErrorResponse(validationError, ['Provide projectPath, scenePath, and outputPath']);
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

    logDebug(`Exporting MeshLibrary from scene: ${args.scenePath} to ${args.outputPath}`);

    // Prepare parameters for the operation
    const params: any = {
      scenePath: args.scenePath,
      outputPath: args.outputPath,
    };

    // Add optional parameters
    if (args.meshItemNames && Array.isArray(args.meshItemNames)) {
      params.meshItemNames = args.meshItemNames;
    }

    // Execute the operation
    const { stdout, stderr } = await executeOperation(
      'export_mesh_library',
      params,
      args.projectPath,
      godotPath,
    );

    if (stderr && stderr.includes('Failed to')) {
      return createErrorResponse(`Failed to export MeshLibrary: ${stderr}`, [
        'Check if the scene contains valid 3D meshes',
        'Ensure the output path is writable',
        'Verify the scene file is not corrupted',
      ]);
    }

    return createSuccessResponse(
      `MeshLibrary exported successfully: ${args.outputPath}\n\nOutput: ${stdout}`,
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to export MeshLibrary: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
