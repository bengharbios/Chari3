const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec(`cd /home/u584311043/domains/chariday.com/nodejs && mysql -u u584311043_charichariday4 -pChariAbdelkader1417DayDB2026Admin29 u584311043_charichariday4 -e "SELECT id, name, slug, managerId FROM Store;"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', (d) => console.log('OUT:', d.toString()))
      .stderr.on('data', (d) => console.log('ERR:', d.toString()));
  });
}).connect({ host: '82.198.227.200', port: 65002, username: 'u584311043', password: 'Abdelkader@141729' });
