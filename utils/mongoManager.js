const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const isPortOpen = (port, host = '127.0.0.1') => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const ensureLocalMongo = async () => {
  const isOpen = await isPortOpen(27017);
  if (isOpen) {
    return true;
  }

  const mongodPath = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
  if (!fs.existsSync(mongodPath)) {
    return false;
  }

  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(' Starting local MongoDB database in background...');
  try {
    const proc = spawn(mongodPath, ['--dbpath', dataDir, '--bind_ip', '127.0.0.1'], {
      detached: true,
      stdio: 'ignore',
    });
    proc.unref();

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 600));
      if (await isPortOpen(27017)) {
        console.log(' Local MongoDB database ready!');
        return true;
      }
    }
  } catch (e) {
    console.warn('Could not auto-start local mongod:', e.message);
  }

  return false;
};

module.exports = { isPortOpen, ensureLocalMongo };

