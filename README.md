# Godot MCP

[![](https://badge.mcpx.dev?type=server 'MCP Server')](https://modelcontextprotocol.io/introduction)
[![Made with Godot](https://img.shields.io/badge/Made%20with-Godot-478CBF?style=flat&logo=godot%20engine&logoColor=white)](https://godotengine.org)
[![](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white 'Node.js')](https://nodejs.org/en/download/)
[![](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white 'TypeScript')](https://www.typescriptlang.org/)

[![](https://img.shields.io/github/last-commit/bradypp/godot-mcp 'Last Commit')](https://github.com/bradypp/godot-mcp/commits/main)
[![](https://img.shields.io/github/stars/bradypp/godot-mcp 'Stars')](https://github.com/bradypp/godot-mcp/stargazers)
[![](https://img.shields.io/github/forks/bradypp/godot-mcp 'Forks')](https://github.com/bradypp/godot-mcp/network/members)
[![](https://img.shields.io/badge/License-MIT-red.svg 'MIT License')](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server for interacting with the Godot game engine.

## Introduction

Godot MCP enables AI assistants to launch the Godot editor, run projects, capture debug output, and control project execution - all through a standardized interface.

This direct feedback loop helps AI assistants like Claude or Cursor understand what works and what doesn't in real Godot projects, leading to better code generation and debugging assistance.

## Features

- **Launch Godot Editor**: Open the Godot editor for a specific project
- **Run Godot Projects**: Execute Godot projects in debug mode
- **Capture Debug Output**: Retrieve console output and error messages
- **Control Execution**: Start and stop Godot projects programmatically
- **Get Godot Version**: Retrieve the installed Godot version
- **List Godot Projects**: Find Godot projects in a specified directory
- **Project Analysis**: Get detailed information about project structure
- **Scene Management**:
  - Create new scenes with specified root node types
  - Add nodes to existing scenes with customizable properties
  - Edit properties of existing nodes in scenes
  - Remove nodes from existing scenes
  - Load sprites and textures into Sprite2D nodes
  - Export 3D scenes as MeshLibrary resources for GridMap
  - Save scenes with options for creating variants
- **UID Management** (for Godot 4.4+):
  - Get UID for specific files
  - Update UID references by resaving resources

## Requirements

- [Godot Engine](https://godotengine.org/download) installed on your system
- Node.js and npm
- An AI assistant that supports MCP (Cline, Cursor, etc.)

## Installation and Configuration

### Step 1: Install and Build

First, clone the repository and build the MCP server:

```bash
git clone https://github.com/bradypp/godot-mcp.git
cd godot-mcp
npm install
npm run build
```

### Step 2: Configure with Your AI Assistant

#### Option A: Configure with Cline

Add to your Cline MCP settings file (`~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/absolute/path/to/godot-mcp/build/index.js"],
      "env": {
        "DEBUG": "true", // Optional: Enable detailed logging
        "GODOT_PATH": "/path/to/godot" // Required if non-default installation path
      },
      "disabled": false,
      "autoApprove": [
        "launch_editor",
        "run_project",
        "get_debug_output",
        "stop_project",
        "get_godot_version",
        "list_projects",
        "get_project_info",
        "create_scene",
        "add_node",
        "edit_node",
        "remove_node",
        "load_sprite",
        "export_mesh_library",
        "save_scene",
        "get_uid",
        "update_project_uids"
      ]
    }
  }
}
```

#### Option B: Configure with Cursor

**Using the Cursor UI:**

1. Go to **Cursor Settings** > **Features** > **MCP**
2. Click on the **+ Add New MCP Server** button
3. Fill out the form:
   - Name: `godot` (or any name you prefer)
   - Type: `command`
   - Command: `node /absolute/path/to/godot-mcp/build/index.js`
4. Click "Add"
5. You may need to press the refresh button in the top right corner of the MCP server card to populate the tool list

**Using Project-Specific Configuration:**

Create a file at `.cursor/mcp.json` in your project directory with the following content:

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/absolute/path/to/godot-mcp/build/index.js"],
      "env": {
        "DEBUG": "true", // Enable detailed logging
        "GODOT_PATH": "path/to/godot" // Required if non-default installation path
      }
    }
  }
}
```

### Step 3: Optional Environment Variables

You can customize the server behavior with these environment variables:

- `GODOT_PATH`: Path to the Godot executable (overrides automatic detection)
- `DEBUG`: Set to "true" to enable detailed server-side debug logging
- `READ_ONLY_MODE`: Set to "true" to enable read-only mode (see below for details)

## Read-Only Mode

The Godot MCP server supports a read-only mode that restricts certain operations for use in secure or controlled environments. When enabled, the server only allows read-only operations for debug, system, and project tools while maintaining full functionality for scene and UID tools.

### Enabling Read-Only Mode

Set the `READ_ONLY_MODE` environment variable to `"true"`:

**Environment Variable:**

**In MCP Configuration:**

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/absolute/path/to/godot-mcp/build/index.js"],
      "env": {
        "READ_ONLY_MODE": "true",
        "DEBUG": "true",
        "GODOT_PATH": "/path/to/godot"
      }
    }
  }
}
```

### Available Tools in Read-Only Mode

When `READ_ONLY_MODE` is enabled, the following restrictions apply:

#### ✅ **Available Read-Only Tools:**

- **System Tools:**
  - [`get_godot_version`](src/tools/system/GetGodotVersionTool.ts:1) - Get the installed Godot version
- **Debug Tools:**
  - [`get_debug_output`](src/tools/debug/GetDebugOutputTool.ts:1) - Get current debug output and errors
- **Project Tools:**
  - [`list_projects`](src/tools/project/ListProjectsTool.ts:1) - List Godot projects in a directory
  - [`get_project_info`](src/tools/project/GetProjectInfoTool.ts:1) - Retrieve project metadata
- **UID Tools:**
  - [`get_uid`](src/tools/uid/GetUidTool.ts:1) - Get UID for specific files (Godot 4.4+)

#### ❌ **Restricted Tools:**

- **System Tools:** _(none - all system tools are read-only)_
- **Debug Tools:**
  - `stop_project` - Stop running Godot projects
- **Project Tools:**
  - `launch_editor` - Launch Godot editor
  - `run_project` - Run Godot projects
- **UID Tools:**
  - `update_project_uids` - Update UID references

#### 🔄 **Unrestricted Categories:**

**Scene Tools** and **UID Tools** (except `update_project_uids`) remain **fully available** regardless of read-only mode:

- `create_scene`, `add_node`, `edit_node`, `remove_node`
- `load_sprite`, `export_mesh_library`, `save_scene`

### Use Cases for Read-Only Mode

- **CI/CD Pipelines**: Analyze projects without modifying them
- **Code Review**: Inspect project structure and debug output safely
- **Educational Environments**: Allow students to explore without making changes
- **Shared Development**: Multiple users can safely analyze the same project
- **Documentation Generation**: Extract project information for documentation

### Example Usage

```bash
# Run server in read-only mode
READ_ONLY_MODE=true node /path/to/godot-mcp/build/index.js

# Or export the variable
export READ_ONLY_MODE=true
node /path/to/godot-mcp/build/index.js
```

With read-only mode enabled, you can still use prompts like:

```text
"Get information about my Godot project structure"
"Show me any debug output from my project"
"List all Godot projects in this directory"
"Get the UID for this script file"
"Create a new scene with a Player node" (still works - scene tools unaffected)
```

## Example Prompts

Once configured, your AI assistant will automatically run the MCP server when needed. You can use prompts like:

```text
"Launch the Godot editor for my project at /path/to/project"

"Run my Godot project and show me any errors"

"Get information about my Godot project structure"

"Analyze my Godot project structure and suggest improvements"

"Help me debug this error in my Godot project: [paste error]"

"Write a GDScript for a character controller with double jump and wall sliding"

"Create a new scene with a Player node in my Godot project"

"Add a Sprite2D node to my player scene and load the character texture"

"Edit the position and scale properties of the Player node in my scene"

"Remove the old enemy node from my level scene"

"Export my 3D models as a MeshLibrary for use with GridMap"

"Create a UI scene with buttons and labels for my game's main menu"

"Get the UID for a specific script file in my Godot 4.4 project"

"Update UID references in my Godot project after upgrading to 4.4"
```

## Implementation Details

### Architecture

The Godot MCP server uses a bundled GDScript approach for complex operations:

1. **Direct Commands**: Simple operations like launching the editor or getting project info use Godot's built-in CLI commands directly.
2. **Bundled Operations Script**: Complex operations like creating scenes or adding nodes use a single, comprehensive GDScript file (`godot_operations.gd`) that handles all operations.

This architecture provides several benefits:

- **No Temporary Files**: Eliminates the need for temporary script files, keeping your system clean
- **Simplified Codebase**: Centralizes all Godot operations in one (somewhat) organized file
- **Better Maintainability**: Makes it easier to add new operations or modify existing ones
- **Improved Error Handling**: Provides consistent error reporting across all operations
- **Reduced Overhead**: Minimizes file I/O operations for better performance

The bundled script accepts operation type and parameters as JSON, allowing for flexible and dynamic operation execution without generating temporary files for each operation.

## Troubleshooting

- **Godot Not Found**: Set the GODOT_PATH environment variable to your Godot executable
- **Connection Issues**: Ensure the server is running and restart your AI assistant
- **Invalid Project Path**: Ensure the path points to a directory containing a project.godot file
- **Build Issues**: Make sure all dependencies are installed by running `npm install`
- **For Cursor Specifically**:
- Ensure the MCP server shows up and is enabled in Cursor settings (Settings > MCP)
- MCP tools can only be run using the Agent chat profile (Cursor Pro or Business subscription)
- Use "Yolo Mode" to automatically run MCP tool requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

This repo was originally forked from https://github.com/Coding-Solo/godot-mcp
