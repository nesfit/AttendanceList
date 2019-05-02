'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = undefined;

var _multicastDns = require('multicast-dns');

var _multicastDns2 = _interopRequireDefault(_multicastDns);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var init = exports.init = function init() {
  var mDNS = (0, _multicastDns2.default)();

  mDNS.on('query', function (query) {
    if (query.questions[0] && query.questions[0].name === _config2.default.espURI) {

      var localIp = (0, _utils.getLocalIp)(_config2.default.interface);
      if (!localIp) {
        return;
      }

      var response = {
        answers: [{
          name: _config2.default.espURI,
          type: 'A',
          ttl: 9999,
          data: localIp
        }]
      };

      mDNS.respond(response);
    }
  });
};