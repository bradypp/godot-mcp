/**
 * Path management utilities
 * Handles path validation, normalization, and Godot executable detection
 */

import { normalize } from 'path';
import { existsSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

import { logDebug } from '../utils/Logger';

const execAsync = promisify(exec);

// Cache for validated paths
const validatedPaths = new Map<string, boolean>();

/**
 * Validate a path to prevent path traversal attacks
 */
export const validatePath = (path: string): boolean => {
  // Basic validation to prevent path traversal
  if (!path || path.includes('..')) {
    return false;
  }

  // Decode any URL encoding that might have been applied incorrectly
  try {
    path = decodeURIComponent(path);
  } catch (error) {
    // If decoding fails, continue with original path
    logDebug(`Failed to decode path: ${path}, error: ${error}`);
  }

  return true;
};

/**
 * Normalize path for cross-platform compatibility
 * Handles Windows drive letters and URL encoding issues
 */
export const normalizePath = (path: string): string => {
  if (!path) return path;

  // Decode any URL encoding that might have been applied
  try {
    path = decodeURIComponent(path);
  } catch (error) {
    logDebug(`Failed to decode path during normalization: ${path}, error: ${error}`);
  }

  // Handle Windows drive letter issues
  // Convert /c%3A/ back to C:/ or similar patterns
  if (process.platform === 'win32') {
    // Fix common URL encoding issues with Windows paths
    path = path.replace(/^\/([a-zA-Z])%3A\//, '$1:/');
    path = path.replace(/^\/([a-zA-Z]):\//, '$1:/');

    // Ensure Windows paths use backslashes for consistency with Node.js path operations
    if (path.match(/^[a-zA-Z]:/)) {
      path = path.replace(/\//g, '\\');
    }
  }

  // Use Node.js normalize to handle remaining normalization
  return normalize(path);
};

/**
 * Synchronous validation for quick checks
 * This is a quick check that only verifies file existence, not executable validity
 */
export const isValidGodotPathSync = (path: string): boolean => {
  try {
    logDebug(`Quick-validating Godot path: ${path}`);
    return path === 'godot' || existsSync(path);
  } catch (error) {
    logDebug(`Invalid Godot path: ${path}, error: ${error}`);
    return false;
  }
};

/**
 * Validate if a Godot path is valid and executable
 */
export const isValidGodotPath = async (path: string): Promise<boolean> => {
  // Check cache first
  if (validatedPaths.has(path)) {
    return validatedPaths.get(path)!;
  }

  try {
    logDebug(`Validating Godot path: ${path}`);

    // Check if the file exists (skip for 'godot' which might be in PATH)
    if (path !== 'godot' && !existsSync(path)) {
      logDebug(`Path does not exist: ${path}`);
      validatedPaths.set(path, false);
      return false;
    }

    // Try to execute Godot with --version flag
    const command = path === 'godot' ? 'godot --version' : `"${path}" --version`;
    await execAsync(command);

    logDebug(`Valid Godot path: ${path}`);
    validatedPaths.set(path, true);
    return true;
  } catch (error) {
    logDebug(`Invalid Godot path: ${path}, error: ${error}`);
    validatedPaths.set(path, false);
    return false;
  }
};

/**
 * Get platform-specific possible Godot paths
 */
export const getPlatformGodotPaths = (): string[] => {
  const possiblePaths: string[] = [
    'godot', // Check if 'godot' is in PATH first
  ];

  const osPlatform = process.platform;

  // Add platform-specific paths
  if (osPlatform === 'darwin') {
    possiblePaths.push(
      '/Applications/Godot.app/Contents/MacOS/Godot',
      '/Applications/Godot_4.app/Contents/MacOS/Godot',
      `${process.env.HOME}/Applications/Godot.app/Contents/MacOS/Godot`,
      `${process.env.HOME}/Applications/Godot_4.app/Contents/MacOS/Godot`,
    );
  } else if (osPlatform === 'win32') {
    possiblePaths.push(
      'C:\\Program Files\\Godot\\Godot.exe',
      'C:\\Program Files (x86)\\Godot\\Godot.exe',
      'C:\\Program Files\\Godot_4\\Godot.exe',
      'C:\\Program Files (x86)\\Godot_4\\Godot.exe',
      `${process.env.USERPROFILE}\\Godot\\Godot.exe`,
    );
  } else if (osPlatform === 'linux') {
    possiblePaths.push(
      '/usr/bin/godot',
      '/usr/local/bin/godot',
      '/snap/bin/godot',
      `${process.env.HOME}/.local/bin/godot`,
    );
  }

  return possiblePaths;
};

/**
 * Detect the Godot executable path based on the operating system
 */
export const detectGodotPath = async (
  customPath?: string,
  strictPathValidation = false,
): Promise<string | null> => {
  // If customPath is provided and valid, use it
  if (customPath) {
    const normalizedPath = normalizePath(customPath);
    if (await isValidGodotPath(normalizedPath)) {
      logDebug(`Using custom Godot path: ${normalizedPath}`);
      return normalizedPath;
    } else {
      logDebug(`Custom Godot path is invalid: ${normalizedPath}`);
    }
  }

  // Check environment variable next
  if (process.env.GODOT_PATH) {
    const normalizedPath = normalizePath(process.env.GODOT_PATH);
    logDebug(`Checking GODOT_PATH environment variable: ${normalizedPath}`);
    if (await isValidGodotPath(normalizedPath)) {
      logDebug(`Using Godot path from environment: ${normalizedPath}`);
      return normalizedPath;
    } else {
      logDebug(`GODOT_PATH environment variable is invalid`);
    }
  }

  // Auto-detect based on platform
  const osPlatform = process.platform;
  logDebug(`Auto-detecting Godot path for platform: ${osPlatform}`);

  const possiblePaths = getPlatformGodotPaths();

  // Try each possible path
  for (const path of possiblePaths) {
    const normalizedPath = normalizePath(path);
    if (await isValidGodotPath(normalizedPath)) {
      logDebug(`Found Godot at: ${normalizedPath}`);
      return normalizedPath;
    }
  }

  // If we get here, we couldn't find Godot
  logDebug(`Warning: Could not find Godot in common locations for ${osPlatform}`);
  console.warn(`[SERVER] Could not find Godot in common locations for ${osPlatform}`);
  console.warn(
    `[SERVER] Set GODOT_PATH=/path/to/godot environment variable or pass { godotPath: '/path/to/godot' } in the config to specify the correct path.`,
  );

  if (strictPathValidation) {
    // In strict mode, return null
    return null;
  } else {
    // Fallback to a default path in non-strict mode
    let defaultPath: string;
    if (osPlatform === 'win32') {
      defaultPath = normalizePath('C:\\Program Files\\Godot\\Godot.exe');
    } else if (osPlatform === 'darwin') {
      defaultPath = normalizePath('/Applications/Godot.app/Contents/MacOS/Godot');
    } else {
      defaultPath = normalizePath('/usr/bin/godot');
    }

    logDebug(`Using default path: ${defaultPath}, but this may not work.`);
    console.warn(`[SERVER] Using default path: ${defaultPath}, but this may not work.`);
    console.warn(
      `[SERVER] This fallback behavior will be removed in a future version. Set strictPathValidation: true to opt-in to the new behavior.`,
    );

    return defaultPath;
  }
};

/**
 * Normalize all path arguments in handler parameters
 */
export const normalizeHandlerPaths = (args: any): any => {
  if (!args || typeof args !== 'object') {
    return args;
  }

  const pathKeys = [
    'projectPath',
    'scenePath',
    'nodePath',
    'texturePath',
    'outputPath',
    'newPath',
    'filePath',
    'directory',
  ];

  const normalizedArgs = { ...args };

  for (const key of pathKeys) {
    if (normalizedArgs[key] && typeof normalizedArgs[key] === 'string') {
      normalizedArgs[key] = normalizePath(normalizedArgs[key]);
    }
  }

  return normalizedArgs;
};
