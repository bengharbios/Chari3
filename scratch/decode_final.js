const fs = require('fs');
const path = require('path');

// CP850 byte representation for unique unicode characters found in the mojibake
const cp850Map = {
  '\u256a': 0xD8, // ╪
  '\u2518': 0xD9, // ┘
  '\u00ba': 0xA7, // º
  '\u00e4': 0x84, // ä
  '\u00e2': 0x83, // â
  '\u00e0': 0x85, // à
  '\u00bb': 0xAF, // »
  '\u00e8': 0x8A, // è
  '\u2592': 0xB1, // ▒
  '\u2524': 0xB4, // ┤
  '\u00ac': 0xAA, // ¬
  '\u00bc': 0xAC, // ¼
  '\u2502': 0xB3, // │
  '\u00e9': 0x82, // é
  '\u00ea': 0x88, // ê
  '\u00e5': 0x86, // å
  '\u00bf': 0xA8, // ¿
  '\u00a1': 0xAD, // ¡
  '\u2555': 0xB8, // ╕
  '\u2556': 0xB7, // ╖
  '\u2563': 0xB9, // ╣
  '\u00e6': 0x91, // æ
  '\u2310': 0xA9, // ⌐
  '\u2551': 0xBA, // ║
  '\u00fc': 0x81, // ü
  '\u2562': 0xB6, // ╢
  '\u00bd': 0xAB, // ½
  '\u0393': 0xE2, // Γ
  '\u00c7': 0x80, // Ç
  '\u00f6': 0x94, // ö
  '\u2591': 0xB0, // ░
  '\u00d1': 0xA5, // Ñ
  '\u00ab': 0xAE, // «
  '\u2561': 0xB5, // ╡
  '\u00e7': 0x87, // ç
  '\u00ee': 0x8C, // î
  '\u00ed': 0x8D, // í
  '\u00aa': 0xA6, // ª
  '\u00fa': 0xA3, // ú
  '\u00f4': 0x93, // ô
  '\u00f3': 0x95, // ó
  '\u2593': 0xB2, // ▓
  '\u00f1': 0xA4, // ñ
  '\u00eb': 0x89, // ë
  '\u00c6': 0x92, // Æ
  '\u00ef': 0x8B, // ï
  '\u2261': 0xF0, // ≡
  '\u0192': 0x9F, // ƒ
  '\u251c': 0xC3, // ├
  '\u00c5': 0x8F, // Å
  '\u20a7': 0x9E, // ₧
  '\u00f2': 0x95  // ò
};

function decodeMojibake(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (cp850Map[char] !== undefined) {
      bytes.push(cp850Map[char]);
    } else {
      const code = char.charCodeAt(0);
      if (code < 128) {
        bytes.push(code);
      } else {
        const buf = Buffer.from(char, 'utf8');
        for (const b of buf) {
          bytes.push(b);
        }
      }
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

const filePath = path.join(__dirname, '../src/components/admin/UserManagementPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Match any single-quoted string containing Mojibake characters
// We match '...' where the content has at least one of CP850 characters
const singleQuoteRegex = /'([^'\\]*(?:\\.[^'\\]*)*)'/g;
const doubleQuoteRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;

let count = 0;
content = content.replace(singleQuoteRegex, (match, text) => {
  if (/[╪┘ºäâà»è▒┤¬¼│éêå¿¡╕╖╣æ⌐║ü╢½ΓÇö░Ñ«╡çîíªúôó▓ñëÆï≡ƒ├Å₧ò]/.test(text)) {
    const decoded = decodeMojibake(text);
    console.log(`Decoding Single: '${text}' -> '${decoded}'`);
    count++;
    return `'${decoded}'`;
  }
  return match;
});

content = content.replace(doubleQuoteRegex, (match, text) => {
  if (/[╪┘ºäâà»è▒┤¬¼│éêå¿¡╕╖╣æ⌐║ü╢½ΓÇö░Ñ«╡çîíªúôó▓ñëÆï≡ƒ├Å₧ò]/.test(text)) {
    const decoded = decodeMojibake(text);
    console.log(`Decoding Double: "${text}" -> "${decoded}"`);
    count++;
    return `"${decoded}"`;
  }
  return match;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully replaced all ${count} string literals in UserManagementPage.tsx!`);
