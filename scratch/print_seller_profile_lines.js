const fs = require('fs');
const lines = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\prisma\\schema.prisma', 'utf8').split('\n');

for (let i = 135; i < 185; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
