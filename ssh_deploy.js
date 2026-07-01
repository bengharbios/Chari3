const { Client } = require('ssh2');

const conn = new Client();

const deployCommands = `
cd /home/u584311043/domains/chariday.com/nodejs/
echo "Pulling latest code from GitHub..."
git pull
echo "Installing any new dependencies..."
npm install
echo "Building the Next.js application..."
npm run build
echo "Restarting the Passenger application..."
mkdir -p tmp
touch tmp/restart.txt
echo "Deployment successful!"
`;

console.log('Connecting to server...');
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(deployCommands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('Connection error:', err);
}).connect({
  host: '82.198.227.200',
  port: 65002,
  username: 'u584311043',
  password: 'Abdelkader@141729',
  readyTimeout: 99999
});
