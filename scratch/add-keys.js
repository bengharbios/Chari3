const fs = require('fs');
const addKey = (file, val) => {
  let data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.storefront) data.storefront = {};
  if (!data.storefront.product) data.storefront.product = {};
  data.storefront.product.new_arrival = val;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};
addKey('src/lib/i18n/dictionaries/ar.json', 'وصل حديثاً');
addKey('src/lib/i18n/dictionaries/en.json', 'New Arrival');
addKey('src/lib/i18n/dictionaries/fr.json', 'Nouveau');
console.log('Added translation keys successfully.');
