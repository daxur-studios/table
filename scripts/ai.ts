//version 08/11/202320:38
import * as fs from 'fs';
import * as path from 'path';

const base = './src';
const distBase = './dist/ai';

const ignoreFolders = new Set([
  'node_modules',
  '.angular',
  'dist',
  'scripts',
  'functions',
  'emulator',
]);

// Global variable to hold all the merged content
let allContent = '';

//#region Clean directory before starting the merge
// Clean the dist/ai directory before starting the merge
prepareDirectory();

//#endregion

// Start the recursive merge process from the base directory
mergeFiles(base, distBase);
createAllInOneFile();

function mergeFiles(baseFolder: string, distFolder: string) {
  console.log(`🐲 STARTING FILE MERGE IN ${baseFolder} 🐲`);

  // Ensure the distFolder exists
  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder, { recursive: true });
  }

  // Get all files and directories in srcFolder
  const entries = getFilesAndDirectories(baseFolder);

  // Filter the entries for files that match the specified extensions
  const files = entries.filter((entry) =>
    /\.(html|css|scss|ts|json)$/.test(entry.name)
  );

  // Create a merged file path
  const mergedFileName = `${path.basename(baseFolder)}.ai`;
  const mergedFilePath = path.join(distFolder, mergedFileName);
  const mergedFile = fs.createWriteStream(mergedFilePath);

  // Write the content of each file and add to allContent
  files.forEach((file) => {
    const filePath = path.join(baseFolder, file.name);
    const relativeFilePath = path.relative(base, filePath); // To get the relative path from base

    let content = fs.readFileSync(filePath, 'utf8');

    // Minify the content based on file type
    content = minifyCode(content);

    // Make the path relative
    const relativePath = `./${path.basename(filePath)}`;

    // Write the file path and content enclosed in triple backticks, each on new lines
    mergedFile.write(`\n${relativePath}\n\`\`\`\n`);
    mergedFile.write(content);
    mergedFile.write(`\n\`\`\`\n`);

    // Also append to the global content variable
    allContent += `\n${relativeFilePath}\n\`\`\`\n${content}\n\`\`\`\n`;
  });

  function minifyCode(input: string): string {
    // Remove single line comments
    let result = input.replace(/\/\/.*$/gm, '');

    // Replace all new lines and line breaks with a single space
    result = result.replace(/(\r\n|\n|\r)+/gm, ' ');

    // The rest of the minification steps should probably be skipped
    // because they remove spaces and format the code in a way
    // that could make it less readable which is not what you want.

    return result.trim(); // Trim the final string to remove any leading/trailing spaces
  }

  // Close file
  mergedFile.end();

  // Log stats
  console.log(`🐲 ${files.length} files merged into ${mergedFilePath}`);

  // Recursively call mergeFiles for each directory that is not ignored
  const directories = entries.filter(
    (entry) => entry.isDirectory && !ignoreFolders.has(entry.name)
  );
  directories.forEach((dir) => {
    const srcDirPath = path.join(baseFolder, dir.name);
    const distDirPath = path.join(distFolder, dir.name);
    mergeFiles(srcDirPath, distDirPath);
  });
}

function createAllInOneFile() {
  // Once all the files are processed, write the global content to a file at the top level
  const allInOneFilePath = path.join(distBase, '_All_Files_Combined.ai');
  fs.writeFileSync(allInOneFilePath, allContent);
}

function getFilesAndDirectories(dir: string) {
  const results: { name: string; isDirectory: boolean }[] = [];
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

function prepareDirectory() {
  if (fs.existsSync(distBase)) {
    fs.rmSync(distBase, { recursive: true, force: true });
    console.log(`🧹 Cleaned directory: ${distBase}`);
  }

  // Ensure the distBase exists
  if (!fs.existsSync(distBase)) {
    fs.mkdirSync(distBase, { recursive: true });
  }
}
