const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('src/app/admin-secure-internal/settings/homepage/page.tsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("No syntax error found by Babel?!");
} catch (e) {
  console.log("Babel parse error:", e.message);
  console.log("Line:", e.loc.line, "Column:", e.loc.column);
}

// Since babel just bails out, let's do a simple stack-based bracket matcher that ignores things inside strings and comments
function findMismatchedBrackets(str) {
  const stack = [];
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let inMultiComment = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const next = str[i+1];
    
    if (!inString && !inComment && !inMultiComment) {
      if (c === '/' && next === '/') {
        inComment = true;
        i++;
      } else if (c === '/' && next === '*') {
        inMultiComment = true;
        i++;
      } else if (c === '"' || c === "'" || c === '`') {
        inString = true;
        stringChar = c;
      } else if (c === '{' || c === '(' || c === '[') {
        stack.push({ char: c, pos: i });
      } else if (c === '}' || c === ')' || c === ']') {
        const last = stack.pop();
        if (!last) return { error: `Extra ${c} at pos ${i}` };
        
        const expected = c === '}' ? '{' : c === ')' ? '(' : '[';
        if (last.char !== expected) {
          return { error: `Mismatched ${c} at pos ${i}, expected closing for ${last.char} at pos ${last.pos}` };
        }
      }
    } else if (inString) {
      if (c === '\\') i++; // skip escaped
      else if (c === stringChar) inString = false;
    } else if (inComment) {
      if (c === '\n') inComment = false;
    } else if (inMultiComment) {
      if (c === '*' && next === '/') {
        inMultiComment = false;
        i++;
      }
    }
  }
  
  if (stack.length > 0) {
    return { error: `Unclosed ${stack[stack.length-1].char} at pos ${stack[stack.length-1].pos}` };
  }
  return { success: true };
}

console.log(findMismatchedBrackets(code));
