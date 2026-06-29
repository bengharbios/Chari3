const fs = require('fs');

function mergeDuplicateKeys(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  let firstIdx = text.indexOf('"security": {');
  let secondIdx = text.indexOf('"security": {', firstIdx + 1);

  if (secondIdx === -1) { 
    console.log('no duplicate in ' + filePath); 
    return; 
  }

  // Extract first block content
  let firstStart = firstIdx + '"security": {'.length;
  let braces = 1;
  let firstEnd = firstStart;
  for (let i = firstStart; i < text.length; i++) {
    if (text[i] === '{') braces++;
    if (text[i] === '}') braces--;
    if (braces === 0) {
      firstEnd = i;
      break;
    }
  }
  
  let firstBlockStr = text.substring(firstStart, firstEnd);
  
  // Find second block
  let secondStart = secondIdx + '"security": {'.length;
  braces = 1;
  let secondEnd = secondStart;
  for (let i = secondStart; i < text.length; i++) {
    if (text[i] === '{') braces++;
    if (text[i] === '}') braces--;
    if (braces === 0) {
      secondEnd = i;
      break;
    }
  }
  
  let mergedInner = text.substring(secondStart, secondEnd).trim();
  if (mergedInner.endsWith(',')) {
     mergedInner = mergedInner.slice(0, -1);
  }
  
  let newSecondBlockStr = '"security": {\n' + mergedInner + ',\n' + firstBlockStr + '\n}';
  
  let textWithNewSecond = text.substring(0, secondIdx) + newSecondBlockStr + text.substring(secondEnd + 1);
  
  let removeStart = firstIdx;
  let removeEnd = firstEnd + 1;
  if (textWithNewSecond[removeEnd] === ',') removeEnd++;
  else if (textWithNewSecond.substring(removeEnd, removeEnd + 2) === ',\n') removeEnd += 2;
  
  let finalText = textWithNewSecond.substring(0, removeStart) + textWithNewSecond.substring(removeEnd);
  
  finalText = finalText.replace(/,\s*,/g, ',');
  
  fs.writeFileSync(filePath, finalText, 'utf8');
  console.log('Fixed ' + filePath);
}

mergeDuplicateKeys('./src/lib/i18n/dictionaries/ar.json');
mergeDuplicateKeys('./src/lib/i18n/dictionaries/en.json');
