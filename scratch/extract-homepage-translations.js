const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/admin-secure-internal/settings/homepage/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const arDictPath = path.join(__dirname, '../src/lib/i18n/dictionaries/ar.json');
const enDictPath = path.join(__dirname, '../src/lib/i18n/dictionaries/en.json');
const frDictPath = path.join(__dirname, '../src/lib/i18n/dictionaries/fr.json');

let arDict = JSON.parse(fs.readFileSync(arDictPath, 'utf8'));
let enDict = JSON.parse(fs.readFileSync(enDictPath, 'utf8'));
let frDict = JSON.parse(fs.readFileSync(frDictPath, 'utf8'));

if (!arDict.homepage) arDict.homepage = {};
if (!enDict.homepage) enDict.homepage = {};
if (!frDict.homepage) frDict.homepage = {};

const regex = /t\(\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3\s*\)/g;

function toCamelCase(str) {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((word, index) => {
      if (index === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('')
    .slice(0, 40); // limit length
}

let match;
let counter = 1;
const keysMap = {}; // map of ar -> key

// Find all matches and build dictionary
pageContent = pageContent.replace(regex, (fullMatch, q1, arText, q2, enText) => {
  let key = keysMap[arText];
  if (!key) {
    let baseKey = toCamelCase(enText);
    if (!baseKey) baseKey = `key${counter}`;
    
    key = baseKey;
    let suffix = 1;
    while ((arDict.homepage[key] && arDict.homepage[key] !== arText) || 
           (enDict.homepage[key] && enDict.homepage[key] !== enText)) {
      key = `${baseKey}${suffix}`;
      suffix++;
    }
    
    keysMap[arText] = key;
    arDict.homepage[key] = arText;
    enDict.homepage[key] = enText;
    // For french, use english as fallback initially
    frDict.homepage[key] = enText; 
    counter++;
  }

  // return the new translation call
  return `t('homepage.${key}')`;
});

// Write dictionaries
fs.writeFileSync(arDictPath, JSON.stringify(arDict, null, 2), 'utf8');
fs.writeFileSync(enDictPath, JSON.stringify(enDict, null, 2), 'utf8');
fs.writeFileSync(frDictPath, JSON.stringify(frDict, null, 2), 'utf8');

// Also in page.tsx, we need to remove the local `t` definition:
// `const t = (ar: string, en: string) => (isAr ? ar : en);`
pageContent = pageContent.replace(/const t = \(ar: string, en: string\) => \(isAr \? ar : en\);\r?\n?/g, '');
// And make sure `const { t, locale } = useTranslation();` is used instead of just `const { locale } = useTranslation();`
pageContent = pageContent.replace(/const \{ locale \} = useTranslation\(\);/g, 'const { t, locale } = useTranslation();');

fs.writeFileSync(pagePath, pageContent, 'utf8');

console.log(`Processed ${Object.keys(keysMap).length} unique translation strings.`);
