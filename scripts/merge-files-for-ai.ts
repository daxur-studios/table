import * as fs from 'fs';

const base = './projects/daxur-studios/engine/src/lib';
// projects\daxur-studios\engine\src\lib\models
mergeFiles(`${base}/models`, 'models.ts');
// projects\daxur-studios\engine\src\lib\services
mergeFiles(`${base}/services`, 'services.ts');
// projects\daxur-studios\engine\src\lib\core
mergeFiles(`${base}/core`, 'core.ts');
// projects\daxur-studios\engine\src\lib\components
mergeFiles(`${base}/components`, 'components.ts');

// base
mergeFiles(base, 'engine.ts');

function mergeFiles(baseFolder: string, mergedFileName: string) {
  console.log(`🐲 STARING FILE MERGE 🐲`);
  let stringCount = 0;

  // Create empty folder at `dist/ai`, if already exists, delete it and recreate it
  const folderPath = './dist/ai';
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true });
  }
  fs.mkdirSync(folderPath);

  // Get all files in base folder recursively
  const files = getFiles(baseFolder);

  // Create a merged file
  const mergedFilePath = `./dist/ai/${mergedFileName}`;
  const mergedFile = fs.createWriteStream(mergedFilePath);

  // Write the content of each file
  files.forEach((file) => {
    // Skip files that are not .ts
    if (!file.endsWith('.ts')) {
      return;
    }

    const content = fs.readFileSync(file, 'utf8');
    mergedFile.write(`//#region ${file}\n`);
    mergedFile.write(content);
    mergedFile.write('\n');
    mergedFile.write(`//#endregion ${file}\n\n`);
  });

  // Close file
  mergedFile.end();

  // Log stats
  console.log(`🐲 ${files.length} files merged into ${mergedFilePath}`);
}

function getFiles(dir: string) {
  const results: string[] = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = `${dir}/${file}`;
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results.push(...getFiles(filePath));
    } else {
      results.push(filePath);
    }
  });

  return results;
}
