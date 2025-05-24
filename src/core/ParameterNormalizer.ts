/**
 * Parameter normalization utilities
 * Handles conversion between snake_case and camelCase parameters
 */

import { PARAMETER_MAPPINGS, REVERSE_PARAMETER_MAPPINGS } from '../config/config';

export interface OperationParams {
  [key: string]: any;
}

/**
 * Normalize parameters to camelCase format
 * @param params Object with either snake_case or camelCase keys
 * @returns Object with all keys in camelCase format
 */
export const normalizeParameters = (params: OperationParams): OperationParams => {
  if (!params || typeof params !== 'object') {
    return params;
  }

  const result: OperationParams = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      let normalizedKey = key;

      // If the key is in snake_case, convert it to camelCase using our mapping
      if (key.includes('_') && PARAMETER_MAPPINGS[key]) {
        normalizedKey = PARAMETER_MAPPINGS[key];
      }

      // Handle nested objects recursively
      if (typeof params[key] === 'object' && params[key] !== null && !Array.isArray(params[key])) {
        result[normalizedKey] = normalizeParameters(params[key] as OperationParams);
      } else {
        result[normalizedKey] = params[key];
      }
    }
  }

  return result;
};

/**
 * Convert camelCase keys to snake_case
 * @param params Object with camelCase keys
 * @returns Object with snake_case keys
 */
export const convertCamelToSnakeCase = (params: OperationParams): OperationParams => {
  const result: OperationParams = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      // Convert camelCase to snake_case
      const snakeKey =
        REVERSE_PARAMETER_MAPPINGS[key] ||
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

      // Handle nested objects recursively
      if (typeof params[key] === 'object' && params[key] !== null && !Array.isArray(params[key])) {
        result[snakeKey] = convertCamelToSnakeCase(params[key] as OperationParams);
      } else {
        result[snakeKey] = params[key];
      }
    }
  }

  return result;
};
