const { Client } = require('ssh2');

const conn = new Client();

const sql = `
CREATE TABLE IF NOT EXISTS \`Session\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`token\` VARCHAR(191) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL,
    \`updatedAt\` DATETIME(3) NOT NULL,
    \`ipAddress\` VARCHAR(191) NULL,
    \`userAgent\` VARCHAR(191) NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    UNIQUE INDEX \`Session_token_key\`(\`token\`),
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`Account\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`accountId\` VARCHAR(191) NOT NULL,
    \`providerId\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`accessToken\` TEXT NULL,
    \`refreshToken\` TEXT NULL,
    \`idToken\` TEXT NULL,
    \`accessTokenExpiresAt\` DATETIME(3) NULL,
    \`refreshTokenExpiresAt\` DATETIME(3) NULL,
    \`scope\` VARCHAR(191) NULL,
    \`password\` VARCHAR(191) NULL,
    \`createdAt\` DATETIME(3) NOT NULL,
    \`updatedAt\` DATETIME(3) NOT NULL,
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`Verification\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`identifier\` VARCHAR(191) NOT NULL,
    \`value\` VARCHAR(191) NOT NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`createdAt\` DATETIME(3) NULL,
    \`updatedAt\` DATETIME(3) NULL,
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`TwoFactor\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`secret\` VARCHAR(191) NOT NULL,
    \`backupCodes\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`AuthLog\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`identifier\` VARCHAR(191) NOT NULL,
    \`method\` VARCHAR(191) NOT NULL,
    \`ipAddress\` VARCHAR(191) NULL,
    \`userAgent\` LONGTEXT NULL,
    \`countryCode\` VARCHAR(191) NULL,
    \`deviceType\` VARCHAR(191) NULL,
    \`deviceFingerprint\` VARCHAR(191) NULL,
    \`status\` VARCHAR(191) NOT NULL,
    \`isBanned\` BOOLEAN NOT NULL DEFAULT false,
    \`banReason\` VARCHAR(191) NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`BannedEntity\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`type\` VARCHAR(191) NOT NULL,
    \`value\` VARCHAR(191) NOT NULL,
    \`reason\` LONGTEXT NULL,
    \`bannedBy\` VARCHAR(191) NULL,
    \`expiresAt\` DATETIME(3) NULL,
    \`isActive\` BOOLEAN NOT NULL DEFAULT true,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    PRIMARY KEY (\`id\`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`;

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(`cat << 'EOF' > fix.sql\n${sql}\nEOF\nmysql -u u584311043_charichariday4 -pAbdelkader@141729 u584311043_charichariday4 < fix.sql\nrm fix.sql`, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '82.198.227.200',
  port: 65002,
  username: 'u584311043',
  password: 'Abdelkader@141729'
});
