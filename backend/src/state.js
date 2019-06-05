import {
  assoc,
  assocPath,
  dissoc,
  filter,
  fromPairs,
  init,
  last,
  map,
  mergeAll,
  path,
  pipe,
  prop,
  propEq,
  split,
  __
} from 'ramda';

import fs from 'fs';

import config from './config';

const props = {
  AUTH_TOKEN: 'authToken',
  TOKEN_VALID: 'tokenValid',
  GRANTED_POINTS: 'grantedPoints',
  POINTS_PER_ITEM: 'pointsPerItem',
  AWARDED_POINTS: 'awardedPoints',
  ACTIVE_ITEM: 'activeItem',
};

const propsConf = [
  {
    propName: props.AUTH_TOKEN,
    persist: false,
  },
  {
    propName: props.TOKEN_VALID,
    persist: false,
  },
  {
    propName: props.GRANTED_POINTS,
    persist: true,
  },
  {
    propName: props.POINTS_PER_ITEM,
    persist: true,
    isPathVal: true,
  },
  {
    propName: props.AWARDED_POINTS,
    persist: true,
    isPathVal: true,
  },
  {
    propName: props.ACTIVE_ITEM,
    persist: true,
  },
];

const shouldPersist = propEq('persist', true);
const filterPersistent = filter(shouldPersist);

const getPropFilePath = propName => {
  const cwd = process.cwd();
  const dir = config.persistentStateDir;

  return `${cwd}/${dir}/${propName}.json`;
};

const getDirPath = () => {
  const cwd = process.cwd();
  const dir = config.persistentStateDir;

  return `${cwd}/${dir}`;
};

const savePropToPersistentState = (propName, value) => {
  const dirPath = getDirPath();
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }

  const json = JSON.stringify(value);
  const filePath = getPropFilePath(propName);

  fs.writeFile(filePath, json, 'utf8', () => {});
};

const deletePropFromPersistentState = propName => {
  const filePath = getPropFilePath(propName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  fs.unlink(filePath, () => {
  });
};

const loadPropFromPersistentState = propName => {
  const filePath = getPropFilePath(propName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const data = fs.readFileSync(filePath);

  try {
    return [propName, JSON.parse(data)];
  } catch (e) {
    return [];
  }
};

const loadPropsFromPersistentState = () => pipe(
  filterPersistent,
  map(prop('propName')),
  map(loadPropFromPersistentState),
  filter(x => x.length !== 0),
  fromPairs,
)(propsConf);

let state = loadPropsFromPersistentState();

const setProp = (propName, val) => {
  state = assoc(propName, val, state);

  return state;
};

const delProp = (propName) => {
  state = dissoc(propName, state);

  return state;
};

const setPath = (pathItems, value) => {
  state = assocPath(pathItems, value, state);

  return state;
};

const generatePropModifiers = (propName, persist) => ({
  [propName]: {
    get: () => prop(propName, state),
    set: val => {
      if (persist) {
        savePropToPersistentState(propName, val);
      }

      return setProp(propName, val);
    },
    del: () => {
      if (persist) {
        deletePropFromPersistentState(propName);
      }

      return delProp(propName);
    },
  },
});

const generatePathModifiers = (pathHead, persist) => ({
  [pathHead]: {
    set: (...params) => {
      const pathTail = pipe(
        init,
        map(x => x.toString()),
      )(params);
      const val = last(params);

      const newState = setPath([pathHead, ...pathTail], val);

      if (persist) {
        const p = prop(pathHead, newState);
        savePropToPersistentState(pathHead, p);
      }

      return newState;
    },
    get: (...pathTail) => path([pathHead, ...pathTail], state),
  },
});

const generateModifiers = ({ propName, persist, isPathVal }) => {
  if(isPathVal) {
    return generatePathModifiers(propName, persist);
  }

  return generatePropModifiers(propName, persist);
};

const addUserAccess = modifiers => {
  const f = () => {
    const token = modifiers.authToken.get();
    const data = Buffer.from(token, 'base64').toString();
    const parts = split(':', data);

    return {
      login: parts[0],
      pass: parts[1],
    };
  };

  return assocPath(['user', 'get'], f, modifiers);
};

const modifiers = pipe(
  map(generateModifiers),
  mergeAll,
  addUserAccess,
)(propsConf);

export default modifiers;
