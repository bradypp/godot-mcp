/**
 * Logging utilities
 * Provides debug and general logging functionality
 */

import { DEBUG_MODE } from '../config/config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Log debug messages if debug mode is enabled
 */
export const logDebug = (message: string): void => {
  if (DEBUG_MODE) {
    console.debug(`[DEBUG] ${message}`);
  }
};

/**
 * Log info messages
 */
export const logInfo = (message: string): void => {
  console.log(`[INFO] ${message}`);
};

/**
 * Log warning messages
 */
export const logWarn = (message: string): void => {
  console.warn(`[WARN] ${message}`);
};

/**
 * Log error messages
 */
export const logError = (message: string): void => {
  console.error(`[ERROR] ${message}`);
};

/**
 * Generic logger function
 */
export const log = (level: LogLevel, message: string): void => {
  switch (level) {
    case 'debug':
      logDebug(message);
      break;
    case 'info':
      logInfo(message);
      break;
    case 'warn':
      logWarn(message);
      break;
    case 'error':
      logError(message);
      break;
  }
};
