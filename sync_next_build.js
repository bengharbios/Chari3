const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const plinkExe = fs.existsSync(path.join(process.cwd(), 'plink.exe')) 
  ? `.\\plink.exe` 
  : `"C:\\Users\\ALsalam - Marketing\\Downloads\\plink.exe"`;

// Function to recursively find all files in a folder
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const buildServerDir = path.join(process.cwd(), '.next', 'server');
const buildStaticDir = path.join(process.cwd(), '.next', 'static');

const serverFiles = fs.existsSync(buildServerDir) ? getAllFiles(buildServerDir) : [];
const staticFiles = fs.existsSync(buildStaticDir) ? getAllFiles(buildStaticDir) : [];

const allBuildFiles = [...serverFiles, ...staticFiles];

console.log(`Total build files to upload: ${allBuildFiles.length}`);

let uploadedCount = 0;
for (const fullPath of allBuildFiles) {
  const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
  const content = fs.readFileSync(fullPath);
  const b64 = content.toString('base64');
  const remotePath = `/home/u584311043/domains/chariday.com/nodejs/${relPath}`;
  const tmpPath = `/home/u584311043/tmp_build.b64`;

  const remoteDir = path.dirname(remotePath);
  execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch "mkdir -p '${remoteDir}' && echo -n '' > ${tmpPath}"`);

  const CHUNK_SIZE = 40000;
  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    const chunk = b64.substring(i, i + CHUNK_SIZE);
    fs.writeFileSync('batch_cmd.sh', `echo -n '${chunk}' >> ${tmpPath}`, 'utf-8');
    execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch -m batch_cmd.sh`);
  }

  const decodeCmd = `/usr/bin/php -r '$b64 = file_get_contents("${tmpPath}"); file_put_contents("${remotePath}", base64_decode($b64));' && rm -f ${tmpPath}`;
  fs.writeFileSync('batch_cmd.sh', decodeCmd, 'utf-8');
  execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch -m batch_cmd.sh`, { encoding: 'utf-8' });
  
  uploadedCount++;
  if (uploadedCount % 20 === 0 || uploadedCount === allBuildFiles.length) {
    console.log(`Uploaded ${uploadedCount} / ${allBuildFiles.length} build files...`);
  }
}

// Trigger Passenger restart
execSync(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch "mkdir -p ~/domains/chariday.com/nodejs/tmp && touch ~/domains/chariday.com/nodejs/tmp/restart.txt && touch ~/domains/chariday.com/nodejs/server.js"`);
console.log('🎉 Hostinger Passenger restart triggered successfully after uploading compiled .next build!');

if (fs.existsSync('batch_cmd.sh')) fs.unlinkSync('batch_cmd.sh');
