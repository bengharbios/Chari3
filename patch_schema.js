const fs = require("fs");
let content = fs.readFileSync("prisma/schema.prisma", "utf8");

content = content.replace(
  /isSystem\s+Boolean\s+@default\(false\)[^\r\n]*\r?\n\s*sortOrder/,
  "isSystem    Boolean  @default(false) // System roles cannot be deleted\n  targetEntity String  @default(\"SELLER\") // SELLER, SUPPLIER, LOGISTICS, ADMIN\n  sortOrder"
);

content = content.replace(
  /completionRate\s+Float\s+@default\(100\)[^\r\n]*\r?\n\s*responseRate/,
  "completionRate      Float     @default(100) // %\n  cancellationRate    Float     @default(0)   // % (To track COD leakage)\n  returnRate          Float     @default(0)   // % (To track COD leakage)\n  responseRate"
);

content = content.replace(
  /\/\/\s*AUDIT LOG\r?\n\/\/\s*={10,}\r?\n\r?\nmodel AuditLog/,
  "// AUDIT LOG (IMMUTABLE - APPEND ONLY)\n// ============================================\n\nmodel AuditLog"
);

fs.writeFileSync("prisma/schema.prisma", content);
console.log("Schema patched successfully!");

