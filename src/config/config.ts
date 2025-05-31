/**
 * Configuration management for Godot MCP Server
 * Handles environment variables and configuration validation
 */

export interface GodotServerConfig {
  godotPath?: string;
  debugMode?: boolean;
  godotDebugMode?: boolean;
  strictPathValidation?: boolean;
}

export interface ParameterMappings {
  [snakeCase: string]: string;
}

// Global configuration constants
export const DEBUG_MODE = process.env.DEBUG === 'true';
export const GODOT_DEBUG_MODE = true; // Always use GODOT DEBUG MODE

// Parameter name mappings between snake_case and camelCase
export const PARAMETER_MAPPINGS: ParameterMappings = {
  project_path: 'projectPath',
  scene_path: 'scenePath',
  root_node_type: 'rootNodeType',
  parent_node_path: 'parentNodePath',
  node_type: 'nodeType',
  node_name: 'nodeName',
  texture_path: 'texturePath',
  node_path: 'nodePath',
  output_path: 'outputPath',
  mesh_item_names: 'meshItemNames',
  new_path: 'newPath',
  file_path: 'filePath',
  directory: 'directory',
  recursive: 'recursive',
  scene: 'scene',
};

// Reverse mapping from camelCase to snake_case
export const REVERSE_PARAMETER_MAPPINGS: ParameterMappings = (() => {
  const reverse: ParameterMappings = {};
  Object.entries(PARAMETER_MAPPINGS).forEach(([snakeCase, camelCase]) => {
    reverse[camelCase] = snakeCase;
  });
  return reverse;
})();

/**
 * Get the default configuration
 */
export const getDefaultConfig = (): GodotServerConfig => ({
  godotPath: process.env.GODOT_PATH,
  debugMode: DEBUG_MODE,
  godotDebugMode: GODOT_DEBUG_MODE,
  strictPathValidation: false,
});

/**
 * Merge user config with defaults
 */
export const mergeConfig = (userConfig?: Partial<GodotServerConfig>): GodotServerConfig => ({
  ...getDefaultConfig(),
  ...userConfig,
});

// Default configuration instance
export const config = {
  SERVER_NAME: 'godot-mcp-server',
  SERVER_VERSION: '0.1.0',
  DEBUG_MODE,
  GODOT_DEBUG_MODE,
  ...getDefaultConfig(),
};
