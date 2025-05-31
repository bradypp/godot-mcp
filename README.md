# Godot MCP

[![](https://badge.mcpx.dev?type=server 'MCP Server')](https://modelcontextprotocol.io/introduction)
[![Made with Godot](https://img.shields.io/badge/Made%20with-Godot-478CBF?style=flat&logo=godot%20engine&logoColor=white)](https://godotengine.org)
[![](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white 'Node.js')](https://nodejs.org/en/download/)
[![](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white 'TypeScript')](https://www.typescriptlang.org/)

[![](https://img.shields.io/github/last-commit/bradypp/godot-mcp 'Last Commit')](https://github.com/bradypp/godot-mcp/commits/main)
[![](https://img.shields.io/github/stars/bradypp/godot-mcp 'Stars')](https://github.com/bradypp/godot-mcp/stargazers)
[![](https://img.shields.io/github/forks/bradypp/godot-mcp 'Forks')](https://github.com/bradypp/godot-mcp/network/members)
[![](https://img.shields.io/badge/License-MIT-red.svg 'MIT License')](https://opensource.org/licenses/MIT)

**A comprehensive Model Context Protocol (MCP) server for seamless AI assistant integration with the Godot game engine.**

## Table of Contents

- [What is Godot MCP?](#what-is-godot-mcp)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Project Architecture](#project-architecture)
- [Usage Examples](#usage-examples)
- [Read-Only Mode](#read-only-mode)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## What is Godot MCP?

Godot MCP bridges the gap between AI assistants and the Godot game engine by providing a standardized Model Context Protocol interface. This powerful integration enables AI assistants like Claude, Cursor, and Cline to directly interact with Godot projects through a comprehensive set of tools.

### Key Value Propositions

- **Direct Godot Integration**: Launch editors, run projects, and capture debug output programmatically
- **Scene Management**: Create, modify, and manage Godot scenes through AI commands
- **Real-time Feedback**: AI assistants can see actual Godot output and errors for better assistance
- **Cross-platform Compatibility**: Works seamlessly on Windows, macOS, and Linux
- **Secure Operations**: Optional read-only mode for safe project analysis
- **Zero Configuration**: Automatic Godot detection with manual override options

### How It Works

The server acts as a middleware layer between your AI assistant and Godot, translating natural language commands into specific Godot operations. When you ask your AI to "create a player scene with a sprite," the MCP server:

1. Validates the request and project structure
2. Executes the appropriate Godot operations
3. Returns detailed success/error feedback
4. Enables the AI to understand and respond to the results

This creates a powerful feedback loop where AI assistants can learn from actual Godot behavior, leading to more accurate code generation and debugging assistance.

## Features

### Core Project Management

- **🚀 Launch Godot Editor**: Open the Godot editor for specific projects
- **▶️ Run Godot Projects**: Execute projects in debug mode with real-time output capture
- **🛑 Control Execution**: Start and stop Godot projects programmatically
- **📊 Debug Output Capture**: Retrieve comprehensive console output and error messages
- **ℹ️ System Information**: Get installed Godot version and project metadata
- **📁 Project Discovery**: Find and list Godot projects in specified directories

### Advanced Scene Management

- **🎬 Create New Scenes**: Generate scenes with specified root node types
- **➕ Add Nodes**: Insert nodes into existing scenes with customizable properties
- **✏️ Edit Node Properties**: Modify positions, scales, textures, and other node attributes
- **🗑️ Remove Nodes**: Clean up scenes by removing unwanted nodes
- **🖼️ Load Sprites**: Automatically load textures into Sprite2D nodes
- **🧱 Export MeshLibrary**: Convert 3D scenes to MeshLibrary resources for GridMap
- **💾 Save Scene Variants**: Create scene copies and manage scene versions

### Godot 4.4+ UID Management

- **🔗 Get File UIDs**: Retrieve unique identifiers for project resources
- **🔄 Update UID References**: Maintain proper resource links during project upgrades

### Security & Safety

- **🔒 Read-Only Mode**: Restrict operations to analysis-only for secure environments
- **✅ Path Validation**: Comprehensive project and file path verification
- **🛡️ Error Handling**: Robust error reporting with actionable suggestions

## Requirements

### System Requirements

- **Godot Engine**: Version 3.5+ or 4.0+ (latest stable recommended)
- **Node.js & npm**

### AI Assistant Compatibility

- **Cline & Roo Code**: Full support with auto-approval configuration
- **Cursor & VS Code**: Supports both UI and project-specific configuration
- **Claude Desktop**: Compatible with MCP server integration
- **Other MCP-enabled tools**: Any tool supporting the Model Context Protocol

## Installation

### Clone and Build

```bash
# Clone the repository
git clone https://github.com/bradypp/godot-mcp.git
cd godot-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Option A: Cline Configuration

Add to your Cline MCP settings file:

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/absolute/path/to/godot-mcp/build/index.js"],
      "env": {
        "DEBUG": "false",
        "READ_ONLY": "false",
        "GODOT_PATH": "/path/to/godot"
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

### Option B: Cursor Configuration

#### UI Configuration

1. Open **Cursor Settings** → **Features** → **MCP**
2. Click **+ Add New MCP Server**
3. Configure:
   - **Name**: `godot`
   - **Type**: `command`
   - **Command**: `node /absolute/path/to/godot-mcp/build/index.js`
4. Click **Add** and refresh the server list

#### Project-Specific Configuration

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/absolute/path/to/godot-mcp/build/index.js"],
      "env": {
        "DEBUG": "false",
        "GODOT_PATH": "/path/to/godot",
        "READ_ONLY_MODE": "false"
      }
    }
  }
}
```

### Environment Variables

| Variable         | Description                      | Default       | Example           |
| ---------------- | -------------------------------- | ------------- | ----------------- |
| `GODOT_PATH`     | Path to Godot executable         | Auto-detected | `/usr/bin/godot4` |
| `DEBUG`          | Enable detailed logging          | `false`       | `true`            |
| `READ_ONLY_MODE` | Restrict to read-only operations | `false`       | `true`            |

### Platform-Specific Examples

#### Windows

```json
{
  "env": {
    "GODOT_PATH": "C:\\Program Files\\Godot\\godot.exe",
    "DEBUG": "true"
  }
}
```

#### macOS

```json
{
  "env": {
    "GODOT_PATH": "/Applications/Godot.app/Contents/MacOS/Godot",
    "DEBUG": "true"
  }
}
```

#### Linux

```json
{
  "env": {
    "GODOT_PATH": "/usr/bin/godot4",
    "DEBUG": "true"
  }
}
```

## API Reference

### System Tools

#### `get_godot_version`

Get the installed Godot version information.

**Parameters**: None

**Example Response**:

```json
{
  "version": "4.2.1.stable",
  "platform": "linux.x86_64"
}
```

### Project Tools

#### `launch_editor`

Launch the Godot editor for a specific project.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory

**Example**:

```javascript
{
  "projectPath": "/home/user/my-game"
}
```

#### `run_project`

Execute a Godot project and capture output.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `scene` (string, optional): Specific scene to run

**Example**:

```javascript
{
  "projectPath": "/home/user/my-game",
  "scene": "scenes/MainMenu.tscn"
}
```

#### `list_projects`

Find Godot projects in a specified directory.

**Parameters**:

- `directory` (string, required): Directory to search for projects
- `recursive` (boolean, optional): Whether to search recursively (default: false)

#### `get_project_info`

Retrieve detailed metadata about a Godot project.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory

**Example Response**:

```json
{
  "name": "My Awesome Game",
  "path": "/home/user/my-awesome-game",
  "godotVersion": "4.2.1.stable.official",
  "structure": {
    "scenes": 12,
    "scripts": 8,
    "assets": 45,
    "other": 3
  }
}
```

### Scene Management Tools

#### `create_scene`

Create a new scene in a Godot project.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `scenePath` (string, required): Path for the new scene file (relative to project)
- `rootNodeType` (string, optional): Type of the root node (default: "Node2D")

**Example**:

```javascript
{
  "projectPath": "/home/user/my-game",
  "scenePath": "scenes/Player.tscn",
  "rootNodeType": "CharacterBody2D"
}
```

#### `add_node`

Add a node to an existing scene.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `scenePath` (string, required): Path to the scene file (relative to project)
- `nodeType` (string, required): Type of node to add (e.g., "Sprite2D", "CollisionShape2D")
- `nodeName` (string, required): Name for the new node
- `parentNodePath` (string, optional): Path to parent node (defaults to root)
- `properties` (object, optional): Additional properties to set

**Example**:

```javascript
{
  "projectPath": "/home/user/my-game",
  "scenePath": "scenes/Player.tscn",
  "nodeType": "Sprite2D",
  "nodeName": "PlayerSprite",
  "properties": {
    "position": { "x": 100, "y": 50 },
    "scale": { "x": 2.0, "y": 2.0 }
  }
}
```

#### `edit_node`

Edit properties of an existing node in a scene.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `scenePath` (string, required): Path to the scene file (relative to project)
- `nodePath` (string, required): Path to the node to edit
- `properties` (object, required): Properties to update

**Example**:

```javascript
{
  "projectPath": "/home/user/my-game",
  "scenePath": "scenes/Player.tscn",
  "nodePath": "PlayerSprite",
  "properties": {
    "position": { "x": 200, "y": 100 },
    "modulate": { "r": 1.0, "g": 0.5, "b": 0.5, "a": 1.0 }
  }
}
```

#### `remove_node`

Remove a node from a scene.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `scenePath` (string, required): Path to the scene file (relative to project)
- `nodePath` (string, required): Path to the node to remove

#### `load_sprite`

Load a texture into a Sprite2D node.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `scenePath` (string, required): Path to the scene file (relative to project)
- `nodePath` (string, required): Path to the Sprite2D node
- `texturePath` (string, required): Path to the texture file (relative to project)

#### `save_scene`

Save a scene, optionally as a new variant.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `scenePath` (string, required): Path to the scene file (relative to project)
- `newPath` (string, optional): New path to save as variant

### Debug Tools

#### `get_debug_output`

Retrieve current debug output and errors from running projects.

**Parameters**: None

#### `stop_project`

Stop any currently running Godot project.

**Parameters**: None

### UID Tools (Godot 4.4+)

#### `get_uid`

Get the UID for a specific file in a Godot project.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory
- `filePath` (string, required): Path to the file (relative to project)

#### `update_project_uids`

Update UID references in a project by resaving resources.

**Parameters**:

- `projectPath` (string, required): Path to the Godot project directory

## Project Architecture

### Core Components

The Godot MCP server follows a modular architecture designed for maintainability and extensibility:

```
src/
├── config/           # Configuration management
├── core/            # Core functionality
│   ├── GodotExecutor.ts      # Godot command execution
│   ├── PathManager.ts        # Path detection and validation
│   ├── ProcessManager.ts     # Process lifecycle management
│   └── ParameterNormalizer.ts # Input parameter handling
├── server/          # MCP server implementation
│   ├── GodotMCPServer.ts     # Main server class
│   └── types.ts              # Type definitions
├── tools/           # Tool implementations
│   ├── BaseToolHandler.ts    # Shared tool functionality
│   ├── ToolRegistry.ts       # Tool registration and filtering
│   ├── debug/               # Debug-related tools
│   ├── project/             # Project management tools
│   ├── scene/               # Scene manipulation tools
│   ├── system/              # System information tools
│   └── uid/                 # UID management tools
├── utils/           # Utility functions
└── scripts/         # Godot operation scripts
```

### Key Design Principles

1. **Modular Tool System**: Each tool is self-contained with its own definition and handler
2. **Centralized Configuration**: Environment variables and settings managed in one location
3. **Robust Error Handling**: Comprehensive error reporting with actionable suggestions
4. **Security First**: Read-only mode and input validation protect against misuse
5. **Cross-platform Support**: Platform-agnostic design with OS-specific handling where needed

### Tool Registration System

Tools are registered in the [`ToolRegistry`](src/tools/ToolRegistry.ts:47) with metadata indicating their capabilities:

```typescript
export interface ToolRegistration {
  definition: ToolDefinition;
  handler: (args: any) => Promise<ToolResponse>;
  readOnly: boolean;
}
```

The registry automatically filters tools based on the current mode (read-only vs. full access) and provides a unified interface for tool discovery and execution.

### Bundled Operations Architecture

Complex Godot operations use a centralized GDScript approach:

1. **Single Script File**: All operations consolidated in [`godot_operations.gd`](src/scripts/godot_operations.gd:1)
2. **JSON Parameter Passing**: Operations receive structured parameters
3. **No Temporary Files**: Eliminates file system overhead and cleanup complexity
4. **Consistent Error Handling**: Standardized error reporting across all operations

This architecture provides better performance, maintainability, and reliability compared to generating temporary scripts for each operation.

## Usage Examples

### Basic Project Workflow

```text
"Launch the Godot editor for my project at /path/to/my-game"

"Run my Godot project and show me any errors"

"Get information about my project structure and settings"
```

### Scene Creation and Management

```text
"Create a new Player scene with a CharacterBody2D root node"

"Add a Sprite2D node called 'PlayerSprite' to my Player scene"

"Load the character texture 'textures/player.png' into the PlayerSprite node"

"Set the Player's position to (100, 50) and scale to 2x"

"Create a CollisionShape2D node as a child of the Player root"
```

### Advanced Workflows

```text
"Create a complete UI scene with buttons for Start Game, Settings, and Quit"

"Export my 3D level models as a MeshLibrary for use with GridMap"

"Analyze my project structure and suggest performance improvements"

"Debug this GDScript error and help me fix the character controller"

"Create a save system scene with file I/O nodes and data management"
```

## Read-Only Mode

Read-only mode provides a secure way to analyze Godot projects without making any modifications. This is ideal for CI/CD pipelines, code reviews, educational environments, and shared development scenarios.

### Enabling Read-Only Mode

Set the `READ_ONLY_MODE` environment variable to `"true"`:

```json
{
  "mcpServers": {
    "godot": {
      "command": "node",
      "args": ["/absolute/path/to/godot-mcp/build/index.js"],
      "env": {
        "READ_ONLY_MODE": "true"
      }
    }
  }
}
```

### Available vs. Restricted Tools

#### ✅ Available in Read-Only Mode

**System Tools**:

- [`get_godot_version`](src/tools/system/GetGodotVersionTool.ts:18): Get Godot version information

**Project Tools**:

- [`launch_editor`](src/tools/project/LaunchEditorTool.ts:18): Launch Godot editor
- [`run_project`](src/tools/project/RunProjectTool.ts:18): Run projects to analyze behavior
- [`list_projects`](src/tools/project/ListProjectsTool.ts:18): Discover projects in directories
- [`get_project_info`](src/tools/project/GetProjectInfoTool.ts:18): Retrieve project metadata

**Debug Tools**:

- [`get_debug_output`](src/tools/debug/GetDebugOutputTool.ts:18): Capture console output
- [`stop_project`](src/tools/debug/StopProjectTool.ts:18): Stop running projects

**UID Tools**:

- [`get_uid`](src/tools/uid/GetUidTool.ts:18): Get file UIDs (Godot 4.4+)

#### ❌ Restricted in Read-Only Mode

**Scene Modification Tools**:

- `create_scene`: Create new scenes
- `add_node`: Add nodes to scenes
- `edit_node`: Modify node properties
- `remove_node`: Remove nodes from scenes
- `load_sprite`: Load textures into nodes
- `export_mesh_library`: Export MeshLibrary resources
- `save_scene`: Save scene modifications

**UID Modification Tools**:

- `update_project_uids`: Update UID references

### Use Cases

- **🔄 CI/CD Pipelines**: Automated project analysis without risk of modification
- **👥 Code Reviews**: Safe project inspection for team collaboration
- **📊 Documentation**: Extract project information for automated documentation
- **🔍 Debugging**: Analyze project behavior without modification risk

## Troubleshooting

### Common Issues and Solutions

#### Godot Not Found

**Error**: `Could not find a valid Godot executable path`

**Solutions**:

1. **Set GODOT_PATH environment variable**:

   ```bash
   export GODOT_PATH="/path/to/godot"
   # or for Windows:
   set GODOT_PATH="C:\Program Files\Godot\godot.exe"
   ```

2. **Verify Godot installation**:

   ```bash
   # Test if Godot is accessible
   godot --version
   # or try:
   godot4 --version
   ```

3. **Common Godot paths**:
   - **Windows**: `C:\Program Files\Godot\godot.exe`
   - **macOS**: `/Applications/Godot.app/Contents/MacOS/Godot`
   - **Linux**: `/usr/bin/godot4` or `/usr/local/bin/godot`

#### Connection Issues

**Error**: MCP server not responding or tools not available

**Solutions**:

1. **Restart your AI assistant** after configuration changes
2. **Check server logs** by enabling debug mode: `"DEBUG": "true"`
3. **Verify configuration path** is absolute and correct
4. **Test server manually**:
   ```bash
   node /path/to/godot-mcp/build/index.js
   ```

#### Invalid Project Path

**Error**: `Invalid project path` or `project.godot not found`

**Solutions**:

1. **Ensure path contains project.godot**:
   ```bash
   ls /path/to/project/project.godot
   ```
2. **Use absolute paths** when possible
3. **Check file permissions** on the project directory

#### Build Issues

**Error**: Build fails or dependencies missing

**Solutions**:

1. **Clean and rebuild**:

   ```bash
   npm run clean
   npm install
   npm run build
   ```

2. **Clear npm cache**:
   ```bash
   npm cache clean --force
   ```

### Getting Help

If you encounter issues not covered here:

1. **Check debug logs** with `DEBUG=true`
2. **Search existing issues** on GitHub
3. **Create a detailed issue report** with:
   - Operating system and version
   - Node.js and Godot versions
   - Complete error messages
   - Configuration used
   - Steps to reproduce

## FAQ

### General Questions

**Q: What versions of Godot are supported?**
A: Godot 3.5+ and all Godot 4.x versions. Some features (like UID management) require Godot 4.4+.

**Q: Can I use this with Godot 3.x projects?**
A: Yes, most features work with Godot 3.5+. Scene management and project operations are fully supported.

**Q: Is this safe to use on production projects?**
A: Yes, especially with read-only mode enabled. The server includes comprehensive validation and error handling.

### Technical Questions

**Q: How does the server detect my Godot installation?**
A: The server checks common installation paths for each platform. You can override detection with the `GODOT_PATH` environment variable.

**Q: Can I run multiple instances of the server?**
A: Yes, each instance operates independently. Useful for working with multiple projects simultaneously.

**Q: What happens if Godot crashes during an operation?**
A: The server detects process failures and returns appropriate error messages with suggestions for resolution.

**Q: Are temporary files created during operations?**
A: No, the server uses a bundled GDScript approach that avoids temporary file creation for better performance and security.

### AI Assistant Integration

**Q: Which AI assistants work with this server?**
A: Any AI assistant supporting the Model Context Protocol, including Cline, Roo Code, Cursor, VS Code, Claude Desktop, and others.

**Q: Can I customize which tools are available?**
A: Yes, through the autoApprove configuration or by modifying the tool registry for custom builds.

**Q: How do I know if the integration is working?**
A: The AI assistant should be able to list available tools and execute them. Enable debug mode to see detailed operation logs.

### Development Questions

**Q: Can I add custom tools to the server?**
A: Yes, the modular architecture makes it easy to add new tools. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development guidelines.

**Q: How do I contribute to the project?**
A: Fork the repository, make your changes, and submit a pull request. Please follow the existing code style and include tests.

**Q: Is the server extensible for other game engines?**
A: The MCP architecture is engine-agnostic, but this implementation is specifically designed for Godot. Similar servers could be created for other engines.

## Contributing

We welcome contributions to improve Godot MCP! Please see our [`CONTRIBUTING.md`](CONTRIBUTING.md) guide for:

- Development setup instructions
- Code style guidelines
- Testing procedures
- Pull request process
- Issue reporting guidelines

### Quick Start for Contributors

```bash
# Fork and clone the repository
git clone https://github.com/your-username/godot-mcp.git
cd godot-mcp

# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## License

This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

## Credits

This project was originally forked from [Coding-Solo/godot-mcp](https://github.com/Coding-Solo/godot-mcp).

## Support

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/bradypp/godot-mcp/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/bradypp/godot-mcp/discussions)
- **📖 Documentation**: This README and inline code documentation
- **💬 Community**: Join discussions about Godot MCP and AI-assisted development

---

**Built with ❤️ for the Godot and AI development communities**
