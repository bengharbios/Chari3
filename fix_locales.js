const fs = require('fs');
const path = require('path');

const locales = ['ar', 'en', 'fr'];

locales.forEach(lang => {
  const filePath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Move checkout from common to root if it exists
    if (data.common && data.common.checkout) {
      data.checkout = data.common.checkout;
      delete data.common.checkout;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Fixed ${lang}.json: moved checkout to root`);
    } else {
      console.log(`${lang}.json: no checkout in common`);
    }
  }
});
