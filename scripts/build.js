import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fix relative imports by adding .js extensions
 */
function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Replace relative imports without .js extension in one go
  // Match ./, ../, and @ patterns for both 'from' and 'import' statements
  const fixedContent = content.replace(
    /(from|import)\s+['"](\.\/.+?|\.\.\/.+?)(?<!\.js)['"]/g,
    "$1 '$2.js'",
  );

  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent);
  }
}

/**
 * Recursively process all .js files in a directory
 */
function fixImportsInDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixImportsInDirectory(filePath);
    } else if (file.endsWith('.js')) {
      fixImportsInFile(filePath);
    }
  }
}

// Fix imports in all compiled JavaScript files
console.log('Fixing imports in compiled JavaScript files...');
const buildDir = path.join(__dirname, '..', 'build');
fixImportsInDirectory(buildDir);
console.log('Import fixing completed!');

// Make the build/index.js file executable
fs.chmodSync(path.join(__dirname, '..', 'build', 'index.js'), '755');

// Copy the scripts directory to the build directory
try {
  // Ensure the build/scripts directory exists
  fs.ensureDirSync(path.join(__dirname, '..', 'build', 'scripts'));

  // Copy the godot_operations.gd file
  fs.copyFileSync(
    path.join(__dirname, '..', 'src', 'scripts', 'godot_operations.gd'),
    path.join(__dirname, '..', 'build', 'scripts', 'godot_operations.gd'),
  );

  console.log('Successfully copied godot_operations.gd to build/scripts');
} catch (error) {
  console.error('Error copying scripts:', error);
  process.exit(1);
}

console.log('Build scripts completed successfully!');
