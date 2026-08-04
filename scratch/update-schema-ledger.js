const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Function to replace Float with Decimal in a specific model block
function replaceFloatWithDecimal(modelName, content) {
    const regex = new RegExp(`(model ${modelName} \\{[^\\}]+\\})`, 'g');
    return content.replace(regex, (match) => {
        return match.replace(/Float/g, 'Decimal');
    });
}

schema = replaceFloatWithDecimal('Wallet', schema);
schema = replaceFloatWithDecimal('WalletTransaction', schema);
schema = replaceFloatWithDecimal('Order', schema);
schema = replaceFloatWithDecimal('OrderItem', schema);
schema = replaceFloatWithDecimal('DebtPaymentReceipt', schema);
schema = replaceFloatWithDecimal('LogisticsProfile', schema);
schema = replaceFloatWithDecimal('SellerProfile', schema);

// Add LedgerEntry and LegacyWalletSnapshot at the end of the file
const newModels = `
// ============================================
// FINANCIAL LEDGER SYSTEM
// ============================================

model LedgerEntry {
  id              String   @id @default(cuid())
  amount          Decimal
  type            String   // credit (in), debit (out)
  status          String   @default("cleared") // pending_clearance, cleared
  description     String?
  referenceNumber String?  // For bank transfers, receipts, idempotent keys
  
  orderId         String?
  order           Order?   @relation(fields: [orderId], references: [id])
  
  walletId        String
  wallet          Wallet   @relation(fields: [walletId], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model LegacyWalletSnapshot {
  id              String   @id @default(cuid())
  walletId        String
  userId          String
  balance         Decimal
  pendingBalance  Decimal
  availableBalance Decimal
  debt            Decimal
  totalEarned     Decimal
  snapshotDate    DateTime @default(now())
  notes           String?
}
`;

if (!schema.includes('model LedgerEntry')) {
    schema += newModels;
}

// Add LedgerEntry relation to Wallet
if (!schema.includes('ledgerEntries    LedgerEntry[]')) {
    schema = schema.replace(
        /model Wallet \{([^}]+)\}/, 
        'model Wallet {$1\n  ledgerEntries    LedgerEntry[]\n}'
    );
}

// Add LedgerEntry relation to Order
if (!schema.includes('ledgerEntries   LedgerEntry[]')) {
    schema = schema.replace(
        /model Order \{([^}]+)\}/, 
        'model Order {$1\n  ledgerEntries   LedgerEntry[]\n}'
    );
}

fs.writeFileSync(schemaPath, schema);
console.log('Schema updated successfully');
