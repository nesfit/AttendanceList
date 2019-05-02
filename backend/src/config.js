import fs from 'fs';

const config = {
  interface: 'en0',
  espURI: 'cardreader.local',
  https: {
    key: fs.readFileSync('crts/server-key.pem'),
    cert: fs.readFileSync('crts/server-crt.pem'),
    ca: fs.readFileSync('crts/ca-crt.pem'),
    requestCert: true,
    rejectUnauthorized: false,
  },
  wisAgentOptions: {
    key: fs.readFileSync('crts/client-key.pem'),
    cert: fs.readFileSync('crts/client-crt.pem'),
    ca: fs.readFileSync('crts/ca-crt.pem'),
    host: 'wis.fit.vutbr.cz',
    port: '443',
    path: '/',
    rejectUnauthorized: false,
  },
  rpcAgentOptions: {
    key: fs.readFileSync('crts/client-key.pem'),
    cert: fs.readFileSync('crts/client-crt.pem'),
    ca: fs.readFileSync('crts/ca-crt.pem'),
    host: 'wis.fit.vutbr.cz',
    port: '443',
    path: '/FIT/db/vyuka/ucitel/course-item-xml.php',
    rejectUnauthorized: false,
  },
  wisRoot: 'https://wis.fit.vutbr.cz',
  persistentStateDir: 'state',
};

export default config;
