const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Load environment variables manually
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = (match[2] || '').trim();
          if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.warn('Error loading .env file:', e);
  }
}

loadEnv();

function parseMysqlUrl(url) {
  try {
    const u = new URL(url);
    return {
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      host: u.hostname,
      port: u.port || '3306',
      database: u.pathname.slice(1),
    };
  } catch {
    return null;
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set!');
    return;
  }

  const creds = parseMysqlUrl(dbUrl);
  if (!creds) {
    console.error('Could not parse DATABASE_URL!');
    return;
  }

  // Set up connection details (with TCP as standard local testing since we are running on local dev PC)
  const conn = await mysql.createConnection({
    host: creds.host === 'localhost' ? '127.0.0.1' : creds.host,
    port: Number(creds.port),
    user: creds.user,
    password: creds.password,
    database: creds.database,
  });

  console.log('Connected to MySQL successfully!');
  const productId = 'cmp9wj2wi001c41dju01c54lw';

  // Query product columns
  const [rows] = await conn.execute(
    'SELECT * FROM Product WHERE id = ?',
    [productId]
  );

  if (rows.length === 0) {
    console.log(`Product with ID ${productId} not found!`);
  } else {
    console.log('--- PRODUCT DETAIL IN DB ---');
    console.log(JSON.stringify(rows[0], null, 2));
  }

  await conn.end();
}

main().catch(err => console.error(err));
