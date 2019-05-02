'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _feEndpoints = require('./fe-endpoints');

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _wisApi = require('./wis-api');

var _wisApi2 = _interopRequireDefault(_wisApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var resultHandler = function resultHandler(succ, fail) {
  return function (_ref) {
    var resp = _ref.resp,
        body = _ref.body,
        err = _ref.err;

    if (resp.statusCode === 200) {
      return succ(body);
    }

    return fail ? fail(err) : {};
  };
};

var getISO8601Date = function getISO8601Date() {
  var now = Date.now();
  var date = new Date(now);
  var pre = function pre(x) {
    return x < 10 ? '0' + x : x;
  };
  var year = pre(date.getFullYear());
  var month = pre(date.getMonth() + 1);
  var day = pre(date.getDate());
  var hours = pre(date.getHours());
  var minutes = pre(date.getMinutes());
  var seconds = pre(date.getSeconds());

  return '' + year + month + day + 'T' + hours + ':' + minutes + ':' + seconds;
};

var byteToHex = function byteToHex(b) {
  var pre = b < 16 ? '0' : '';

  return pre + b.toString(16);
};

var byteArrayToHex = (0, _ramda.pipe)((0, _ramda.map)(byteToHex), (0, _ramda.join)(''), function (s) {
  return s.toUpperCase();
});

var parseIsicResponse = function parseIsicResponse(body) {
  if (body === 'NOT_FOUND') {
    return { error: 'Student not found' };
  }

  return (0, _ramda.pipe)((0, _ramda.split)(';'), _ramda.head, (0, _ramda.assoc)('login', _ramda.__, {}))(body);
};

var getStudentIdFromIsicId = function getStudentIdFromIsicId(uid) {
  var fail = function fail() {
    return { error: _errors2.default.CANT_GET_STUDENT_BY_ISIC };
  };
  var handler = resultHandler(parseIsicResponse, fail);

  var hex = byteArrayToHex(uid);

  return _wisApi2.default.get.studentByIsic(hex).then(handler).catch(fail);
};

var findStudentByLogin = function findStudentByLogin(activeItem) {
  return function (isic) {
    if (isic.error) {
      return isic;
    }

    var login = isic.login;
    var course = activeItem.course,
        item = activeItem.item;


    var succ = function succ(students) {
      var student = (0, _ramda.find)((0, _ramda.propEq)('login', login), students);

      if (!student) {
        return { error: _errors2.default.CANT_GET_STUDENT_BY_ISIC };
      }

      return student;
    };
    var fail = function fail() {
      return { error: _errors2.default.CANT_GET_ITEMS_STUDENTS };
    };

    return (0, _feEndpoints.getItemStudents)(course, item).then(succ).catch(fail);
  };
};

var awardStudent = function awardStudent(activeItem) {
  return function (studentInfo) {
    if (activeItem.error) {
      return activeItem;
    }

    var course = activeItem.course,
        item = activeItem.item;


    if (studentInfo.error) {
      return studentInfo;
    }

    var student = studentInfo.person_id,
        studentPoints = studentInfo.points,
        studentLogin = studentInfo.login;


    var pointsPerItem = _state2.default.pointsPerItem.get(course, item);

    if (!pointsPerItem) {
      return { error: _errors2.default.POINTS_PER_ITEM_NOT_SET };
    }

    var awardedPointsFromState = _state2.default.awardedPoints.get(course, item, student);

    if (awardedPointsFromState) {
      return { error: _errors2.default.STUDENT_ALREADY_AWARDED };
    }

    var points = studentPoints + pointsPerItem;

    var succ = function succ(login) {
      _state2.default.awardedPoints.set(course, item, student, pointsPerItem);

      return { error: null, login: login };
    };
    var fail = function fail() {
      return { error: _errors2.default.CANT_WRITE_POINTS };
    };

    var teacherLogin = _state2.default.user.get().login;

    var date = getISO8601Date();

    var rpcParams = {
      cabbr: activeItem.abbrv,
      acyear: activeItem.year,
      sem: activeItem.sem,
      item: activeItem.item,
      login: studentLogin,
      points: points,
      assessment: '',
      teacher: teacherLogin,
      date: date,
      update: 1
    };

    return _wisApi2.default.rpc.writePoints(rpcParams).then(succ).catch(fail);
  };
};

var writePointsToStudent = function writePointsToStudent(_ref2) {
  var uid = _ref2.uid;

  var activeItem = _state2.default.activeItem.get() || { error: _errors2.default.ACTIVE_ITEM_NOT_SET };

  return getStudentIdFromIsicId(uid).then(findStudentByLogin(activeItem)).then(awardStudent(activeItem));
};

var handler_cardEndpoint = function handler_cardEndpoint(req, res) {
  var student = req.body;

  writePointsToStudent(student).then(function (d) {
    return res.json(d);
  });
};

var initCardEndpoint = function initCardEndpoint(app) {
  return app.post('/api/esp/writePoints', handler_cardEndpoint);
};

exports.default = initCardEndpoint;