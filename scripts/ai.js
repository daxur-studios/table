"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var base = './projects/daxur-studios/engine/src';
var distBase = './dist/ai';
var ignoreFolders = new Set(['node_modules', '.angular', 'dist']);
//#region Clean directory before starting the merge
// Clean the dist/ai directory before starting the merge
cleanDirectory(distBase);
// Ensure the distBase exists
if (!fs.existsSync(distBase)) {
    fs.mkdirSync(distBase, { recursive: true });
}
//#endregion
// Start the recursive merge process from the base directory
mergeFiles(base, distBase);
function mergeFiles(baseFolder, distFolder) {
    console.log("\uD83D\uDC32 STARTING FILE MERGE IN ".concat(baseFolder, " \uD83D\uDC32"));
    // Ensure the distFolder exists
    if (!fs.existsSync(distFolder)) {
        fs.mkdirSync(distFolder, { recursive: true });
    }
    // Get all files and directories in srcFolder
    var entries = getFilesAndDirectories(baseFolder);
    // Filter the entries for files that match the specified extensions
    var files = entries.filter(function (entry) {
        return /\.(html|css|scss|ts|json)$/.test(entry.name);
    });
    // Create a merged file path
    var mergedFileName = "".concat(path.basename(baseFolder), ".ai");
    var mergedFilePath = path.join(distFolder, mergedFileName);
    var mergedFile = fs.createWriteStream(mergedFilePath);
    // Write the content of each file
    files.forEach(function (file) {
        var filePath = path.join(baseFolder, file.name);
        var content = fs.readFileSync(filePath, 'utf8');
        // Minify the content based on file type
        content = minifyCode(content);
        // Make the path relative
        var relativePath = "./".concat(path.basename(filePath));
        // Write the file path and content enclosed in triple backticks, each on new lines
        mergedFile.write("\n".concat(relativePath, "\n```\n"));
        mergedFile.write(content);
        mergedFile.write("\n```\n");
    });
    function minifyCode(input) {
        // Remove single line comments
        var result = input.replace(/\/\/.*$/gm, '');
        // Remove new lines and line breaks
        result = result.replace(/(\r\n|\n|\r)/gm, '');
        // Remove multiple white spaces with single space
        result = result.replace(/\s+/g, ' ');
        // Remove spaces before and after certain characters
        result = result.replace(/\s*([{};])\s*/g, '$1');
        // Optional: Remove last semicolon before closing brace for an even smaller output
        result = result.replace(/;}/g, '}');
        return result;
    }
    // Close file
    mergedFile.end();
    // Log stats
    console.log("\uD83D\uDC32 ".concat(files.length, " files merged into ").concat(mergedFilePath));
    // Recursively call mergeFiles for each directory that is not ignored
    var directories = entries.filter(function (entry) { return entry.isDirectory && !ignoreFolders.has(entry.name); });
    directories.forEach(function (dir) {
        var srcDirPath = path.join(baseFolder, dir.name);
        var distDirPath = path.join(distFolder, dir.name);
        mergeFiles(srcDirPath, distDirPath);
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
function cleanDirectory(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.rmSync(directoryPath, { recursive: true, force: true });
        console.log("\uD83E\uDDF9 Cleaned directory: ".concat(directoryPath));
    }
    fs.mkdirSync(directoryPath, { recursive: true });
}
