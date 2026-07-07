const fs = require('fs');
const path = require('path');

// CP850 character to byte map for corrupted characters
const cp850Map = {
  '╪': 0xD8,
  'Ñ': 0xA5,
  '»': 0xAF,
  'º': 0xA7,
  '┘': 0xD9,
  'ä': 0x84,
  'â': 0x83,
  '▒': 0xB1,
  'è': 0x8A,
  'å': 0x86,
  '½': 0xAB,
  '╣': 0xB9,
  '⌐': 0xA9,
  '│': 0xB3,
  '¼': 0xAC,
  '╢': 0xC6,
  'æ': 0x91,
  'ç': 0x87,
  '┬': 0xC2,
  '£': 0x9C,
  '¢': 0x9B,
  '┐': 0xBF,
  '═': 0xCD,
  '╗': 0xBB,
  '─': 0xC4,
  'á': 0xA0,
  'í': 0xA1,
  'ó': 0xA2,
  'ú': 0xA3,
  'ñ': 0xA4,
  '¿': 0xA8,
  '░': 0xB0,
  '▓': 0xB2,
  '┤': 0xB4,
  '╡': 0xB5,
  '╢': 0xB6,
  '╖': 0xB7,
  '╕': 0xB8,
  '║': 0xBA,
  '╝': 0xBC,
  '╜': 0xBD,
  '╛': 0xBE,
  '└': 0xC0,
  '┴': 0xC1,
  '├': 0xC3,
  '┼': 0xC5,
  '╞': 0xC6,
  '╟': 0xC7,
  '╚': 0xC8,
  '╔': 0xC9,
  '╩': 0xCA,
  '╦': 0xCB,
  '╠': 0xCC,
  '╬': 0xCE,
  '╧': 0xCF,
  '╨': 0xD0,
  '╤': 0xD1,
  '╥': 0xD2,
  '╙': 0xD3,
  '╘': 0xD4,
  '╒': 0xD5,
  '╓': 0xD6,
  '╫': 0xD7,
  '┘': 0xD9,
  '┌': 0xDA,
  '█': 0xDB,
  '▄': 0xDC,
  '▌': 0xDD,
  '▐': 0xDE,
  '▀': 0xDF
};

// Function to decode a string that was incorrectly parsed as CP850 back to UTF-8
function decodeCP850(str) {
  let bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (cp850Map[char] !== undefined) {
      bytes.push(cp850Map[char]);
    } else {
      // If it's a standard ASCII character, push its char code
      const code = char.charCodeAt(0);
      if (code < 128) {
        bytes.push(code);
      } else {
        // Fallback for characters not in map, encode back to UTF-8 bytes to preserve
        const buf = Buffer.from(char, 'utf8');
        for (let j = 0; j < buf.length; j++) {
          bytes.push(buf[j]);
        }
      }
    }
  }
  return Buffer.from(bytes).toString('utf8');
}

// Test the decoder with: ╪º┘ä┘â┘ä
const testStr = "╪º┘ä┘â┘ä";
console.log('Test decoding for "╪º┘ä┘â┘ä":', decodeCP850(testStr)); // Expected: الكل

// If the test passes, let's repair the files
const targetFile = path.join(__dirname, '../src/components/admin/UserManagementPage.tsx');
const onboardingFile = path.join(__dirname, '../src/components/onboarding/OnboardingWizard.tsx');

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  console.log(`Processing file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regular expression to match mojibake patterns containing CP850 characters
  // Arabic characters in UTF-8 typically start with \xd8 (╪) or \xd9 (┘) or \xda (┌)
  const mojibakeRegex = /[╪┘┌][ºäâ▒èå½╣⌐│¼╢æç┬£¢┐═╗─\x80-\xff]+/g;
  
  const fixedContent = content.replace(mojibakeRegex, (match) => {
    const decoded = decodeCP850(match);
    console.log(`Decoded: "${match}" -> "${decoded}"`);
    return decoded;
  });
  
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log(`Fixed file saved successfully!`);
}

fixFile(targetFile);
fixFile(onboardingFile);
