'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _dnsHandler = require('./dns-handler');

var dnsHandler = _interopRequireWildcard(_dnsHandler);

var _feEndpoints = require('./fe-endpoints');

var _cardEndpoint = require('./card-endpoint');

var _cardEndpoint2 = _interopRequireDefault(_cardEndpoint);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  CARD: https://www.instructables.com/id/ESP32-With-RFID-Access-Control/
  Generate keys: https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2
*/

dnsHandler.init();

var cardApp = (0, _express2.default)();
cardApp.use((0, _cors2.default)());
cardApp.use(_express2.default.json());
(0, _cardEndpoint2.default)(cardApp);
_http2.default.createServer(cardApp).listen(3000);

var feApp = (0, _express2.default)();
feApp.use((0, _cors2.default)());
feApp.use(_express2.default.json()); // parser for application/json request type
(0, _feEndpoints.initFeEndpoints)(feApp);
_http2.default.createServer(feApp).listen(3001);