const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'ar.json');
const enPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'en.json');
const frPath = path.join(__dirname, 'src', 'lib', 'i18n', 'dictionaries', 'fr.json');

let ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));
let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Common additions
const addCommon = (dict, prev, next, page, active, expired, rows) => {
  if (!dict.common) dict.common = {};
  dict.common.previous = prev;
  dict.common.next = next;
  dict.common.page = page;
  dict.common.active = active;
  dict.common.expired = expired;
  dict.common.rows_per_page = rows;
};

addCommon(ar, "السابق", "التالي", "صفحة", "نشط", "منتهي", "الصفوف لكل صفحة:");
addCommon(en, "Previous", "Next", "Page", "Active", "Expired", "Rows per page:");
addCommon(fr, "Précédent", "Suivant", "Page", "Actif", "Expiré", "Lignes par page:");

// Security additions to FR
if (!fr.security) fr.security = {};
fr.security.method_all = "Toutes les méthodes";
fr.security.col_method = "Méthode";
fr.security.col_location = "Emplacement";
fr.security.col_ip = "IP";
fr.security.col_identifier = "Identifiant";

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), 'utf8');

console.log('Translations patched completely.');
