const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  let currentComponent = null;
  let componentLines = [];
  let lineNumbers = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.match(/^(export\s+)?(default\s+)?(function\s+[A-Z]\w*|const\s+[A-Z]\w*\s*=\s*(\([^)]*\)|[^=]*)\s*=>)/)) {
      if (currentComponent) {
        analyzeComponent(filePath, currentComponent, componentLines, lineNumbers);
      }
      currentComponent = line.trim();
      componentLines = [line];
      lineNumbers = [i + 1];
    } else if (currentComponent) {
      componentLines.push(line);
      lineNumbers.push(i + 1);
      
      // Basic exit heuristic
      if (line.match(/^}\s*$/) || line.match(/^};\s*$/)) {
        analyzeComponent(filePath, currentComponent, componentLines, lineNumbers);
        currentComponent = null;
        componentLines = [];
        lineNumbers = [];
      }
    }
  }
}

function analyzeComponent(filePath, name, lines, lineNumbers) {
  let hasEarlyReturn = false;
  let earlyReturnLine = 0;
  
  // We only care about root-level early returns, but parsing is hard.
  // Let's just look for `if (...) return` that is NOT inside a useCallback or useEffect.
  // To do this simply, we'll keep track of braces depth.
  let depth = 0;
  let insideHookDecl = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comments
    if (line.trim().startsWith('//')) continue;
    
    // adjust depth
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
    
    // Are we inside a hook callback? (like useEffect or useCallback)
    if (line.match(/\buse(Effect|Callback|Memo)\s*\(/)) {
      insideHookDecl = true;
    }
    
    // If depth goes back to 1 (the component body), we are not inside a hook callback anymore
    if (depth <= 1) {
      insideHookDecl = false;
    }
    
    // Check for early returns in the component body (depth 1)
    if (depth === 1 && !insideHookDecl && (line.match(/\bif\s*\(.*\)\s*return\b/) || line.match(/^\s*return\b/))) {
      hasEarlyReturn = true;
      earlyReturnLine = lineNumbers[i];
    }
    
    // Check for hooks in the component body (depth 1)
    if (depth === 1 && line.match(/\buse[A-Z]\w*\s*\(/)) {
      if (hasEarlyReturn) {
        console.log(`POTENTIAL VIOLATION in ${filePath} at line ${lineNumbers[i]}:`);
        console.log(`  Component: ${name}`);
        console.log(`  Early return was at line ${earlyReturnLine}`);
        console.log(`  Hook called: ${line.trim()}`);
        console.log('-----------------------------------');
      }
    }
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      checkFile(fullPath);
    }
  }
}

walk('./src');
