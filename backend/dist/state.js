'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var props = {
  AUTH_TOKEN: 'authToken',
  TOKEN_VALID: 'tokenValid',
  GRANTED_POINTS: 'grantedPoints',
  POINTS_PER_ITEM: 'pointsPerItem',
  AWARDED_POINTS: 'awardedPoints',
  ACTIVE_ITEM: 'activeItem'
};

var propsConf = [{
  propName: props.AUTH_TOKEN,
  persist: true
}, {
  propName: props.TOKEN_VALID,
  persist: true
}, {
  propName: props.GRANTED_POINTS,
  persist: true
}, {
  propName: props.POINTS_PER_ITEM,
  persist: true,
  isPathVal: true
}, {
  propName: props.AWARDED_POINTS,
  persist: true,
  isPathVal: true
}, {
  propName: props.ACTIVE_ITEM,
  persist: true
}];

var shouldPersist = (0, _ramda.propEq)('persist', true);
var filterPersistent = (0, _ramda.filter)(shouldPersist);

var getPropFilePath = function getPropFilePath(propName) {
  var cwd = process.cwd();
  var dir = _config2.default.persistentStateDir;

  return cwd + '/' + dir + '/' + propName + '.json';
};

var getDirPath = function getDirPath() {
  var cwd = process.cwd();
  var dir = _config2.default.persistentStateDir;

  return cwd + '/' + dir;
};

var savePropToPersistentState = function savePropToPersistentState(propName, value) {
  var dirPath = getDirPath();
  if (!_fs2.default.existsSync(dirPath)) {
    _fs2.default.mkdirSync(dirPath);
  }

  var json = JSON.stringify(value);
  var filePath = getPropFilePath(propName);

  _fs2.default.writeFile(filePath, json, 'utf8', function () {});
};

var deletePropFromPersistentState = function deletePropFromPersistentState(propName) {
  var filePath = getPropFilePath(propName);

  if (!_fs2.default.existsSync(filePath)) {
    return null;
  }

  _fs2.default.unlink(filePath, function () {});
};

var loadPropFromPersistentState = function loadPropFromPersistentState(propName) {
  var filePath = getPropFilePath(propName);

  if (!_fs2.default.existsSync(filePath)) {
    return [];
  }

  var data = _fs2.default.readFileSync(filePath);

  try {
    return [propName, JSON.parse(data)];
  } catch (e) {
    return [];
  }
};

var loadPropsFromPersistentState = function loadPropsFromPersistentState() {
  return (0, _ramda.pipe)(filterPersistent, (0, _ramda.map)((0, _ramda.prop)('propName')), (0, _ramda.map)(loadPropFromPersistentState), (0, _ramda.filter)(function (x) {
    return x.length !== 0;
  }), _ramda.fromPairs)(propsConf);
};

var state = loadPropsFromPersistentState();

var setProp = function setProp(propName, val) {
  state = (0, _ramda.assoc)(propName, val, state);

  return state;
};

var delProp = function delProp(propName) {
  state = (0, _ramda.dissoc)(propName, state);

  return state;
};

var setPath = function setPath(pathItems, value) {
  state = (0, _ramda.assocPath)(pathItems, value, state);

  return state;
};

var generatePropModifiers = function generatePropModifiers(propName, persist) {
  return _defineProperty({}, propName, {
    get: function get() {
      return (0, _ramda.prop)(propName, state);
    },
    set: function set(val) {
      if (persist) {
        savePropToPersistentState(propName, val);
      }

      return setProp(propName, val);
    },
    del: function del() {
      if (persist) {
        deletePropFromPersistentState(propName);
      }

      return delProp(propName);
    }
  });
};

var generatePathModifiers = function generatePathModifiers(pathHead, persist) {
  return _defineProperty({}, pathHead, {
    set: function set() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      var pathTail = (0, _ramda.pipe)(_ramda.init, (0, _ramda.map)(function (x) {
        return x.toString();
      }))(params);
      var val = (0, _ramda.last)(params);

      var newState = setPath([pathHead].concat(_toConsumableArray(pathTail)), val);

      if (persist) {
        var p = (0, _ramda.prop)(pathHead, newState);
        savePropToPersistentState(pathHead, p);
      }

      return newState;
    },
    get: function get() {
      for (var _len2 = arguments.length, pathTail = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        pathTail[_key2] = arguments[_key2];
      }

      return (0, _ramda.path)([pathHead].concat(pathTail), state);
    }
  });
};

var generateModifiers = function generateModifiers(_ref3) {
  var propName = _ref3.propName,
      persist = _ref3.persist,
      isPathVal = _ref3.isPathVal;

  if (isPathVal) {
    return generatePathModifiers(propName, persist);
  }

  return generatePropModifiers(propName, persist);
};

var addUserAccess = function addUserAccess(modifiers) {
  var f = function f() {
    var token = modifiers.authToken.get();
    var data = Buffer.from(token, 'base64').toString();
    var parts = (0, _ramda.split)(':', data);

    return {
      login: parts[0],
      pass: parts[1]
    };
  };

  return (0, _ramda.assocPath)(['user', 'get'], f, modifiers);
};

var modifiers = (0, _ramda.pipe)((0, _ramda.map)(generateModifiers), _ramda.mergeAll, addUserAccess)(propsConf);

exports.default = modifiers;