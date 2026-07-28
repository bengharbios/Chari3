const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const plinkExe = fs.existsSync(path.join(process.cwd(), 'plink.exe')) 
  ? `.\\plink.exe` 
  : `"C:\\Users\\ALsalam - Marketing\\Downloads\\plink.exe"`;

function runCmdWithRetry(cmd, maxRetries = 4) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      console.log(`SSH glitch, retrying attempt ${attempt}/${maxRetries}...`);
      // brief pause before retry
      execSync('powershell -Command "Start-Sleep -Milliseconds 1500"');
    }
  }
}

const tarPath = path.join(process.cwd(), 'next_build.tar.gz');
const content = fs.readFileSync(tarPath);
const b64 = content.toString('base64');
const tmpPath = `/home/u584311043/tmp_next.b64`;
const remoteTar = `/home/u584311043/domains/chariday.com/nodejs/next_build.tar.gz`;

console.log(`Uploading next_build.tar.gz (${content.length} bytes / ${(content.length / 1024 / 1024).toFixed(2)} MB)...`);

runCmdWithRetry(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch "echo -n '' > ${tmpPath}"`);

const CHUNK_SIZE = 50000;
const totalChunks = Math.ceil(b64.length / CHUNK_SIZE);
console.log(`Total base64 chunks to send: ${totalChunks}`);

for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
  const chunk = b64.substring(i, i + CHUNK_SIZE);
  const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
  fs.writeFileSync('batch_cmd.sh', `echo -n '${chunk}' >> ${tmpPath}`, 'utf-8');
  runCmdWithRetry(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch -m batch_cmd.sh`);
  if (chunkIndex % 50 === 0 || chunkIndex === totalChunks) {
    console.log(`Sent chunk ${chunkIndex} / ${totalChunks} (${((chunkIndex / totalChunks) * 100).toFixed(1)}%)...`);
  }
}

console.log('Decoding base64 and un-tarr-ing on Hostinger...');
const unpackCmd = `/usr/bin/php -r '$b = file_get_contents("${tmpPath}"); file_put_contents("${remoteTar}", base64_decode($b));' && rm -f ${tmpPath} && cd /home/u584311043/domains/chariday.com/nodejs && tar -xzf next_build.tar.gz && rm -f next_build.tar.gz && mkdir -p tmp && touch tmp/restart.txt && touch server.js`;

fs.writeFileSync('batch_cmd.sh', unpackCmd, 'utf-8');
const out = runCmdWithRetry(`${plinkExe} -ssh -P 65002 u584311043@82.198.227.200 -pw "Nabila@@141729" -batch -m batch_cmd.sh`);
console.log(out);
console.log('🎉 Production build uploaded and unpacked on Hostinger! Passenger restarted!');

if (fs.existsSync('batch_cmd.sh')) fs.unlinkSync('batch_cmd.sh');
