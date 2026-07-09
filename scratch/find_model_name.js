const fs = require('fs');
const schema = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\prisma\\schema.prisma', 'utf8');
const lines = schema.split('\n');

for (let i = 260; i >= 0; i--) {
  if (lines[i].trim().startsWith('model ')) {
    console.log(`Model starting at line ${i + 1}: ${lines[i].trim()}`);
    break;
  }
}
