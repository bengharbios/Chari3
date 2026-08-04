const { Client } = require('ssh2');

const host = '82.198.227.200';
const port = 65002;
const username = 'u584311043';
const password = 'Nabila@@141729';

const conn = new Client();

console.log('Connecting to Hostinger...');
conn.on('ready', () => {
  conn.exec('ls -la ~/domains/chariday.com/ChariDay_uploads', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
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
