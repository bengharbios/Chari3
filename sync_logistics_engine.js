const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const plinkExe = fs.existsSync(path.join(process.cwd(), 'plink.exe')) 
  ? `.\\plink.exe` 
  : `"C:\\Users\\ALsalam - Marketing\\Downloads\\plink.exe"`;

const files = [
  'src/lib/utils/encryption.ts',
  'src/app/api/admin/shipping/settings/route.ts',
  'src/app/api/seller/shipping/integrations/route.ts',
  'src/app/api/seller/shipping/manifests/route.ts',
  'src/app/admin-secure-internal/_components/AdminSidebar.tsx',
  'src/app/admin-secure-internal/logistics/page.tsx',
  'src/app/seller/shipping/page.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/lib/i18n/dictionaries/ar.json',
  'src/lib/i18n/dictionaries/en.json',
  'src/lib/i18n/dictionaries/fr.json'
];

for (const relPath of files) {
  const localPath = path.join(process.cwd(), relPath);
  const content = fs.readFileSync(localPath);
  const b64 = content.toString('base64');
  const remotePath = `/home/u584311043/domains/chariday.com/nodejs/${relPath.replace(/\\/g, '/')}`;
  const tmpPath = `/home/u584311043/tmp_le.b64`;

  console.log(`Uploading ${relPath} (${content.length} bytes)...`);
  // Ensure directory exists
  const remoteDir = path.dirname(remotePath);
  execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch "mkdir -p '${remoteDir}' && echo -n '' > ${tmpPath}"`);

  const CHUNK_SIZE = 30000;
  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    const chunk = b64.substring(i, i + CHUNK_SIZE);
    fs.writeFileSync('batch_cmd.sh', `echo -n '${chunk}' >> ${tmpPath}`, 'utf-8');
    execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch -m batch_cmd.sh`);
  }

  const decodeCmd = `/usr/bin/php -r '$b64 = file_get_contents("${tmpPath}"); file_put_contents("${remotePath}", base64_decode($b64)); echo "Successfully wrote " . filesize("${remotePath}") . " bytes to Hostinger!\\n";' && rm ${tmpPath}`;
  fs.writeFileSync('batch_cmd.sh', decodeCmd, 'utf-8');
  const out = execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch -m batch_cmd.sh`, { encoding: 'utf-8' });
  console.log(out);
}

// Trigger Passenger restart
execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch "mkdir -p ~/domains/chariday.com/nodejs/tmp && touch ~/domains/chariday.com/nodejs/tmp/restart.txt && touch ~/domains/chariday.com/nodejs/server.js"`);
console.log('Hostinger Passenger restart triggered successfully!');

if (fs.existsSync('batch_cmd.sh')) fs.unlinkSync('batch_cmd.sh');
