const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const config = {
  host: '82.198.227.200',
  port: 65002,
  username: 'u584311043',
  password: 'Nabila@@141729'
};

const localFile = path.join(__dirname, '..', 'next_build.tar.gz');
const remoteDir = '/home/u584311043/domains/chariday.com/nodejs/';
const remoteFile = remoteDir + 'next_build.tar.gz';

if (!fs.existsSync(localFile)) {
  console.error('File not found:', localFile);
  process.exit(1);
}

const fileSize = fs.statSync(localFile).size;
console.log(`📦 File size: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);

const conn = new Client();

conn.on('ready', () => {
  console.log('✅ SSH Connected');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      return;
    }
    
    console.log('📤 Uploading next_build.tar.gz...');
    const startTime = Date.now();
    let lastLog = 0;
    
    const writeStream = sftp.createWriteStream(remoteFile);
    const readStream = fs.createReadStream(localFile);
    let uploaded = 0;
    
    readStream.on('data', (chunk) => {
      uploaded += chunk.length;
      const now = Date.now();
      if (now - lastLog > 3000) {
        const pct = ((uploaded / fileSize) * 100).toFixed(1);
        const mbUploaded = (uploaded / 1024 / 1024).toFixed(1);
        const mbTotal = (fileSize / 1024 / 1024).toFixed(1);
        console.log(`  Progress: ${pct}% (${mbUploaded}/${mbTotal} MB)`);
        lastLog = now;
      }
    });
    
    writeStream.on('close', () => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Upload complete in ${elapsed}s`);
      
      // Now extract and restart
      console.log('🔄 Extracting and restarting server...');
      conn.exec(
        `cd ${remoteDir} && tar -xzf next_build.tar.gz && rm -f next_build.tar.gz && npm install && mkdir -p tmp && touch tmp/restart.txt && echo "✅ Deployment complete at $(date)"`,
        (err, stream) => {
          if (err) {
            console.error('Exec error:', err);
            conn.end();
            return;
          }
          stream.on('data', (data) => process.stdout.write(data.toString()));
          stream.stderr.on('data', (data) => process.stderr.write(data.toString()));
          stream.on('close', () => {
            console.log('🚀 Server restarted successfully!');
            conn.end();
          });
        }
      );
    });
    
    writeStream.on('error', (err) => {
      console.error('Write error:', err);
      conn.end();
    });
    
    readStream.pipe(writeStream);
  });
});

conn.on('error', (err) => {
  console.error('Connection error:', err.message);
});

conn.connect(config);
