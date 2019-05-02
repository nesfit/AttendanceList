'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
  interface: 'en0',
  espURI: 'cardreader.local',
  https: {
    key: _fs2.default.readFileSync('crts/server-key.pem'),
    cert: _fs2.default.readFileSync('crts/server-crt.pem'),
    ca: _fs2.default.readFileSync('crts/ca-crt.pem'),
    requestCert: true,
    rejectUnauthorized: false
  },
  wisAgentOptions: {
    key: _fs2.default.readFileSync('crts/client-key.pem'),
    cert: _fs2.default.readFileSync('crts/client-crt.pem'),
    ca: _fs2.default.readFileSync('crts/ca-crt.pem'),
    // host: 'wis.fit.vutbr.cz',
    // port: '443',
    host: 'localhost',
    port: '2001',
    path: '/',
    rejectUnauthorized: false
  },
  rpcAgentOptions: {
    key: _fs2.default.readFileSync('crts/client-key.pem'),
    cert: _fs2.default.readFileSync('crts/client-crt.pem'),
    ca: _fs2.default.readFileSync('crts/ca-crt.pem'),
    host: 'wis.fit.vutbr.cz',
    port: '443',
    path: '/FIT/db/vyuka/ucitel/course-item-xml.php',
    rejectUnauthorized: false
  },
  wisRoot: 'https://wis.fit.vutbr.cz',
  persistentStateDir: 'state'
};

exports.default = config;