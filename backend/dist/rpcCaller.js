'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var agent = new _https2.default.Agent(_config2.default.rpcAgentOptions);

var call = function call(a, token, url, template, handler) {
  return (0, _request2.default)(url, {
    method: 'POST',
    agent: a,
    headers: {
      Authorization: 'Basic ' + token
    },
    body: template
  }, handler);
};

var rpcCaller = function rpcCaller(params, handler) {
  var cabbr = params.cabbr,
      acyear = params.acyear,
      sem = params.sem,
      item = params.item,
      login = params.login,
      points = params.points,
      assessment = params.assessment,
      teacher = params.teacher,
      date = params.date,
      update = params.update;


  var template = '<?xml version="1.0"?>\n<methodCall>\n\t<methodName>courses.set_item_points</methodName>\n\t<params>\n\t\t<param><value><string>' + cabbr + '</string></value></param>\n\t\t<param><value><int>' + acyear + '</int></value></param>\n\t\t<param><value><string>' + sem + '</string></value></param>\n\t\t<param><value><int>' + item + '</int></value></param>\n\t\t<param><value><string>' + login + '</string></value></param>\n\t\t<param><value><double>' + points + '</double></value></param>\n\t\t<param><value><string>' + assessment + '</string></value></param>\n\t\t<param><value><string>' + teacher + '</string></value></param>\n\t\t<param><value><datetime.iso8601>' + date + '</datetime.iso8601></value></param>\n\t\t<param><value><int>' + update + '</int></value></param>\n\t</params>\n</methodCall>\n\nValid\n<param><value><dateTime.iso8601>20190425T14:08:55</dateTime.iso8601></value></param>\n<param><value><datetime.iso8601>20190425T13:15:17.663Z</datetime.iso8601></value></param>\nInvalid';

  var token = _state2.default.authToken.get();

  var url = 'https://wis.fit.vutbr.cz/FIT/db/vyuka/ucitel/course-item-xml.php';

  return call(agent, token, url, template, handler);
};

exports.default = rpcCaller;