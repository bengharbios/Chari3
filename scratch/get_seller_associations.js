const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const query = `
    SELECT u.id, u.email, u.name, u.role, 
           s.id AS store_id, s.name AS store_name, s.managerId AS store_manager_id,
           ss.storeId AS staff_store_id, ss.role AS staff_role, ss.status AS staff_status,
           ss_store.name AS staff_store_name
    FROM User u
    LEFT JOIN Store s ON s.managerId = u.id
    LEFT JOIN StoreStaff ss ON ss.userId = u.id
    LEFT JOIN Store ss_store ON ss_store.id = ss.storeId
    WHERE u.email = 'seller@charyday.com';
  `;
  conn.exec(`cd /home/u584311043/domains/chariday.com/nodejs && mysql -u u584311043_charichariday4 -pChariAbdelkader1417DayDB2026Admin29 u584311043_charichariday4 -e "${query}"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', (d) => console.log('OUT:', d.toString()))
      .stderr.on('data', (d) => console.log('ERR:', d.toString()));
  });
}).connect({ host: '82.198.227.200', port: 65002, username: 'u584311043', password: 'Abdelkader@141729' });
