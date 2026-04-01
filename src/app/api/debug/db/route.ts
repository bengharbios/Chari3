import { NextResponse } from 'next/server';
import { ensureDbConnection, getDbInfo } from '@/lib/db';

const DEBUG_TOKEN = 'chari3-debug';

function parseMysqlUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      user: decodeURIComponent(u.username),
      pass: decodeURIComponent(u.password),
      host: u.hostname,
      port: u.port || '3306',
      db: u.pathname.slice(1),
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (token !== DEBUG_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const originalUrl = process.env.DATABASE_URL || '';
  const creds = parseMysqlUrl(originalUrl);
  const results: Record<string, unknown>[] = [];

  // ── Action: push schema ──
  if (action === 'push-schema') {
    return handlePushSchema(originalUrl, creds);
  }

  // ── Action: create tables (raw SQL fallback) ──
  if (action === 'create-tables') {
    return handleCreateTables(originalUrl, creds);
  }

  // ── Default: lightweight diagnostic ──
  results.push({
    step: 'Info',
    node: process.version,
    dbUser: creds?.user,
    dbHost: creds?.host,
    dbPort: creds?.port,
    dbName: creds?.db,
    dbWorkingHost: getDbInfo().workingHost,
  });

  // Quick connection test — just localhost (fastest)
  if (creds) {
    const url = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@localhost:${creds.port}/${creds.db}?connect_timeout=5`;
    try {
      const mysql = await import('mysql2/promise');
      const start = Date.now();
      const conn = await mysql.createConnection({ uri: url, connectTimeout: 5000 });
      const [rows] = await conn.execute('SELECT VERSION() as ver, DATABASE() as db');
      await conn.end();
      results.push({
        step: 'Connection (localhost)',
        status: '✅ OK',
        latency: `${Date.now() - start}ms`,
        data: (rows as Record<string, unknown>[])[0],
      });

      // Count existing tables
      const conn2 = await mysql.createConnection({ uri: url, connectTimeout: 5000 });
      const [tables] = await conn2.execute('SHOW TABLES');
      const tableList = (tables as Record<string, unknown>[]).map((r) => Object.values(r)[0]);
      await conn2.end();
      results.push({
        step: 'Tables',
        count: tableList.length,
        tables: tableList,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        step: 'Connection (localhost)',
        status: '❌ FAILED',
        error: msg.substring(0, 200),
      });
    }
  }

  // Prisma client test
  try {
    const ok = await ensureDbConnection();
    results.push({ step: 'Prisma Client', status: ok ? '✅ OK' : '❌ FAILED' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step: 'Prisma Client', status: '❌ FAILED', error: msg.substring(0, 200) });
  }

  return NextResponse.json({ debug: 'Chari3 DB', results });
}

// ============================================
// Push Schema via Prisma CLI
// ============================================

async function handlePushSchema(originalUrl: string, creds: ReturnType<typeof parseMysqlUrl>) {
  const results: Record<string, unknown>[] = [];

  // Step 1: Test connection with localhost
  if (creds) {
    const url = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@localhost:${creds.port}/${creds.db}?connect_timeout=5`;
    try {
      const mysql = await import('mysql2/promise');
      const conn = await mysql.createConnection({ uri: url, connectTimeout: 5000 });
      await conn.execute('SELECT 1');
      await conn.end();
      results.push({ step: 'Connection', status: '✅ OK', host: 'localhost' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ step: 'Connection', status: '❌ FAILED', error: msg.substring(0, 200) });
      return NextResponse.json({ action: 'push-schema', results, success: false });
    }
  }

  // Step 2: Run prisma db push via node
  try {
    const { execSync } = await import('child_process');
    const path = await import('path');

    const prismaBin = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');
    const nodeBin = process.execPath;

    // Make sure schema.prisma exists (it should from build)
    const fs = await import('fs/promises');
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const mysqlSchemaPath = path.join(process.cwd(), 'prisma', 'schema.mysql.prisma');

    if (!(await fs.stat(schemaPath).catch(() => null))) {
      // Copy mysql schema if schema.prisma doesn't exist
      if (await fs.stat(mysqlSchemaPath).catch(() => null)) {
        await fs.copyFile(mysqlSchemaPath, schemaPath);
        results.push({ step: 'Schema', status: 'Copied schema.mysql.prisma → schema.prisma' });
      } else {
        results.push({ step: 'Schema', status: '❌ Neither schema.prisma nor schema.mysql.prisma found' });
        return NextResponse.json({ action: 'push-schema', results, success: false });
      }
    }

    // Ensure schema is the MySQL version
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    if (!schemaContent.includes('provider = "mysql"')) {
      await fs.copyFile(mysqlSchemaPath, schemaPath);
      results.push({ step: 'Schema', status: 'Replaced with MySQL schema' });
    }

    const cmd = `"${nodeBin}" "${prismaBin}" db push --skip-generate --accept-data-loss`;
    const output = execSync(cmd, {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: originalUrl },
      timeout: 90000,
      encoding: 'utf-8',
      stdio: 'pipe',
    });

    results.push({ step: 'prisma db push', status: '✅ OK', output: output.substring(0, 500) });
    return NextResponse.json({ action: 'push-schema', results, success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({
      step: 'prisma db push',
      status: '❌ FAILED',
      error: msg.substring(0, 500),
      hint: 'Try /api/debug/db?token=chari3-debug&action=create-tables instead',
    });
    return NextResponse.json({ action: 'push-schema', results, success: false });
  }
}

// ============================================
// Create Tables via Raw SQL (fallback)
// ============================================

async function handleCreateTables(originalUrl: string, creds: ReturnType<typeof parseMysqlUrl>) {
  const results: Record<string, unknown>[] = [];

  // Test connection first
  if (creds) {
    const url = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@localhost:${creds.port}/${creds.db}?connect_timeout=5`;
    try {
      const mysql = await import('mysql2/promise');
      const conn = await mysql.createConnection({
        uri: url,
        connectTimeout: 5000,
        multipleStatements: true,
      });
      results.push({ step: 'Connection', status: '✅ OK' });

      // Create tables using raw SQL
      const sql = getCreateTablesSql();
      const statements = sql.split(';').filter(s => s.trim().length > 0);

      let created = 0;
      let skipped = 0;
      for (const stmt of statements) {
        try {
          await conn.execute(stmt);
          created++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes('already exists')) {
            skipped++;
          } else {
            results.push({ step: 'SQL Error', sql: stmt.substring(0, 100), error: msg.substring(0, 150) });
          }
        }
      }

      await conn.end();
      results.push({ step: 'Tables', created, skipped, total: created + skipped });
      return NextResponse.json({ action: 'create-tables', results, success: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ step: 'Connection', status: '❌ FAILED', error: msg.substring(0, 200) });
      return NextResponse.json({ action: 'create-tables', results, success: false });
    }
  }

  return NextResponse.json({ action: 'create-tables', results, success: false });
}

function getCreateTablesSql(): string {
  return `
CREATE TABLE IF NOT EXISTS Role (
  id VARCHAR(191) PRIMARY KEY,
  key VARCHAR(191) NOT NULL,
  nameAr VARCHAR(191) NOT NULL,
  nameEn VARCHAR(191) NOT NULL,
  descriptionAr TEXT,
  descriptionEn TEXT,
  color VARCHAR(191) DEFAULT '#6B7280',
  icon VARCHAR(191) DEFAULT 'UserCircle',
  permissions TEXT DEFAULT '[]',
  isSystem BOOLEAN DEFAULT FALSE,
  sortOrder INT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX Role_key_key (key)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS User (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(191),
  password VARCHAR(191),
  name VARCHAR(191) NOT NULL,
  nameEn VARCHAR(191),
  avatar VARCHAR(191),
  role VARCHAR(191) DEFAULT 'buyer',
  accountStatus VARCHAR(191) DEFAULT 'incomplete',
  isActive BOOLEAN DEFAULT TRUE,
  isVerified BOOLEAN DEFAULT FALSE,
  phoneVerified BOOLEAN DEFAULT FALSE,
  emailVerified BOOLEAN DEFAULT FALSE,
  locale VARCHAR(191) DEFAULT 'ar',
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX User_email_key (email),
  UNIQUE INDEX User_phone_key (phone)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SellerProfile (
  id VARCHAR(191) PRIMARY KEY,
  storeName VARCHAR(191),
  storeNameEn VARCHAR(191),
  bio TEXT,
  rating FLOAT DEFAULT 0,
  totalSales INT DEFAULT 0,
  isVerified BOOLEAN DEFAULT FALSE,
  wantsUpgrade BOOLEAN DEFAULT FALSE,
  upgradeRequestedAt DATETIME(3),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  UNIQUE INDEX SellerProfile_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LogisticsProfile (
  id VARCHAR(191) PRIMARY KEY,
  vehicleType VARCHAR(191) DEFAULT 'motorcycle',
  plateNumber VARCHAR(191),
  licenseNumber VARCHAR(191),
  isOnline BOOLEAN DEFAULT FALSE,
  currentLat FLOAT,
  currentLng FLOAT,
  rating FLOAT DEFAULT 0,
  totalDeliveries INT DEFAULT 0,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  UNIQUE INDEX LogisticsProfile_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BuyerProfile (
  id VARCHAR(191) PRIMARY KEY,
  totalOrders INT DEFAULT 0,
  totalSpent FLOAT DEFAULT 0,
  loyaltyPoints INT DEFAULT 0,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  UNIQUE INDEX BuyerProfile_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Wallet (
  id VARCHAR(191) PRIMARY KEY,
  balance FLOAT DEFAULT 0,
  totalEarned FLOAT DEFAULT 0,
  totalSpent FLOAT DEFAULT 0,
  currency VARCHAR(191) DEFAULT 'DZD',
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  UNIQUE INDEX Wallet_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Category (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  nameEn VARCHAR(191),
  slug VARCHAR(191) NOT NULL,
  icon VARCHAR(191),
  image VARCHAR(191),
  parentId VARCHAR(191),
  sortOrder INT DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX Category_slug_key (slug),
  INDEX Category_parentId_idx (parentId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Store (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  nameEn VARCHAR(191),
  slug VARCHAR(191) NOT NULL,
  description TEXT,
  logo VARCHAR(191),
  coverImage VARCHAR(191),
  isActive BOOLEAN DEFAULT TRUE,
  rating FLOAT DEFAULT 0,
  totalSales INT DEFAULT 0,
  commission FLOAT DEFAULT 10,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  managerId VARCHAR(191) NOT NULL,
  UNIQUE INDEX Store_slug_key (slug),
  UNIQUE INDEX Store_managerId_key (managerId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS StoreStaff (
  id VARCHAR(191) PRIMARY KEY,
  role VARCHAR(191) DEFAULT 'staff',
  joinedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  storeId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  UNIQUE INDEX StoreStaff_storeId_userId_key (storeId, userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Brand (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  nameEn VARCHAR(191),
  logo VARCHAR(191),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Product (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  nameEn VARCHAR(191),
  slug VARCHAR(191) NOT NULL,
  description TEXT,
  descriptionEn TEXT,
  price FLOAT NOT NULL,
  comparePrice FLOAT,
  costPrice FLOAT,
  sku VARCHAR(191),
  barcode VARCHAR(191),
  images TEXT DEFAULT '[]',
  videoUrl VARCHAR(191),
  specifications TEXT DEFAULT '{}',
  status VARCHAR(191) DEFAULT 'draft',
  stock INT DEFAULT 0,
  lowStock INT DEFAULT 5,
  weight FLOAT,
  dimensions TEXT,
  rating FLOAT DEFAULT 0,
  reviewCount INT DEFAULT 0,
  soldCount INT DEFAULT 0,
  viewCount INT DEFAULT 0,
  isFeatured BOOLEAN DEFAULT FALSE,
  brandId VARCHAR(191),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  categoryId VARCHAR(191) NOT NULL,
  storeId VARCHAR(191),
  sellerId VARCHAR(191),
  UNIQUE INDEX Product_slug_key (slug),
  INDEX Product_categoryId_idx (categoryId),
  INDEX Product_storeId_idx (storeId),
  INDEX Product_sellerId_idx (sellerId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`Order\` (
  id VARCHAR(191) PRIMARY KEY,
  orderNumber VARCHAR(191) NOT NULL,
  status VARCHAR(191) DEFAULT 'pending',
  paymentStatus VARCHAR(191) DEFAULT 'pending',
  paymentMethod VARCHAR(191) DEFAULT 'cod',
  subtotal FLOAT NOT NULL,
  shippingCost FLOAT DEFAULT 0,
  tax FLOAT DEFAULT 0,
  discount FLOAT DEFAULT 0,
  total FLOAT NOT NULL,
  currency VARCHAR(191) DEFAULT 'DZD',
  note TEXT,
  address TEXT NOT NULL,
  couponId VARCHAR(191),
  shippingMethod VARCHAR(191) DEFAULT 'standard',
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  buyerId VARCHAR(191) NOT NULL,
  UNIQUE INDEX Order_orderNumber_key (orderNumber),
  INDEX Order_buyerId_idx (buyerId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS OrderItem (
  id VARCHAR(191) PRIMARY KEY,
  orderId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  productName VARCHAR(191) NOT NULL,
  productImage VARCHAR(191),
  price FLOAT NOT NULL,
  quantity INT NOT NULL,
  total FLOAT NOT NULL,
  INDEX OrderItem_orderId_idx (orderId),
  INDEX OrderItem_productId_idx (productId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Shipment (
  id VARCHAR(191) PRIMARY KEY,
  trackingNumber VARCHAR(191) NOT NULL,
  status VARCHAR(191) DEFAULT 'pending',
  pickupAddress TEXT,
  deliveryAddress TEXT NOT NULL,
  notes TEXT,
  estimatedDelivery DATETIME(3),
  actualDelivery DATETIME(3),
  pickedUpAt DATETIME(3),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  orderId VARCHAR(191) NOT NULL,
  logisticsId VARCHAR(191) NOT NULL,
  UNIQUE INDEX Shipment_trackingNumber_key (trackingNumber),
  INDEX Shipment_orderId_idx (orderId),
  INDEX Shipment_logisticsId_idx (logisticsId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ShipmentStatusHistory (
  id VARCHAR(191) PRIMARY KEY,
  status VARCHAR(191) NOT NULL,
  location VARCHAR(191),
  note TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  shipmentId VARCHAR(191) NOT NULL,
  INDEX ShipmentStatusHistory_shipmentId_idx (shipmentId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS OrderStatusHistory (
  id VARCHAR(191) PRIMARY KEY,
  status VARCHAR(191) NOT NULL,
  note TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  orderId VARCHAR(191) NOT NULL,
  INDEX OrderStatusHistory_orderId_idx (orderId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Address (
  id VARCHAR(191) PRIMARY KEY,
  label VARCHAR(191),
  fullName VARCHAR(191) NOT NULL,
  phone VARCHAR(191) NOT NULL,
  street VARCHAR(191) NOT NULL,
  city VARCHAR(191) NOT NULL,
  state VARCHAR(191),
  zipCode VARCHAR(191),
  country VARCHAR(191) DEFAULT 'DZ',
  isDefault BOOLEAN DEFAULT FALSE,
  lat FLOAT,
  lng FLOAT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  INDEX Address_userId_idx (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS WalletTransaction (
  id VARCHAR(191) PRIMARY KEY,
  type VARCHAR(191) NOT NULL,
  amount FLOAT NOT NULL,
  balance FLOAT NOT NULL,
  description TEXT,
  referenceId VARCHAR(191),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  walletId VARCHAR(191) NOT NULL,
  INDEX WalletTransaction_walletId_idx (walletId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Review (
  id VARCHAR(191) PRIMARY KEY,
  rating INT NOT NULL,
  title VARCHAR(191),
  comment TEXT,
  images TEXT DEFAULT '[]',
  isApproved BOOLEAN DEFAULT FALSE,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  orderId VARCHAR(191),
  INDEX Review_userId_idx (userId),
  INDEX Review_productId_idx (productId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS WishlistItem (
  id VARCHAR(191) PRIMARY KEY,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  buyerProfileId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  UNIQUE INDEX WishlistItem_buyerProfileId_productId_key (buyerProfileId, productId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Notification (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  titleEn VARCHAR(191),
  body TEXT NOT NULL,
  bodyEn TEXT,
  type VARCHAR(191) NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  data TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  INDEX Notification_userId_idx (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Coupon (
  id VARCHAR(191) PRIMARY KEY,
  code VARCHAR(191) NOT NULL,
  type VARCHAR(191) DEFAULT 'percentage',
  value FLOAT NOT NULL,
  minOrder FLOAT,
  maxDiscount FLOAT,
  usageLimit INT,
  usedCount INT DEFAULT 0,
  startsAt DATETIME(3),
  expiresAt DATETIME(3),
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX Coupon_code_key (code)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Setting (
  id VARCHAR(191) PRIMARY KEY,
  \`key\` VARCHAR(191) NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(191) DEFAULT 'string',
  \`group\` VARCHAR(191) DEFAULT 'general',
  UNIQUE INDEX Setting_key_key (\`key\`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS StoreVerification (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  commercialRegisterNumber VARCHAR(191),
  commercialRegisterFile LONGTEXT,
  iban VARCHAR(191),
  beneficiaryName VARCHAR(191),
  bankLetterFile LONGTEXT,
  managerIdFront LONGTEXT,
  managerIdBack LONGTEXT,
  verificationStatus VARCHAR(191) DEFAULT 'pending',
  rejectionReasons TEXT,
  adminNotes TEXT,
  reviewedBy VARCHAR(191),
  reviewedAt DATETIME(3),
  submittedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX StoreVerification_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS FreelancerVerification (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  freelanceDocFile LONGTEXT,
  nationalIdFront LONGTEXT,
  nationalIdBack LONGTEXT,
  selfieUrls LONGTEXT,
  livenessScore FLOAT,
  iban VARCHAR(191),
  verificationStatus VARCHAR(191) DEFAULT 'pending',
  rejectionReasons TEXT,
  adminNotes TEXT,
  reviewedBy VARCHAR(191),
  reviewedAt DATETIME(3),
  submittedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX FreelancerVerification_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS SupplierVerification (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  commercialLicense LONGTEXT,
  importLicense LONGTEXT,
  iban VARCHAR(191),
  productSamples TEXT DEFAULT '[]',
  verificationStatus VARCHAR(191) DEFAULT 'pending',
  rejectionReasons TEXT,
  adminNotes TEXT,
  reviewedBy VARCHAR(191),
  reviewedAt DATETIME(3),
  submittedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX SupplierVerification_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS LogisticsVerification (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  transportLicenseFile LONGTEXT,
  insuranceCertificateFile LONGTEXT,
  numberOfVehicles VARCHAR(191),
  numberOfDrivers VARCHAR(191),
  iban VARCHAR(191),
  verificationStatus VARCHAR(191) DEFAULT 'pending',
  rejectionReasons TEXT,
  adminNotes TEXT,
  reviewedBy VARCHAR(191),
  reviewedAt DATETIME(3),
  submittedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX LogisticsVerification_userId_key (userId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS AuditLog (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  roleId VARCHAR(191),
  adminId VARCHAR(191),
  action VARCHAR(191) NOT NULL,
  details TEXT,
  ipAddress VARCHAR(191),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  INDEX AuditLog_userId_idx (userId),
  INDEX AuditLog_roleId_idx (roleId)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;
}
