/**
 * Run Project Tool
 * Handles running Godot projects in debug mode
 */

import { spawn } from 'child_process';

import { prepareToolArgs, validateBasicArgs } from '../BaseToolHandler';
import { createErrorResponse } from '../../utils/ErrorHandler';
import { isGodotProject } from '../../utils/FileUtils';
import { detectGodotPath } from '../../core/PathManager';
import { getActiveProcess, setActiveProcess } from '../../core/ProcessManager';
import { logDebug } from '../../utils/Logger';
import { ToolResponse, ToolDefinition } from '../../server/types';

export interface RunProjectArgs {
  projectPath: string;
  scene?: string;
}

export const runProjectDefinition: ToolDefinition = {
  name: 'run_project',
  description: 'Run the Godot project and capture output',
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Path to the Godot project directory',
      },
      scene: {
        type: 'string',
        description: 'Optional: Specific scene to run',
      },
    },
    required: ['projectPath'],
  },
};

/**
 * Handle the run_project tool
 */
export const handleRunProject = async (args: any): Promise<ToolResponse> => {
  // Validate and normalize arguments
  args = prepareToolArgs(args);

  const validationError = validateBasicArgs(args, ['projectPath']);
  if (validationError) {
    return createErrorResponse(validationError, [
      'Provide a valid path to a Godot project directory',
    ]);
  }

  try {
    // Validate project
    if (!isGodotProject(args.projectPath)) {
      return createErrorResponse(`Not a valid Godot project: ${args.projectPath}`, [
        'Ensure the path points to a directory containing a project.godot file',
        'Use list_projects to find valid Godot projects',
      ]);
    }

    // Ensure Godot path is available
    const godotPath = await detectGodotPath();
    if (!godotPath) {
      return createErrorResponse('Could not find a valid Godot executable path', [
        'Ensure Godot is installed correctly',
        'Set GODOT_PATH environment variable to specify the correct path',
      ]);
    }

    // Kill any existing process
    const activeProcess = getActiveProcess();
    if (activeProcess) {
      logDebug('Killing existing Godot process before starting a new one');
      activeProcess.process.kill();
    }

    const cmdArgs = ['-d', '--path', args.projectPath];
    if (args.scene) {
      logDebug(`Adding scene parameter: ${args.scene}`);
      cmdArgs.push(args.scene);
    }

    logDebug(`Running Godot project: ${args.projectPath}`);
    const process = spawn(godotPath, cmdArgs, { stdio: 'pipe' });
    const output: string[] = [];
    const errors: string[] = [];

    process.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      output.push(...lines);
      lines.forEach((line: string) => {
        if (line.trim()) logDebug(`[Godot stdout] ${line}`);
      });
    });

    process.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n');
      errors.push(...lines);
      lines.forEach((line: string) => {
        if (line.trim()) logDebug(`[Godot stderr] ${line}`);
      });
    });

    process.on('exit', (code: number | null) => {
      logDebug(`Godot process exited with code ${code}`);
      if (getActiveProcess()?.process === process) {
        setActiveProcess(null);
      }
    });

    process.on('error', (err: Error) => {
      console.error('Failed to start Godot process:', err);
      if (getActiveProcess()?.process === process) {
        setActiveProcess(null);
      }
    });

    setActiveProcess({ process, output, errors });

    return {
      content: [
        {
          type: 'text',
          text: `Godot project started in debug mode. Use get_debug_output to see output.`,
        },
      ],
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse(`Failed to run Godot project: ${errorMessage}`, [
      'Ensure Godot is installed correctly',
      'Check if the GODOT_PATH environment variable is set correctly',
      'Verify the project path is accessible',
    ]);
  }
};
