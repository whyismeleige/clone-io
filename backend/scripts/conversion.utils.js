/**
 * conversion.utils.js
 * Utilities for parsing XML responses and managing file structures.
 */

const parseXml = (response) => {
  const xmlMatch = response.match(
    /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/
  );

  if (!xmlMatch) {
    return [[], "Project Files"];
  }

  const xmlContent = xmlMatch[1];
  const files = [];

  const titleMatch = response.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : "Project Files";

  const actionRegex =
    /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;

  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;

    if (type === "file") {
      files.push({
        content: content.trim(),
        path: filePath,
      });
    }
  }
  return [files, artifactTitle];
};

/**
 * INTELLIGENT MERGE (UPDATED)
 * - Handles overwrites.
 * - Handles upgrades (JS -> TS): Deletes old JS files.
 * - Handles switches (TS -> JS): Deletes old TS files.
 */
const mergeFileLists = (baseFiles, newFiles) => {
  const fileMap = new Map();

  // 1. Add all base files to the map
  baseFiles.forEach((file) => {
    fileMap.set(file.path, file);
  });

  // 2. Process new files and clean up conflicts
  newFiles.forEach((newFile) => {
    const path = newFile.path;

    // --- Scenario A: New file is JavaScript (Remove existing TypeScript) ---
    if (path.endsWith('.js')) {
      const tsPath = path.replace(/\.js$/, '.ts');
      if (fileMap.has(tsPath)) fileMap.delete(tsPath);
    } 
    else if (path.endsWith('.jsx')) {
      const tsxPath = path.replace(/\.jsx$/, '.tsx');
      if (fileMap.has(tsxPath)) fileMap.delete(tsxPath);
    }

    // --- Scenario B: New file is TypeScript (Remove existing JavaScript) ---
    else if (path.endsWith('.ts')) {
      const jsPath = path.replace(/\.ts$/, '.js');
      if (fileMap.has(jsPath)) fileMap.delete(jsPath);
    } 
    else if (path.endsWith('.tsx')) {
      const jsPath = path.replace(/\.tsx$/, '.jsx');
      if (fileMap.has(jsPath)) fileMap.delete(jsPath);
    }

    // --- Scenario C: Special Config Handling ---
    // If we have a new vite config, remove ALL other variations
    if (path.includes('vite.config')) {
       if (path === 'vite.config.js') fileMap.delete('vite.config.ts');
       if (path === 'vite.config.ts') fileMap.delete('vite.config.js');
    }

    // Add or Overwrite the new file
    fileMap.set(path, newFile);
  });

  return Array.from(fileMap.values());
};

module.exports = { parseXml, mergeFileLists };