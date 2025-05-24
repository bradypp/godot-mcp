/**
 * Tool Registry
 * Central registry for all available tools with their definitions and handlers
 */

import { ToolDefinition, ToolResponse } from '../server/types';

// System tools
import { getGodotVersionDefinition, handleGetGodotVersion } from './system/GetGodotVersionTool';

// Debug tools
import { stopProjectDefinition, handleStopProject } from './debug/StopProjectTool';
import { getDebugOutputDefinition, handleGetDebugOutput } from './debug/GetDebugOutputTool';

// Project tools
import { launchEditorDefinition, handleLaunchEditor } from './project/LaunchEditorTool';
import { runProjectDefinition, handleRunProject } from './project/RunProjectTool';
import { listProjectsDefinition, handleListProjects } from './project/ListProjectsTool';
import { getProjectInfoDefinition, handleGetProjectInfo } from './project/GetProjectInfoTool';

// Scene tools
import { createSceneDefinition, handleCreateScene } from './scene/CreateSceneTool';
import { addNodeDefinition, handleAddNode } from './scene/AddNodeTool';
import { loadSpriteDefinition, handleLoadSprite } from './scene/LoadSpriteTool';
import {
  exportMeshLibraryDefinition,
  handleExportMeshLibrary,
} from './scene/ExportMeshLibraryTool';
import { saveSceneDefinition, handleSaveScene } from './scene/SaveSceneTool';

// UID tools
import { getUidDefinition, handleGetUid } from './uid/GetUidTool';
import { updateProjectUidsDefinition, handleUpdateProjectUids } from './uid/UpdateProjectUidsTool';

export interface ToolRegistration {
  definition: ToolDefinition;
  handler: (args: any) => Promise<ToolResponse>;
}

/**
 * Registry of all available tools
 */
export const toolRegistry: Map<string, ToolRegistration> = new Map([
  // System tools
  ['get_godot_version', { definition: getGodotVersionDefinition, handler: handleGetGodotVersion }],

  // Debug tools
  ['stop_project', { definition: stopProjectDefinition, handler: handleStopProject }],
  ['get_debug_output', { definition: getDebugOutputDefinition, handler: handleGetDebugOutput }],

  // Project tools
  ['launch_editor', { definition: launchEditorDefinition, handler: handleLaunchEditor }],
  ['run_project', { definition: runProjectDefinition, handler: handleRunProject }],
  ['list_projects', { definition: listProjectsDefinition, handler: handleListProjects }],
  ['get_project_info', { definition: getProjectInfoDefinition, handler: handleGetProjectInfo }],

  // Scene tools
  ['create_scene', { definition: createSceneDefinition, handler: handleCreateScene }],
  ['add_node', { definition: addNodeDefinition, handler: handleAddNode }],
  ['load_sprite', { definition: loadSpriteDefinition, handler: handleLoadSprite }],
  [
    'export_mesh_library',
    { definition: exportMeshLibraryDefinition, handler: handleExportMeshLibrary },
  ],
  ['save_scene', { definition: saveSceneDefinition, handler: handleSaveScene }],

  // UID tools
  ['get_uid', { definition: getUidDefinition, handler: handleGetUid }],
  [
    'update_project_uids',
    { definition: updateProjectUidsDefinition, handler: handleUpdateProjectUids },
  ],
]);

/**
 * Get all tool definitions for MCP server registration
 */
export const getAllToolDefinitions = (): ToolDefinition[] => {
  return Array.from(toolRegistry.values()).map((tool) => tool.definition);
};

/**
 * Get a tool handler by name
 */
export const getToolHandler = (
  toolName: string,
): ((args: any) => Promise<ToolResponse>) | undefined => {
  const tool = toolRegistry.get(toolName);
  return tool?.handler;
};

/**
 * Check if a tool is registered
 */
export const isToolRegistered = (toolName: string): boolean => {
  return toolRegistry.has(toolName);
};

/**
 * Get all registered tool names
 */
export const getRegisteredToolNames = (): string[] => {
  return Array.from(toolRegistry.keys());
};
