const fs = require('fs');

const schema = fs.readFileSync('c:\\Users\\ALsalam - Marketing\\Desktop\\ChariDay\\prisma\\schema.prisma', 'utf8');

function printModel(modelName) {
  const regex = new RegExp(`model\\s+${modelName}\\s+\\{([^}]+)\\}`, 'i');
  const match = schema.match(regex);
  if (match) {
    console.log(`--- Model ${modelName} ---`);
    console.log(match[0]);
  } else {
    console.log(`Model ${modelName} not found`);
  }
}

printModel('StoreStaff');
