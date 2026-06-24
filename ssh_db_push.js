const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(`
    cd domains/chariday.com/nodejs
    chmod +x node_modules/@prisma/engines/schema-engine*
    npx prisma db push --accept-data-loss
  `, (err, stream) => {
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
