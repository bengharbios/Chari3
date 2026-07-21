const { auth } = require('./src/lib/better-auth');
console.log('Available BetterAuth api endpoints:');
console.log(Object.keys(auth.api));
process.exit(0);
