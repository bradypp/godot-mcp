/**
 * Tool Registry
 * Central registry for all available tools with their definitions and handlers
 */

import { ToolDefinition, ToolResponse } from '../server/types';
import { READ_ONLY_MODE } from '../config/config';

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
import { editNodeDefinition, handleEditNode } from './scene/EditNodeTool';
import { removeNodeDefinition, handleRemoveNode } from './scene/RemoveNodeTool';
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
  readOnly: boolean;
}

/**
 * Registry of all available tools
 */
export const toolRegistry: Map<string, ToolRegistration> = new Map([
  // System tools
  [
    'get_godot_version',
    {
      definition: getGodotVersionDefinition,
      handler: handleGetGodotVersion,
      readOnly: true,
    },
  ],

  // Debug tools
  [
    'stop_project',
    {
      definition: stopProjectDefinition,
      handler: handleStopProject,
      readOnly: true,
    },
  ],
  [
    'get_debug_output',
    {
      definition: getDebugOutputDefinition,
      handler: handleGetDebugOutput,
      readOnly: true,
    },
  ],

  // Project tools
  [
    'launch_editor',
    {
      definition: launchEditorDefinition,
      handler: handleLaunchEditor,
      readOnly: true,
    },
  ],
  [
    'run_project',
    {
      definition: runProjectDefinition,
      handler: handleRunProject,
      readOnly: true,
    },
  ],
  [
    'list_projects',
    {
      definition: listProjectsDefinition,
      handler: handleListProjects,
      readOnly: true,
    },
  ],
  [
    'get_project_info',
    {
      definition: getProjectInfoDefinition,
      handler: handleGetProjectInfo,
      readOnly: true,
    },
  ],

  // Scene tools
  [
    'create_scene',
    {
      definition: createSceneDefinition,
      handler: handleCreateScene,
      readOnly: false,
    },
  ],
  [
    'add_node',
    {
      definition: addNodeDefinition,
      handler: handleAddNode,
      readOnly: false,
    },
  ],
  [
    'edit_node',
    {
      definition: editNodeDefinition,
      handler: handleEditNode,
      readOnly: false,
    },
  ],
  [
    'remove_node',
    {
      definition: removeNodeDefinition,
      handler: handleRemoveNode,
      readOnly: false,
    },
  ],
  [
    'load_sprite',
    {
      definition: loadSpriteDefinition,
      handler: handleLoadSprite,
      readOnly: false,
    },
  ],
  [
    'export_mesh_library',
    {
      definition: exportMeshLibraryDefinition,
      handler: handleExportMeshLibrary,
      readOnly: false,
    },
  ],
  [
    'save_scene',
    {
      definition: saveSceneDefinition,
      handler: handleSaveScene,
      readOnly: false,
    },
  ],

  // UID tools
  [
    'get_uid',
    {
      definition: getUidDefinition,
      handler: handleGetUid,
      readOnly: true,
    },
  ],
  [
    'update_project_uids',
    {
      definition: updateProjectUidsDefinition,
      handler: handleUpdateProjectUids,
      readOnly: false,
    },
  ],
]);

/**
 * Get all tool definitions for MCP server registration
 * Filters tools based on READ_ONLY_MODE
 */
export const getAllToolDefinitions = (): ToolDefinition[] => {
  const allTools = Array.from(toolRegistry.values());

  if (!READ_ONLY_MODE) {
    return allTools.map((tool) => tool.definition);
  }

  // In read-only mode, filter out tools that are not read-only
  const filteredTools = allTools.filter((tool) => tool.readOnly);

  console.log(`[READ_ONLY_MODE] Filtered ${allTools.length - filteredTools.length} write tools`);

  return filteredTools.map((tool) => tool.definition);
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
