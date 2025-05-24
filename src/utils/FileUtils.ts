/**
 * File system utilities
 * Provides file and directory operations
 */

import { existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

export interface GodotProject {
  path: string;
  name: string;
}

/**
 * Check if a directory is a valid Godot project
 */
export const isGodotProject = (projectPath: string): boolean => {
  const projectFile = join(projectPath, 'project.godot');
  return existsSync(projectFile);
};

/**
 * Find Godot projects in a directory
 */
export const findGodotProjects = (directory: string, recursive: boolean): GodotProject[] => {
  const projects: GodotProject[] = [];

  try {
    // Check if the directory itself is a Godot project
    if (isGodotProject(directory)) {
      projects.push({
        path: directory,
        name: basename(directory),
      });
    }

    // Search subdirectories
    const entries = readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subdir = join(directory, entry.name);

        if (isGodotProject(subdir)) {
          projects.push({
            path: subdir,
            name: entry.name,
          });
        } else if (recursive) {
          // Recursively search this directory
          const subProjects = findGodotProjects(subdir, true);
          projects.push(...subProjects);
        }
      }
    }
  } catch (error) {
    // Silently ignore errors for now
  }

  return projects;
};

/**
 * Get project structure with file counts
 */
export const getProjectStructure = (
  projectPath: string,
): {
  scenes: number;
  scripts: number;
  assets: number;
  other: number;
} => {
  try {
    const structure = {
      scenes: 0,
      scripts: 0,
      assets: 0,
      other: 0,
    };

    const scanDirectory = (currentPath: string) => {
      const entries = readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = join(currentPath, entry.name);

        if (entry.name.startsWith('.')) {
          continue;
        }

        if (entry.isDirectory()) {
          scanDirectory(entryPath);
        } else if (entry.isFile()) {
          const ext = entry.name.split('.').pop()?.toLowerCase();

          if (ext === 'tscn') {
            structure.scenes++;
          } else if (ext === 'gd' || ext === 'gdscript' || ext === 'cs') {
            structure.scripts++;
          } else if (
            ['png', 'jpg', 'jpeg', 'webp', 'svg', 'ttf', 'wav', 'mp3', 'ogg'].includes(ext || '')
          ) {
            structure.assets++;
          } else {
            structure.other++;
          }
        }
      }
    };

    scanDirectory(projectPath);
    return structure;
  } catch (error) {
    return {
      error: 'Failed to get project structure',
      scenes: 0,
      scripts: 0,
      assets: 0,
      other: 0,
    } as any;
  }
};
