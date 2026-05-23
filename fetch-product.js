const https = require('https');

https.get('https://chariday.com/api/products/cmpflk8x5000141u3sxs9dsn2', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('--- API RESPONSE ---');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Failed to parse JSON:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('Fetch error:', err.message);
});
