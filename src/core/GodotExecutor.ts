/**
 * Godot executor utilities
 * Handles execution of Godot operations and commands
 */

import { promisify } from 'util';
import { exec } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { convertCamelToSnakeCase, OperationParams } from './ParameterNormalizer';
import { normalizePath } from './PathManager';
import { logDebug } from '../utils/Logger';
import { GODOT_DEBUG_MODE } from '../config/config';

const execAsync = promisify(exec);

const getOperationsScriptPath = (): string => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return join(__dirname, '..', 'scripts', 'godot_operations.gd');
};

/**
 * Check if the Godot version is 4.4 or later
 */
export const isGodot44OrLater = (version: string): boolean => {
  const match = version.match(/^(\d+)\.(\d+)/);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    return major > 4 || (major === 4 && minor >= 4);
  }
  return false;
};

/**
 * Get Godot version
 */
export const getGodotVersion = async (godotPath: string): Promise<string> => {
  const { stdout } = await execAsync(`"${godotPath}" --version`);
  return stdout.trim();
};

/**
 * Execute a Godot operation using the operations script
 */
export const executeOperation = async (
  operation: string,
  params: OperationParams,
  projectPath: string,
  godotPath: string,
): Promise<{ stdout: string; stderr: string }> => {
  logDebug(`Executing operation: ${operation} in project: ${projectPath}`);
  logDebug(`Original operation params: ${JSON.stringify(params)}`);

  // Normalize the project path to handle Windows path issues
  const normalizedProjectPath = normalizePath(projectPath);

  // Convert camelCase parameters to snake_case for Godot script
  const snakeCaseParams = convertCamelToSnakeCase(params);
  logDebug(`Converted snake_case params: ${JSON.stringify(snakeCaseParams)}`);

  try {
    // Serialize the snake_case parameters to a valid JSON string
    const paramsJson = JSON.stringify(snakeCaseParams);
    // Escape double quotes and backslashes for shell safety
    const escapedParams = paramsJson.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

    // Add debug arguments if debug mode is enabled
    const debugArgs = GODOT_DEBUG_MODE ? ['--debug-godot'] : [];

    // Get the operations script path
    const operationsScriptPath = getOperationsScriptPath();

    // Construct the command with the operation and JSON parameters
    const cmd = [
      `"${godotPath}"`,
      '--headless',
      '--path',
      `"${normalizedProjectPath}"`,
      '--script',
      `"${operationsScriptPath}"`,
      operation,
      `"${escapedParams}"`,
      ...debugArgs,
    ].join(' ');

    logDebug(`Command: ${cmd}`);

    const { stdout, stderr } = await execAsync(cmd);

    return { stdout, stderr };
  } catch (error: unknown) {
    // If execAsync throws, it still contains stdout/stderr
    if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
      const execError = error as Error & { stdout: string; stderr: string };
      return {
        stdout: execError.stdout,
        stderr: execError.stderr,
      };
    }

    throw error;
  }
};
