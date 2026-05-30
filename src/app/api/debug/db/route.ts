import { NextResponse } from 'next/server';

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

  // ── Action: inspect user / db ──
  if (action === 'inspect') {
    const phone = searchParams.get('phone');
    return handleInspect(creds, phone);
  }

  // ── Action: fix user role and status ──
  if (action === 'fix-user') {
    const phone = searchParams.get('phone') || '';
    const role = searchParams.get('role') || 'store_manager';
    const status = searchParams.get('status') || 'active';
    return handleFixUser(creds, phone, role, status);
  }

  // ── Action: create tables (raw SQL fallback) ──
  if (action === 'create-tables') {
    return handleCreateTables(creds);
  }

  // ── Action: sync schema columns ──
  if (action === 'sync-schema') {
    return handleSyncSchema(creds);
  }

  // ── Default: lightweight diagnostic ──
  results.push({
    step: 'Info',
    node: process.version,
    dbUser: creds?.user,
    dbHost: creds?.host,
    dbPort: creds?.port,
    dbName: creds?.db,
    passwordLength: creds?.pass?.length,
    passwordEncoded: originalUrl.includes('%40') ? 'contains %40 (@ encoded)' : 'no encoding',
  });

  if (!creds) {
    return NextResponse.json({ debug: 'Chari3 DB', results, hint: 'DATABASE_URL is not a valid MySQL URL' });
  }

  // ── Phase 1: Try Unix socket paths ──
  const socketPaths = [
    '/tmp/mysql.sock',
    '/var/run/mysqld/mysqld.sock',
    '/var/lib/mysql/mysql.sock',
  ];

  results.push({ step: 'Phase', info: 'Testing Unix socket connections...' });

  let workingMethod: { type: 'socket'; path: string } | { type: 'tcp'; url: string; label: string } | null = null;

  for (const socketPath of socketPaths) {
    try {
      const mysql = await import('mysql2/promise');
      const start = Date.now();
      const conn = await mysql.createConnection({
        user: creds.user,
        password: creds.pass,
        database: creds.db,
        socketPath,
        connectTimeout: 5000,
        enableKeepAlive: false,
      });
      const [rows] = await conn.execute('SELECT VERSION() as ver, DATABASE() as db');
      await conn.end();
      results.push({
        step: `Socket (${socketPath})`,
        status: '✅ OK',
        latency: `${Date.now() - start}ms`,
        data: (rows as Record<string, unknown>[])[0],
      });
      workingMethod = { type: 'socket', path: socketPath };

      // Count existing tables
      const conn2 = await (await import('mysql2/promise')).createConnection({
        user: creds.user,
        password: creds.pass,
        database: creds.db,
        socketPath,
        connectTimeout: 5000,
        multipleStatements: true,
      });
      const [tables] = await conn2.execute('SHOW TABLES');
      const tableList = (tables as Record<string, unknown>[]).map((r) => Object.values(r)[0]);
      await conn2.end();
      results.push({ step: 'Tables', count: tableList.length, tables: tableList });
      break;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        step: `Socket (${socketPath})`,
        status: '❌ FAILED',
        error: msg.substring(0, 200),
      });
    }
  }

  // ── Phase 2: Try TCP connections if socket failed ──
  if (!workingMethod) {
    results.push({ step: 'Phase', info: 'Socket failed. Testing TCP connections...' });

    const tcpHosts = [
      { host: '127.0.0.1', label: '127.0.0.1 (IPv4)' },
      { host: creds.host, label: `${creds.host} (original)` },
    ];
    const seen = new Set<string>();

    for (const { host, label } of tcpHosts) {
      if (seen.has(host)) continue;
      seen.add(host);
      const url = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@${host}:${creds.port}/${creds.db}`;
      try {
        const mysql = await import('mysql2/promise');
        const start = Date.now();
        const conn = await mysql.createConnection({ uri: url, connectTimeout: 5000, enableKeepAlive: false });
        const [rows] = await conn.execute('SELECT VERSION() as ver, DATABASE() as db');
        await conn.end();
        results.push({
          step: `TCP (${label})`,
          status: '✅ OK',
          latency: `${Date.now() - start}ms`,
          data: (rows as Record<string, unknown>[])[0],
        });
        workingMethod = { type: 'tcp', url, label };

        // Count existing tables
        const conn2 = await (await import('mysql2/promise')).createConnection({
          uri: url,
          connectTimeout: 5000,
          multipleStatements: true,
        });
        const [tables] = await conn2.execute('SHOW TABLES');
        const tableList = (tables as Record<string, unknown>[]).map((r) => Object.values(r)[0]);
        await conn2.end();
        results.push({ step: 'Tables', count: tableList.length, tables: tableList });
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({
          step: `TCP (${label})`,
          status: '❌ FAILED',
          error: msg.substring(0, 200),
        });
      }
    }
  }

  if (!workingMethod) {
    return NextResponse.json({
      debug: 'Chari3 DB',
      results,
      hint: 'All connection methods failed. On Hostinger: MySQL user is restricted to Unix socket. Verify password in Hostinger MySQL panel. Try: Reset MySQL password → Update DATABASE_URL.',
      fix: '1. Go to Hostinger → Databases → Click "Change Password" for your MySQL user\n2. Copy the new password\n3. Update DATABASE_URL env var with new password\n4. Redeploy',
    });
  }

  return NextResponse.json({ debug: 'Chari3 DB', results, workingMethod });
}

// ============================================
// Create Tables via Raw SQL (with Unix socket support)
// ============================================

async function handleCreateTables(creds: ReturnType<typeof parseMysqlUrl>) {
  const results: Record<string, unknown>[] = [];

  if (!creds) {
    return NextResponse.json({ action: 'create-tables', results: [{ step: 'Error', msg: 'Invalid DATABASE_URL' }], success: false });
  }

  // Try to establish a working connection
  let workingConn: any = null;
  let connMethod = '';

  // Phase 1: Try Unix socket
  const socketPaths = ['/tmp/mysql.sock', '/var/run/mysqld/mysqld.sock', '/var/lib/mysql/mysql.sock'];

  for (const socketPath of socketPaths) {
    try {
      const mysql = await import('mysql2/promise');
      workingConn = await mysql.createConnection({
        user: creds.user,
        password: creds.pass,
        database: creds.db,
        socketPath,
        connectTimeout: 5000,
        multipleStatements: true,
      });
      connMethod = `Socket: ${socketPath}`;
      break;
    } catch {
      continue;
    }
  }

  // Phase 2: Try TCP
  if (!workingConn) {
    const tcpHosts = [
      { host: '127.0.0.1', label: '127.0.0.1' },
      { host: creds.host, label: creds.host },
    ];
    const seen = new Set<string>();

    for (const { host, label } of tcpHosts) {
      if (seen.has(host)) continue;
      seen.add(host);
      const url = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@${host}:${creds.port}/${creds.db}`;
      try {
        const mysql = await import('mysql2/promise');
        workingConn = await mysql.createConnection({
          uri: url,
          connectTimeout: 5000,
          multipleStatements: true,
        });
        connMethod = `TCP: ${label}`;
        break;
      } catch {
        continue;
      }
    }
  }

  if (!workingConn) {
    return NextResponse.json({
      action: 'create-tables',
      results: [{ step: 'Error', msg: 'Cannot connect to database. Run /api/debug/db?token=chari3-debug first to diagnose.' }],
      success: false,
    });
  }

  results.push({ step: 'Connection', status: '✅ OK', method: connMethod });

  // Create tables
  try {
    const sql = getCreateTablesSql();
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    let created = 0;
    let skipped = 0;
    let errors = 0;
    for (const stmt of statements) {
      try {
        await workingConn.execute(stmt);
        created++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('already exists')) {
          skipped++;
        } else {
          errors++;
          results.push({ step: 'SQL Error', sql: stmt.substring(0, 80), error: msg.substring(0, 120) });
        }
      }
    }

    await workingConn.end();
    results.push({ step: 'Result', created, skipped, errors, total: created + skipped + errors });
    return NextResponse.json({ action: 'create-tables', results, success: errors === 0 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await workingConn.end().catch(() => {});
    return NextResponse.json({ action: 'create-tables', results: [{ step: 'Error', error: msg.substring(0, 300) }], success: false });
  }
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

// ============================================
// Sync Columns via Raw SQL (for database migrations)
// ============================================

async function handleSyncSchema(creds: ReturnType<typeof parseMysqlUrl>) {
  const results: Record<string, unknown>[] = [];

  if (!creds) {
    return NextResponse.json({ action: 'sync-schema', results: [{ step: 'Error', msg: 'Invalid DATABASE_URL' }], success: false });
  }

  let workingConn: any = null;
  let connMethod = '';

  // Phase 1: Try Unix socket
  const socketPaths = ['/tmp/mysql.sock', '/var/run/mysqld/mysqld.sock', '/var/lib/mysql/mysql.sock'];

  for (const socketPath of socketPaths) {
    try {
      const mysql = await import('mysql2/promise');
      workingConn = await mysql.createConnection({
        user: creds.user,
        password: creds.pass,
        database: creds.db,
        socketPath,
        connectTimeout: 5000,
        multipleStatements: true,
      });
      connMethod = `Socket: ${socketPath}`;
      break;
    } catch {
      continue;
    }
  }

  // Phase 2: Try TCP
  if (!workingConn) {
    const tcpHosts = [
      { host: '127.0.0.1', label: '127.0.0.1' },
      { host: creds.host, label: creds.host },
    ];
    const seen = new Set<string>();

    for (const { host, label } of tcpHosts) {
      if (seen.has(host)) continue;
      seen.add(host);
      const url = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@${host}:${creds.port}/${creds.db}`;
      try {
        const mysql = await import('mysql2/promise');
        workingConn = await mysql.createConnection({
          uri: url,
          connectTimeout: 5000,
          multipleStatements: true,
        });
        connMethod = `TCP: ${label}`;
        break;
      } catch {
        continue;
      }
    }
  }

  if (!workingConn) {
    return NextResponse.json({
      action: 'sync-schema',
      results: [{ step: 'Error', msg: 'Cannot connect to database. Run /api/debug/db?token=chari3-debug first to diagnose.' }],
      success: false,
    });
  }

  results.push({ step: 'Connection', status: '✅ OK', method: connMethod });

  // Columns to add
  const alterations = [
    'ALTER TABLE Store ADD COLUMN shippingRates LONGTEXT NULL',
    'ALTER TABLE Store ADD COLUMN shippingIntegrations LONGTEXT NULL',
    'ALTER TABLE Store ADD COLUMN paymentDetails LONGTEXT NULL',
    'ALTER TABLE Store ADD COLUMN themeSettings LONGTEXT NULL',
    'ALTER TABLE SellerProfile ADD COLUMN shippingRates LONGTEXT NULL',
    'ALTER TABLE SellerProfile ADD COLUMN shippingIntegrations LONGTEXT NULL',
    'ALTER TABLE SellerProfile ADD COLUMN paymentDetails LONGTEXT NULL',
    'ALTER TABLE SellerProfile ADD COLUMN themeSettings LONGTEXT NULL',
    'ALTER TABLE Coupon ADD COLUMN storeId VARCHAR(191) NULL',
    'ALTER TABLE Coupon ADD COLUMN sellerId VARCHAR(191) NULL',
  ];

  let applied = 0;
  let skipped = 0;
  let errors = 0;

  for (const sql of alterations) {
    try {
      await workingConn.execute(sql);
      applied++;
      results.push({ step: 'SQL Alteration', sql: sql.substring(0, 60), status: '✅ Success' });
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Duplicate column name') || msg.includes('already exists') || msg.includes('ER_DUP_FIELDNAME') || err.errno === 1060) {
        skipped++;
        results.push({ step: 'SQL Alteration', sql: sql.substring(0, 60), status: 'ℹ️ Already Exists' });
      } else {
        errors++;
        results.push({ step: 'SQL Error', sql: sql.substring(0, 60), error: msg });
      }
    }
  }

  await workingConn.end();
  results.push({ step: 'Result', applied, skipped, errors, total: applied + skipped + errors });
  return NextResponse.json({ action: 'sync-schema', results, success: errors === 0 });
}

// ============================================
// Direct Database helpers for inspection & fixes
// ============================================

async function getDbConnection(creds: ReturnType<typeof parseMysqlUrl>) {
  if (!creds) return null;
  const socketPaths = ['/tmp/mysql.sock', '/var/run/mysqld/mysqld.sock', '/var/lib/mysql/mysql.sock'];
  for (const socketPath of socketPaths) {
    try {
      const mysql = await import('mysql2/promise');
      return await mysql.createConnection({
        user: creds.user,
        password: creds.pass,
        database: creds.db,
        socketPath,
        connectTimeout: 5000,
      });
    } catch {
      continue;
    }
  }
  const tcpHosts = [
    { host: '127.0.0.1' },
    { host: creds.host },
  ];
  const seen = new Set<string>();
  for (const { host } of tcpHosts) {
    if (seen.has(host)) continue;
    seen.add(host);
    const url = `mysql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.pass)}@${host}:${creds.port}/${creds.db}`;
    try {
      const mysql = await import('mysql2/promise');
      return await mysql.createConnection({
        uri: url,
        connectTimeout: 5000,
      });
    } catch {
      continue;
    }
  }
  return null;
}

async function handleInspect(creds: ReturnType<typeof parseMysqlUrl>, phone: string | null) {
  const conn = await getDbConnection(creds);
  if (!conn) {
    return NextResponse.json({ error: 'Cannot connect to database' }, { status: 500 });
  }

  try {
    const results: Record<string, any> = {};

    // 1. Fetch user by phone if provided, otherwise fetch all users
    if (phone) {
      const [users] = await conn.execute('SELECT id, name, email, phone, role, accountStatus, isActive, isVerified FROM User WHERE phone = ?', [phone]);
      results.user = (users as any[])[0] || null;

      if (results.user) {
        const userId = results.user.id;
        // Fetch Store
        const [stores] = await conn.execute('SELECT id, name, slug, isActive, managerId FROM Store WHERE managerId = ?', [userId]);
        results.store = (stores as any[])[0] || null;

        // Fetch SellerProfile
        const [sellerProfiles] = await conn.execute('SELECT id, storeName, isVerified, userId FROM SellerProfile WHERE userId = ?', [userId]);
        results.sellerProfile = (sellerProfiles as any[])[0] || null;
      }
    }

    // 2. Fetch all stores in system to see what exists
    const [allStores] = await conn.execute('SELECT id, name, slug, managerId FROM Store LIMIT 50');
    results.allStores = allStores;

    // 3. Fetch all users count and sample
    const [userCount] = await conn.execute('SELECT COUNT(*) as count FROM User');
    results.totalUsers = (userCount as any[])[0]?.count || 0;
    const [recentUsers] = await conn.execute('SELECT id, name, phone, role, accountStatus FROM User ORDER BY createdAt DESC LIMIT 15');
    results.recentUsers = recentUsers;

    await conn.end();
    return NextResponse.json({ success: true, action: 'inspect', results });
  } catch (err: any) {
    await conn.end();
    return NextResponse.json({ success: false, error: err.message });
  }
}

async function handleFixUser(creds: ReturnType<typeof parseMysqlUrl>, phone: string, role: string, status: string) {
  if (!phone) {
    return NextResponse.json({ error: 'phone parameter is required' }, { status: 400 });
  }

  const conn = await getDbConnection(creds);
  if (!conn) {
    return NextResponse.json({ error: 'Cannot connect to database' }, { status: 500 });
  }

  try {
    const [users] = await conn.execute('SELECT id, name, role, accountStatus FROM User WHERE phone = ?', [phone]);
    const user = (users as any[])[0];

    if (!user) {
      await conn.end();
      return NextResponse.json({ success: false, error: `User with phone ${phone} not found` });
    }

    // Update user role and status
    await conn.execute('UPDATE User SET role = ?, accountStatus = ?, isActive = 1, isVerified = 1, phoneVerified = 1 WHERE id = ?', [role, status, user.id]);

    // Check if seller profile exists, if not create or update it
    const [sellerProfiles] = await conn.execute('SELECT id FROM SellerProfile WHERE userId = ?', [user.id]);
    let sellerProfileId = (sellerProfiles as any[])[0]?.id;
    if (!sellerProfileId) {
      const crypto = await import('crypto');
      sellerProfileId = 'sel_' + crypto.randomBytes(8).toString('hex');
      await conn.execute(
        'INSERT INTO SellerProfile (id, storeName, isVerified, userId, createdAt, updatedAt) VALUES (?, ?, 1, ?, NOW(), NOW())',
        [sellerProfileId, user.name + " Store", user.id]
      );
    } else {
      await conn.execute('UPDATE SellerProfile SET isVerified = 1 WHERE id = ?', [sellerProfileId]);
    }

    // Check if store exists for this user
    const [stores] = await conn.execute('SELECT id FROM Store WHERE managerId = ?', [user.id]);
    let storeId = (stores as any[])[0]?.id;
    if (!storeId) {
      const crypto = await import('crypto');
      storeId = 'st_' + crypto.randomBytes(8).toString('hex');
      const slug = 'store-' + user.id.substring(0, 8);
      await conn.execute(
        'INSERT INTO Store (id, name, slug, isActive, managerId, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, NOW(), NOW())',
        [storeId, user.name + " Store", slug, user.id]
      );
    } else {
      await conn.execute('UPDATE Store SET isActive = 1 WHERE id = ?', [storeId]);
    }

    await conn.end();
    return NextResponse.json({
      success: true,
      action: 'fix-user',
      message: `Successfully set user ${user.name} (${phone}) to role ${role} and status ${status}, verified their seller profile and store.`,
      userId: user.id,
      storeId,
      sellerProfileId
    });
  } catch (err: any) {
    await conn.end();
    return NextResponse.json({ success: false, error: err.message });
  }
}

