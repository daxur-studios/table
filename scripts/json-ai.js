"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var base = process.argv[2] || './src';
var distBase = './dist/json-ai';
var ignoreFolders = new Set([
    'node_modules',
    '.angular',
    'dist',
    'scripts',
    'functions',
    'emulator',
]);
// Global JSON object to hold the directory structure and file content
var jsonTree = {};
// Start the recursive process from the base directory
buildJsonTree(base, jsonTree);
// Ensure the distFolder exists
if (!fs.existsSync(distBase)) {
    fs.mkdirSync(distBase, { recursive: true });
}
// Once the tree is built, write it to a JSON file
fs.writeFileSync(path.join(distBase, 
// Replace slashes with dots
"".concat(base.replace(/\//g, '.'), ".json")), JSON.stringify(jsonTree, null, 2));
function buildJsonTree(baseFolder, jsonNode) {
    console.log("\uD83C\uDF33 Building JSON Tree for ".concat(baseFolder));
    // Get all files and directories in baseFolder
    var entries = getFilesAndDirectories(baseFolder);
    entries.forEach(function (entry) {
        if (entry.isDirectory) {
            // If it's a directory, create a new node and recurse
            jsonNode[entry.name] = {};
            buildJsonTree(path.join(baseFolder, entry.name), jsonNode[entry.name]);
        }
        else {
            // If it's a file, read its content and add to the current node
            var filePath = path.join(baseFolder, entry.name);
            jsonNode[entry.name] = fs.readFileSync(filePath, 'utf8');
        }
    });
}
function getFilesAndDirectories(dir) {
    var results = [];
    var entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(function (entry) {
        if (!ignoreFolders.has(entry.name)) {
            results.push({
                name: entry.name,
                isDirectory: entry.isDirectory(),
            });
        }
    });
    return results;
}
