// import axios from 'axios';
import https from 'https';
import request from 'request';
// import xmlrpc from 'xmlrpc';
// import util from 'util';

import { map, isNil, assocPath, assoc, pipe } from 'ramda';

import state from './state';
import { attrsToString, pathToString } from './utils';

import errors from './errors';
import config from './config';

import rpcCaller from './rpcCaller';

const apiPath = ['FIT', 'db', 'vyuka', 'rest'];
const fullApiPath = [config.wisRoot, ...apiPath];

const agent = new https.Agent(config.wisAgentOptions);

const getRequestWithAgent = (url, handler, token) => request({
  url,
  method: 'GET',
  agent,
  headers: token ? {
    Authorization: 'Basic ' + token,
  } : undefined,
}, handler);

const getUrlFrom = (path, attrs) => {
  const url = pathToString(path);
  const attrsString = attrsToString(attrs);

  if (!attrsString || attrsString.length === 0) {
    return url;
  }

  return `${url}?${attrsString}`;
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

const endpointPathGetters = {
  studentByIsic: hex => getUrlFrom([config.wisRoot, 'FIT', 'dns', 'getid'], { hex }),
  courseByAbbrev: abbrv => getUrlFrom([...fullApiPath, 'courses'], { abbrv }),
  courseInfo: cid => getUrlFrom([...fullApiPath, 'course', cid]),
  courseItems: cid => getUrlFrom([...fullApiPath, 'course', cid, 'items']),
  itemInfo: (cid, iid) => getUrlFrom([...fullApiPath, 'course', cid, 'item', iid]),
  itemVariants: (cid, iid) => getUrlFrom([...fullApiPath, 'course', cid, 'item', iid, 'variants']),
  itemStudents: (cid, iid) => getUrlFrom([...fullApiPath, 'course', cid, 'item', iid, 'students']),
  testAuthToken: () => getUrlFrom([config.wisRoot, 'FIT', 'db']),
};

const checkTokenAndSendRequest = epGetter => (...attrs) => {
  const token = state.authToken.get();
  if (!token) {
    return Promise.reject({ error: errors.NO_AUTH_TOKEN });
  }

  const url = epGetter(...attrs);

  return new Promise((res, rej) => {
    const handler = (err, resp, body) => {
      if (err) {
        rej(err);
        return;
      }

      if (resp.headers['content-type'].startsWith('application/json')) {
        let bodyData = body;
        try {
          bodyData = JSON.parse(body);
        } catch (e) {
        }

        res({
          body: bodyData,
          resp
        });
      } else {
        res({
          body,
          resp
        });
      }
    };

    getRequestWithAgent(url, handler, token);
  });
};

const GET_endpoints = map(checkTokenAndSendRequest, endpointPathGetters);

const writePoints = (params) => {
  const {
    cabbr,
    acyear,
    sem,
    item,
    login,
    points,
    teacher,
  } = params;

  if (isNil(cabbr)) {
    return Promise.reject({ error: errors.NO_COURSE_ABBRV });
  }

  if (isNil(acyear)) {
    return Promise.reject({ error: errors.NO_ACADEMIC_YEAR });
  }

  if (isNil(sem)) {
    return Promise.reject({ error: errors.NO_SEMESTER });
  }

  if (isNil(item)) {
    return Promise.reject({ error: errors.NO_ITEM_ID });
  }

  if (isNil(login)) {
    return Promise.reject({ error: errors.NO_STUDENT_LOGIN });
  }

  if (isNil(points)) {
    return Promise.reject({ error: errors.NO_POINTS });
  }

  if (isNil(teacher)) {
    return Promise.reject({ error: errors.NO_TEACHER_LOGIN });
  }

  return new Promise((res, rej) => {
    const handler = (error, response, body) => {
      if(response.statusCode === 200) {
        res(login);
      } else {
        rej();
      }
    };

    rpcCaller(params, handler);
  });
};

const rpc_endpoints = {
  writePoints,
};

const wis = {
  get: GET_endpoints,
  rpc: rpc_endpoints,
};

export default wis;
