"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var base = './projects/daxur-studios/engine/src/lib';
// projects\daxur-studios\engine\src\lib\models
mergeFiles("".concat(base, "/models"), 'models.ts');
// projects\daxur-studios\engine\src\lib\services
mergeFiles("".concat(base, "/services"), 'services.ts');
// projects\daxur-studios\engine\src\lib\core
mergeFiles("".concat(base, "/core"), 'core.ts');
// projects\daxur-studios\engine\src\lib\components
mergeFiles("".concat(base, "/components"), 'components.ts');
// base
mergeFiles(base, 'engine.ts');
function mergeFiles(baseFolder, mergedFileName) {
    console.log("\uD83D\uDC32 STARING FILE MERGE \uD83D\uDC32");
    var stringCount = 0;
    // Create empty folder at `dist/ai`, if already exists, delete it and recreate it
    var folderPath = './dist/ai';
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true });
    }
    fs.mkdirSync(folderPath);
    // Get all files in base folder recursively
    var files = getFiles(baseFolder);
    // Create a merged file
    var mergedFilePath = "./dist/ai/".concat(mergedFileName);
    var mergedFile = fs.createWriteStream(mergedFilePath);
    // Write the content of each file
    files.forEach(function (file) {
        // Skip files that are not .ts
        if (!file.endsWith('.ts')) {
            return;
        }
        var content = fs.readFileSync(file, 'utf8');
        mergedFile.write("//#region ".concat(file, "\n"));
        mergedFile.write(content);
        mergedFile.write('\n');
        mergedFile.write("//#endregion ".concat(file, "\n\n"));
    });
    // Close file
    mergedFile.end();
    // Log stats
    console.log("\uD83D\uDC32 ".concat(files.length, " files merged into ").concat(mergedFilePath));
}
function getFiles(dir) {
    var results = [];
    var files = fs.readdirSync(dir);
    files.forEach(function (file) {
        var filePath = "".concat(dir, "/").concat(file);
        var stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results.push.apply(results, getFiles(filePath));
        }
        else {
            results.push(filePath);
        }
    });
    return results;
}
