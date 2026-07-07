const fs = require('fs');
const path = require('path');

function decodeMojibake(str) {
  // Convert standard JavaScript string to bytes pretending it was CP850 / Windows-1256
  // Many Arabic characters in CP850 are represented by byte sequences.
  // ┘ = 0xD9, ╪ = 0xD8, etc.
  const charToByte = {
    '╪': 0xD8, '┘': 0xD9, '╢': 0xD6, '╖': 0xD7, '╖': 0xD7, '╢': 0xD6,
    'º': 0xA7, '¿': 0xBF, '⌐': 0xAA, '¼': 0xAC, '½': 0xAB, '▒': 0xB1,
    '│': 0xB3, '┤': 0xB4, '╡': 0xB5, '╢': 0xB6, '╖': 0xB7, '╕': 0xB8,
    '╣': 0xB9, '║': 0xBA, '╗': 0xBB, '╝': 0xBC, '╜': 0xBD, '╛': 0xBE,
    '┐': 0xBF, '└': 0xC0, '┴': 0xC1, '┬': 0xC2, '├': 0xC3, '─': 0xC4,
    '┼': 0xC5, '╞': 0xC6, '╟': 0xC7, '╚': 0xC8, '╔': 0xC9, '╩': 0xCA,
    '╦': 0xCB, '╠': 0xCC, '═': 0xCD, '╬': 0xCE, '╧': 0xCF, '╨': 0xD0,
    '╤': 0xD1, '╥': 0xD2, '╙': 0xD3, '╘': 0xD4, '╒': 0xD5, '╓': 0xD6,
    '╫': 0xD7, '╪': 0xD8, '┘': 0xD9, '┌': 0xDA, '█': 0xDB, '▄': 0xDC,
    '▌': 0xDD, '▐': 0xDE, '▀': 0xDF, 'α': 0xE0, 'ß': 0xE1, 'Γ': 0xE2,
    'π': 0xE3, 'Σ': 0xE4, 'σ': 0xE5, 'µ': 0xE6, 'τ': 0xE7, 'Φ': 0xE8,
    'Θ': 0xE9, 'Ω': 0xEA, 'δ': 0xEB, '∞': 0xEC, 'φ': 0xED, 'ε': 0xEE,
    '∩': 0xEF, '≡': 0xF0, '±': 0xF1, '≥': 0xF2, '≤': 0xF3, '⌠': 0xF4,
    '⌡': 0xF5, '÷': 0xF6, '≈': 0xF7, '°': 0xF8, '∙': 0xF9, '·': 0xFA,
    '√': 0xFB, 'ⁿ': 0xFC, '²': 0xFD, '■': 0xFE, ' ': 0xFF
  };

  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (charToByte[char] !== undefined) {
      bytes.push(charToByte[char]);
    } else {
      // Decode standard ASCII or individual Arabic bytes
      const code = char.charCodeAt(0);
      if (code < 128) {
        bytes.push(code);
      } else {
        // Fallback or translate directly
        const buf = Buffer.from(char, 'utf8');
        for (const b of buf) {
          bytes.push(b);
        }
      }
    }
  }

  // Now convert these bytes to UTF-8
  const decoded = Buffer.from(bytes).toString('utf8');
  return decoded;
}

// Let's test the decoder on a few known strings
console.log('Test decode: "┘à╪╣┘ä┘ê┘à╪º╪¬ ╪º┘ä╪¡╪│╪º╪¿" -> ', decodeMojibake("┘à╪╣┘ä┘ê┘à╪º╪¬ ╪º┘ä╪¡╪│╪º╪¿"));
console.log('Test decode: "┘å╪┤╪╖" -> ', decodeMojibake("┘å╪┤╪╖"));
console.log('Test decode: "╪º┘ä╪¬┘ê╪½┘è┘é" -> ', decodeMojibake("╪º┘ä╪¬┘ê╪½┘è┘é"));

// Now read the file and replace
const filePath = path.join(__dirname, '../src/components/admin/UserManagementPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find translation strings like t(locale, 'MOJIBAKE', 'English')
// Match t(locale, '...', '...') where the first string has non-ascii/mojibake chars
const regex = /t\(\s*locale\s*,\s*(['"`])(.*?)\1\s*,\s*(['"`])(.*?)\3\s*\)/g;

let count = 0;
content = content.replace(regex, (match, quote1, arText, quote2, enText) => {
  // If the Arabic text contains mojibake characters like ╪, ┘, ╢ etc.
  if (/[╪┘╢╖╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■]/.test(arText)) {
    const decoded = decodeMojibake(arText);
    // Sanitize any escaped backslashes/quotes
    console.log(`Decoding: "${arText}" -> "${decoded}"`);
    count++;
    return `t(locale, ${quote1}${decoded}${quote1}, ${quote2}${enText}${quote2})`;
  }
  return match;
});

// Also replace variables using includes
content = content.replace(/impactAr\.includes\('╪¬╪╣╪╖┘è┘ä'\)/g, "impactAr.includes('تعطيل')");
content = content.replace(/impactAr\.includes\('╪¬┘ê╪½┘è┘é'\)/g, "impactAr.includes('توثيق')");
content = content.replace(/impactAr\.includes\('╪│╪¬┘ü┘é╪»'\)/g, "impactAr.includes('ستفقد')");

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Completed decode replacements. Successfully decoded ${count} items.`);
