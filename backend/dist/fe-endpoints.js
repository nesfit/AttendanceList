'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initFeEndpoints = exports.getItemStudents = undefined;

var _ramda = require('ramda');

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

///////////////////////////////////////
// ADD AUTH TOKEN ENDPOINT ////////////
///////////////////////////////////////

var addAuthToken_succ = function addAuthToken_succ() {
  _state2.default.tokenValid.set(true);

  return { error: null };
};

var addAuthToken_fail = function addAuthToken_fail() {
  _state2.default.tokenValid.del();

  return { error: _errors2.default.INVALID_TOKEN };
};

var handler_addAuthToken = function handler_addAuthToken(req, res) {
  var token = (0, _ramda.path)(['body', 'token'], req);
  if (!token) {
    res.json({ error: _errors2.default.NO_AUTH_TOKEN });
    return;
  }

  var loginResultHandler = resultHandler(addAuthToken_succ, addAuthToken_fail);

  _state2.default.authToken.set(token);

  // try to log in with provided token
  _wisApi2.default.get.testAuthToken().then(loginResultHandler).catch(addAuthToken_fail).then(function (d) {
    return res.json(d);
  });
};

var init_addAuthToken = function init_addAuthToken(app) {
  return app.post('/api/app/auth_token', handler_addAuthToken);
};

///////////////////////////////////////
// DELETE AUTH TOKEN ENDPOINT /////////
///////////////////////////////////////

var handler_deleteToken = function handler_deleteToken(req, res) {
  _state2.default.authToken.del();
  _state2.default.tokenValid.del();

  res.json({ error: null });
};

var init_deleteAuthToken = function init_deleteAuthToken(app) {
  return app.delete('/api/app/auth_token', handler_deleteToken);
};

///////////////////////////////////////
// GET COURSE DATA ENDPOINT ///////////
///////////////////////////////////////

var addVariantsToItemIfHaveAny_succ = function addVariantsToItemIfHaveAny_succ(item) {
  return function (data) {
    var variants = (0, _ramda.pipe)((0, _ramda.prop)('data'), (0, _ramda.map)((0, _ramda.pick)(['title', 'id'])))(data);

    return (0, _ramda.assoc)('variants', variants, item);
  };
};

var addVariantsToItemIfHaveAny = function addVariantsToItemIfHaveAny(courseId) {
  return function (item) {
    var className = item.class;
    var itemId = item.id;

    if (!(0, _ramda.includes)(className, ['multi', 'select'])) {
      return item;
    }

    var fail = function fail() {
      return (0, _ramda.assoc)('error', _errors2.default.CANT_GET_ITEM_VARIANTS, item);
    };

    var handler = resultHandler(addVariantsToItemIfHaveAny_succ(item), fail);

    return _wisApi2.default.get.itemVariants(courseId, itemId).then(handler).catch(fail);
  };
};

var addVariantsForItemsWithTypeSelect = function addVariantsForItemsWithTypeSelect(course) {
  var courseId = course.id;

  var succ = function succ(newItems) {
    return (0, _ramda.assoc)('items', newItems, course);
  };

  return Promise.all((0, _ramda.map)(addVariantsToItemIfHaveAny(courseId), course.items)).then(succ);
};

var getCourseInfoByAbbrev_succ = function getCourseInfoByAbbrev_succ(body) {
  var id = (0, _ramda.path)(['data', 'id'], body);

  var succ = function succ(data) {
    var info = (0, _ramda.pick)(['id', 'title', 'abbrv', 'sem', 'year'], body.data);
    var items = (0, _ramda.pipe)((0, _ramda.path)(['body', 'data']), (0, _ramda.map)((0, _ramda.pick)(['id', 'title', 'class', 'max'])))(data);

    return (0, _ramda.mergeAll)([info, { items: items }]);
  };

  return _wisApi2.default.get.courseItems(id).then(succ).then(addVariantsForItemsWithTypeSelect);
};

var getCourseInfoByAbbrev_failObj = function getCourseInfoByAbbrev_failObj(err) {
  return {
    error: _errors2.default.CANT_GET_COURSE_BY_ABREV,
    message: err
  };
};

var getCourseItemsByAbbrev = function getCourseItemsByAbbrev(req, res) {
  var abbreviation = (0, _ramda.path)(['query', 'abbrv'], req);
  if (!abbreviation) {
    res.json({ error: _errors2.default.NO_ABBREV_ATTR });
    return;
  }

  var courseByAbbrevHandler = resultHandler(getCourseInfoByAbbrev_succ);

  _wisApi2.default.get.courseByAbbrev(abbreviation).then(courseByAbbrevHandler).catch(getCourseInfoByAbbrev_failObj).then(function (d) {
    return res.json(d);
  });
};

var init_getCourseItemsByAbbrev = function init_getCourseItemsByAbbrev(app) {
  return app.get('/api/app/course', getCourseItemsByAbbrev);
};

///////////////////////////////////////
// GET ITEM DATA ENDPOINT /////////////
///////////////////////////////////////
var addPointsToStudent = function addPointsToStudent(courseId, itemId) {
  return function (student) {
    var studentId = student.person_id;
    var pointsFromState = _state2.default.awardedPoints.get(courseId, itemId, studentId);

    return (0, _ramda.assoc)('awardedPoints', pointsFromState, student);
  };
};

var emailToLogin = function emailToLogin(student) {
  var email = student.email;

  var login = (0, _ramda.pipe)((0, _ramda.split)('@'), _ramda.head)(email);

  return (0, _ramda.pipe)((0, _ramda.dissoc)('email'), (0, _ramda.assoc)('login', login))(student);
};

var getItemStudents = exports.getItemStudents = function getItemStudents(courseId, itemId) {
  var succ = (0, _ramda.pipe)((0, _ramda.prop)('data'), (0, _ramda.map)((0, _ramda.pick)(['id', 'person_id', 'name', 'email', 'points'])), (0, _ramda.map)(emailToLogin), (0, _ramda.map)(addPointsToStudent(courseId, itemId)));

  var fail = function fail() {
    return { error: _errors2.default.CANT_GET_ITEMS_STUDENTS };
  };
  var handler = resultHandler(succ, fail);

  return _wisApi2.default.get.itemStudents(courseId, itemId).then(handler).catch(fail);
};

var getItemData_succ = function getItemData_succ(courseId, itemId) {
  return function (body) {
    var activeItem = _state2.default.activeItem.get();
    var isActive = activeItem && activeItem.course === courseId && activeItem.item === itemId;

    var data = (0, _ramda.pipe)((0, _ramda.prop)('data'), (0, _ramda.pick)(['class', 'title']), (0, _ramda.assoc)('course', courseId), (0, _ramda.assoc)('item', itemId), (0, _ramda.assoc)('pointsPerItem', _state2.default.pointsPerItem.get(courseId, itemId)), (0, _ramda.assoc)('isActive', isActive))(body);

    var addStudentsToData = function addStudentsToData(students) {
      return (0, _ramda.assoc)('students', students, data);
    };

    return getItemStudents(courseId, itemId).then(addStudentsToData);
  };
};

var getItemData = function getItemData(req, res) {
  var courseId = (0, _ramda.path)(['query', 'course'], req);
  var itemId = (0, _ramda.path)(['query', 'item'], req);

  if (!courseId || !itemId) {
    var error = courseId ? _errors2.default.NO_ITEM_ID : _errors2.default.NO_COURSE_ID;
    res.send({ error: error });

    return;
  }

  var course = parseInt(courseId, 10);
  var item = parseInt(itemId, 10);

  var succ = getItemData_succ(course, item);
  var fail = function fail() {
    return { error: _errors2.default.CANT_GET_ITEM_DATA };
  };

  var handler = resultHandler(succ, fail);

  _wisApi2.default.get.itemInfo(courseId, itemId).then(handler).catch(fail).then(function (d) {
    return res.json(d);
  });
};

var init_getItemData = function init_getItemData(app) {
  return app.get('/api/app/course/item', getItemData);
};

///////////////////////////////////////
// SET ITEM  POINTS ENDPOINT //////////
///////////////////////////////////////
var setItemPoints = function setItemPoints(req, res) {
  var data = req.body;
  var course = data.course,
      item = data.item,
      value = data.value;


  if (!course || !item) {
    var error = course ? _errors2.default.NO_ITEM_ID : _errors2.default.NO_COURSE_ID;
    res.send({ error: error });

    return;
  }

  _state2.default.pointsPerItem.set(course, item, value);

  res.json({ error: null });
};

var init_setItemPoints = function init_setItemPoints(app) {
  return app.post('/api/app/course/item/points', setItemPoints);
};

///////////////////////////////////////
// SET ACTIVE ITEM ENDPOINT ///////////
///////////////////////////////////////
var setActiveItem = function setActiveItem(req, res) {
  var data = req.body;
  var course = data.course,
      item = data.item;


  if (!course || !item) {
    var error = course ? _errors2.default.NO_ITEM_ID : _errors2.default.NO_COURSE_ID;
    res.send({ error: error });

    return;
  }

  _state2.default.activeItem.set(data);
  res.json({ error: null });
};

var init_setActiveItem = function init_setActiveItem(app) {
  return app.post('/api/app/course/item/', setActiveItem);
};

///////////////////////////////////////
// ENDPOINT INITIALIZERS //////////////
///////////////////////////////////////

var initializers = [init_addAuthToken, init_deleteAuthToken, init_getCourseItemsByAbbrev, init_getItemData, init_setItemPoints, init_setActiveItem];

var initFeEndpoints = exports.initFeEndpoints = function initFeEndpoints(app) {
  return (0, _ramda.forEach)(function (f) {
    return f(app);
  }, initializers);
};