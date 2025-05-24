/**
 * Process management utilities
 * Handles active Godot processes and their lifecycle
 */

import { spawn } from 'child_process';

import { logDebug } from '../utils/Logger';

export interface GodotProcess {
  process: any;
  output: string[];
  errors: string[];
}

// Global state for active process
let activeProcess: GodotProcess | null = null;

/**
 * Get the currently active Godot process
 */
export const getActiveProcess = (): GodotProcess | null => activeProcess;

/**
 * Set the active Godot process
 */
export const setActiveProcess = (process: GodotProcess | null): void => {
  activeProcess = process;
};

/**
 * Check if there's an active Godot process
 */
export const hasActiveProcess = (): boolean => activeProcess !== null;

/**
 * Stop the currently active Godot process
 */
export const stopActiveProcess = (): { output: string[]; errors: string[] } | null => {
  if (!activeProcess) {
    return null;
  }

  logDebug('Stopping active Godot process');
  activeProcess.process.kill();

  const result = {
    output: activeProcess.output,
    errors: activeProcess.errors,
  };

  activeProcess = null;
  return result;
};

/**
 * Launch Godot editor for a specific project
 */
export const launchGodotEditor = (godotPath: string, projectPath: string): void => {
  logDebug(`Launching Godot editor for project: ${projectPath}`);

  const process = spawn(godotPath, ['-e', '--path', projectPath], {
    stdio: 'pipe',
  });

  process.on('error', (err: Error) => {
    console.error('Failed to start Godot editor:', err);
  });
};

/**
 * Run a Godot project in debug mode
 */
export const runGodotProject = (
  godotPath: string,
  projectPath: string,
  scene?: string,
): GodotProcess => {
  // Kill any existing process
  if (activeProcess) {
    logDebug('Killing existing Godot process before starting a new one');
    activeProcess.process.kill();
  }

  const cmdArgs = ['-d', '--path', projectPath];
  if (scene) {
    logDebug(`Adding scene parameter: ${scene}`);
    cmdArgs.push(scene);
  }

  logDebug(`Running Godot project: ${projectPath}`);
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
    if (activeProcess && activeProcess.process === process) {
      activeProcess = null;
    }
  });

  process.on('error', (err: Error) => {
    console.error('Failed to start Godot process:', err);
    if (activeProcess && activeProcess.process === process) {
      activeProcess = null;
    }
  });

  const godotProcess: GodotProcess = { process, output, errors };
  activeProcess = godotProcess;

  return godotProcess;
};

/**
 * Cleanup all processes when shutting down
 */
export const cleanup = (): void => {
  logDebug('Cleaning up processes');
  if (activeProcess) {
    logDebug('Killing active Godot process');
    activeProcess.process.kill();
    activeProcess = null;
  }
};
