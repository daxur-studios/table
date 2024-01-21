import * as fs from 'fs';
import * as path from 'path';

const base = process.argv[2] || './src';
const distBase = './dist/json-ai';

const ignoreFolders = new Set([
  'node_modules',
  '.angular',
  'dist',
  'scripts',
  'functions',
  'emulator',
]);

// Global JSON object to hold the directory structure and file content
const jsonTree = {};

// Start the recursive process from the base directory
buildJsonTree(base, jsonTree);

// Ensure the distFolder exists
if (!fs.existsSync(distBase)) {
  fs.mkdirSync(distBase, { recursive: true });
}

// Once the tree is built, write it to a JSON file
fs.writeFileSync(
  path.join(
    distBase,
    // Replace slashes with dots
    `${base.replace(/\//g, '.')}.json`
  ),
  JSON.stringify(jsonTree, null, 2)
);

function buildJsonTree(baseFolder: any, jsonNode: any) {
  console.log(`🌳 Building JSON Tree for ${baseFolder}`);

  // Get all files and directories in baseFolder
  const entries = getFilesAndDirectories(baseFolder);

  entries.forEach((entry) => {
    if (entry.isDirectory) {
      // If it's a directory, create a new node and recurse
      jsonNode[entry.name] = {};
      buildJsonTree(path.join(baseFolder, entry.name), jsonNode[entry.name]);
    } else {
      // If it's a file, read its content and add to the current node
      const filePath = path.join(baseFolder, entry.name);
      jsonNode[entry.name] = fs.readFileSync(filePath, 'utf8');
    }
  });
}

function getFilesAndDirectories(dir: any) {
  const results: any[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    if (!ignoreFolders.has(entry.name)) {
      results.push({
        name: entry.name,
        isDirectory: entry.isDirectory(),
      });
    }
  });

  return results;
}
