'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathToString = exports.attrsToString = exports.getLocalIp = exports.findIPv4Addresses = undefined;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _ramda = require('ramda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isIPv4AddressObj = (0, _ramda.propEq)('family', 'IPv4');

var findIPv4Addresses = exports.findIPv4Addresses = (0, _ramda.find)(isIPv4AddressObj);

var getLocalIp = exports.getLocalIp = function getLocalIp(iface) {
  return (0, _ramda.pipe)(_os2.default.networkInterfaces, (0, _ramda.prop)(iface), findIPv4Addresses, (0, _ramda.when)(_ramda.identity, (0, _ramda.prop)('address')))();
};

var attrsToString = exports.attrsToString = (0, _ramda.pipe)((0, _ramda.mapObjIndexed)(function (val, key) {
  return key + '=' + val;
}), _ramda.values, (0, _ramda.join)('&'));

var pathToString = exports.pathToString = (0, _ramda.join)('/');