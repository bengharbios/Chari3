const fs = require('fs');
const schema = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\prisma\\schema.prisma', 'utf8');

const regex = /model\s+SellerProfile\s+\{([^}]+)\}/i;
const match = schema.match(regex);
if (match) {
  console.log(match[0]);
} else {
  console.log('SellerProfile model not found');
}
