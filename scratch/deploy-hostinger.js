const { Client } = require('ssh2');

const host = '82.198.227.200';
const port = 65002;
const username = 'u584311043';
const password = 'Nabila@@141729';

const conn = new Client();

console.log('Connecting to Hostinger...');
conn.on('ready', () => {
  console.log('Connected via SSH. Executing deploy commands...');
  
  const script = `
    cd ~/domains/chariday.com/nodejs &&
    echo "Pulling latest code from GitHub..." &&
    git pull origin main &&
    echo "Installing dependencies..." &&
    npm install &&
    echo "Building Next.js app..." &&
    npm run build &&
    echo "Restarting PM2..." &&
    pm2 restart all &&
    echo "Deployment Complete!"
  `;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host,
  port,
  username,
  password
});
