import {
  assoc,
  find,
  head,
  join,
  map,
  propEq,
  pipe,
  split,
  __,
} from 'ramda';

import { getItemStudents } from './fe-endpoints';

import errors from './errors';
import state from './state';
import wis from './wis-api';

const resultHandler = (succ, fail) => ({ resp, body, err }) => {
  if (resp.statusCode === 200) {
    return succ(body);
  }

  return fail ? fail(err) : {};
};

const getISO8601Date = () => {
  const now = Date.now();
  const date = new Date(now);
  const pre = x => x < 10 ? `0${x}` : x;
  const year = pre(date.getFullYear());
  const month = pre(date.getMonth() + 1);
  const day = pre(date.getDate());
  const hours = pre(date.getHours());
  const minutes = pre(date.getMinutes());
  const seconds = pre(date.getSeconds());

  return `${year}${month}${day}T${hours}:${minutes}:${seconds}`;
};

const byteToHex = b => {
  const pre = b < 16 ? '0' : '';

  return pre + b.toString(16);
};

const byteArrayToHex = pipe(
  map(byteToHex),
  join(''),
  s => s.toUpperCase(),
);

const parseIsicResponse = body => {
  if (body === 'NOT_FOUND') {
    return { error: 'Student not found' };
  }

  return pipe(
    split(';'),
    head,
    assoc('login', __, {}),
  )(body);
};

const getStudentIdFromIsicId = uid => {
  const fail = () => ({ error: errors.CANT_GET_STUDENT_BY_ISIC });
  const handler = resultHandler(parseIsicResponse, fail);

  const hex = byteArrayToHex(uid);

  return wis.get.studentByIsic(hex)
    .then(handler)
    .catch(fail);
};

const findStudentByLogin = activeItem => isic => {
  if (isic.error) {
    return isic;
  }

  const { login } = isic;
  const { course, item } = activeItem;

  const succ = students => {
    const student = find(propEq('login', login), students);

    if (!student) {
      return { error: errors.CANT_GET_STUDENT_BY_ISIC };
    }

    return student;
  };
  const fail = () => ({ error: errors.CANT_GET_ITEMS_STUDENTS });

  return getItemStudents(course, item)
    .then(succ)
    .catch(fail);
};

const awardStudent = activeItem => (studentInfo) => {
  if (activeItem.error) {
    return activeItem;
  }

  const { course, item } = activeItem;

  if (studentInfo.error) {
    return studentInfo;
  }

  const { person_id: student, points: studentPoints, login: studentLogin } = studentInfo;

  const pointsPerItem = state.pointsPerItem.get(course, item);

  if (!pointsPerItem) {
    return { error: errors.POINTS_PER_ITEM_NOT_SET };
  }

  const awardedPointsFromState = state.awardedPoints.get(course, item, student);

  if (awardedPointsFromState) {
    return { error: errors.STUDENT_ALREADY_AWARDED };
  }

  const points = studentPoints + pointsPerItem;

  const succ = login => {
    state.awardedPoints.set(course, item, student, pointsPerItem);

    return { error: null, login };
  };
  const fail = () => ({ error: errors.CANT_WRITE_POINTS });

  const teacherLogin = state.user.get().login;

  const date = getISO8601Date();

  const rpcParams = {
    cabbr: activeItem.abbrv,
    acyear: activeItem.year,
    sem: activeItem.sem,
    item: activeItem.item,
    login: studentLogin,
    points,
    assessment: '',
    teacher: teacherLogin,
    date,
    update: 1,
  };

  return wis.rpc.writePoints(rpcParams)
    .then(succ)
    .catch(fail);
};

const writePointsToStudent = ({ uid }) => {
  const activeItem = state.activeItem.get() || { error: errors.ACTIVE_ITEM_NOT_SET };

  return getStudentIdFromIsicId(uid)
    .then(findStudentByLogin(activeItem))
    .then(awardStudent(activeItem));
};

const handler_cardEndpoint = (req, res) => {
  const student = req.body;

  writePointsToStudent(student)
    .then(d => res.json(d));
};

const initCardEndpoint = app => app.post('/api/esp/writePoints', handler_cardEndpoint);

export default initCardEndpoint;
