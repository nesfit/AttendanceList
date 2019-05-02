'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _ramda = require('ramda');

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _utils = require('./utils');

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _rpcCaller = require('./rpcCaller');

var _rpcCaller2 = _interopRequireDefault(_rpcCaller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } // import axios from 'axios';

// import xmlrpc from 'xmlrpc';
// import util from 'util';

var apiPath = ['FIT', 'db', 'vyuka', 'rest'];
var fullApiPath = [_config2.default.wisRoot].concat(apiPath);

var agent = new _https2.default.Agent(_config2.default.wisAgentOptions);

var getRequestWithAgent = function getRequestWithAgent(url, handler, token) {
  return (0, _request2.default)({
    url: url,
    method: 'GET',
    agent: agent,
    headers: token ? {
      Authorization: 'Basic ' + token
    } : undefined
  }, handler);
};

var getUrlFrom = function getUrlFrom(path, attrs) {
  var url = (0, _utils.pathToString)(path);
  var attrsString = (0, _utils.attrsToString)(attrs);

  if (!attrsString || attrsString.length === 0) {
    return url;
  }

  return url + '?' + attrsString;
};

/* ENDPOINTS
  1) student by ISIC id
  2) course by abbreviation
  3) course info
  4) course items
  5) item info
  6) item variants
  7) item students

  8) test auth token
*/

var endpointPathGetters = {
  studentByIsic: function studentByIsic(hex) {
    return getUrlFrom([_config2.default.wisRoot, 'FIT', 'dns', 'getid'], { hex: hex });
  },
  courseByAbbrev: function courseByAbbrev(abbrv) {
    return getUrlFrom([].concat(_toConsumableArray(fullApiPath), ['courses']), { abbrv: abbrv });
  },
  courseInfo: function courseInfo(cid) {
    return getUrlFrom([].concat(_toConsumableArray(fullApiPath), ['course', cid]));
  },
  courseItems: function courseItems(cid) {
    return getUrlFrom([].concat(_toConsumableArray(fullApiPath), ['course', cid, 'items']));
  },
  itemInfo: function itemInfo(cid, iid) {
    return getUrlFrom([].concat(_toConsumableArray(fullApiPath), ['course', cid, 'item', iid]));
  },
  itemVariants: function itemVariants(cid, iid) {
    return getUrlFrom([].concat(_toConsumableArray(fullApiPath), ['course', cid, 'item', iid, 'variants']));
  },
  itemStudents: function itemStudents(cid, iid) {
    return getUrlFrom([].concat(_toConsumableArray(fullApiPath), ['course', cid, 'item', iid, 'students']));
  },
  testAuthToken: function testAuthToken() {
    return getUrlFrom([_config2.default.wisRoot, 'FIT', 'db']);
  }
};

var checkTokenAndSendRequest = function checkTokenAndSendRequest(epGetter) {
  return function () {
    var token = _state2.default.authToken.get();
    if (!token) {
      return Promise.reject({ error: _errors2.default.NO_AUTH_TOKEN });
    }

    var url = epGetter.apply(undefined, arguments);

    return new Promise(function (res, rej) {
      var handler = function handler(err, resp, body) {
        if (err) {
          rej(err);
          return;
        }

        if (resp.headers['content-type'].startsWith('application/json')) {
          var bodyData = body;
          try {
            bodyData = JSON.parse(body);
          } catch (e) {}

          res({
            body: bodyData,
            resp: resp
          });
        } else {
          res({
            body: body,
            resp: resp
          });
        }
      };

      getRequestWithAgent(url, handler, token);
    });
  };
};

var GET_endpoints = (0, _ramda.map)(checkTokenAndSendRequest, endpointPathGetters);

var writePoints = function writePoints(params) {
  var cabbr = params.cabbr,
      acyear = params.acyear,
      sem = params.sem,
      item = params.item,
      login = params.login,
      points = params.points,
      teacher = params.teacher;


  if ((0, _ramda.isNil)(cabbr)) {
    return Promise.reject({ error: _errors2.default.NO_COURSE_ABBRV });
  }

  if ((0, _ramda.isNil)(acyear)) {
    return Promise.reject({ error: _errors2.default.NO_ACADEMIC_YEAR });
  }

  if ((0, _ramda.isNil)(sem)) {
    return Promise.reject({ error: _errors2.default.NO_SEMESTER });
  }

  if ((0, _ramda.isNil)(item)) {
    return Promise.reject({ error: _errors2.default.NO_ITEM_ID });
  }

  if ((0, _ramda.isNil)(login)) {
    return Promise.reject({ error: _errors2.default.NO_STUDENT_LOGIN });
  }

  if ((0, _ramda.isNil)(points)) {
    return Promise.reject({ error: _errors2.default.NO_POINTS });
  }

  if ((0, _ramda.isNil)(teacher)) {
    return Promise.reject({ error: _errors2.default.NO_TEACHER_LOGIN });
  }

  return new Promise(function (res, rej) {
    var handler = function handler(error, response, body) {
      if (response.statusCode === 200) {
        res(login);
      } else {
        rej();
      }
    };

    (0, _rpcCaller2.default)(params, handler);
  });
};

var rpc_endpoints = {
  writePoints: writePoints
};

var wis = {
  get: GET_endpoints,
  rpc: rpc_endpoints
};

exports.default = wis;