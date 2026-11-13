const net = require('net');

const host = 'ac-tna9czf-shard-00-00.nxzs9y7.mongodb.net';
const port = 27017;

console.log(`Testing TCP connection to ${host}:${port}...`);

const socket = new net.Socket();
socket.setTimeout(8000);

socket.connect(port, host, () => {
  console.log(' SUCCESS: Port 27017 is OPEN! Your Wi-Fi is NOT blocking MongoDB.');
  console.log('-> If Mongoose still fails, check your Atlas Database Username/Password in backend/.env');
  socket.destroy();
});

socket.on('timeout', () => {
  console.error('\n❌ TIMEOUT: Could not reach MongoDB Atlas on port 27017.');
  console.error('Two possible causes:');
  console.error('1. Your Wi-Fi (College/Institutional network) is BLOCKING port 27017.');
  console.error('   👉 FIX: Switch to Mobile Hotspot and try again.');
  console.error('2. Network Access in MongoDB Atlas does NOT have 0.0.0.0/0 whitelisted.');
  console.error('   👉 FIX: Go to cloud.mongodb.com -> Network Access -> Add 0.0.0.0/0\n');
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('\n❌ CONNECTION ERROR:', err.message);
  console.error('Your network is refusing or blocking connection to MongoDB Atlas.');
  console.error('👉 FIX: Switch your laptop Wi-Fi to Mobile Hotspot.\n');
});

