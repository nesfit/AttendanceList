import {
  assoc,
  dissoc,
  find,
  forEach,
  head,
  includes,
  join,
  map,
  mergeAll,
  path,
  prop,
  propEq,
  pick,
  pipe,
  split,
  __,
} from 'ramda';

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



///////////////////////////////////////
// ADD AUTH TOKEN ENDPOINT ////////////
///////////////////////////////////////

const addAuthToken_succ = () => {
  state.tokenValid.set(true);

  return { error: null };
};

const addAuthToken_fail = () => {
  state.tokenValid.del();

  return { error: errors.INVALID_TOKEN };
};

const handler_addAuthToken = (req, res) => {
  const token = path(['body', 'token'], req);
  if (!token) {
    res.json({ error: errors.NO_AUTH_TOKEN });
    return;
  }

  const loginResultHandler = resultHandler(addAuthToken_succ, addAuthToken_fail);

  state.authToken.set(token);

  // try to log in with provided token
  wis.get.testAuthToken()
    .then(loginResultHandler)
    .catch(addAuthToken_fail)
    .then(d => res.json(d));
};

const init_addAuthToken = app => app.post('/api/app/auth_token', handler_addAuthToken);

///////////////////////////////////////
// DELETE AUTH TOKEN ENDPOINT /////////
///////////////////////////////////////

const handler_deleteToken = (req, res) => {
  state.authToken.del();
  state.tokenValid.del();

  res.json({ error: null });
};

const init_deleteAuthToken = app => app.delete('/api/app/auth_token', handler_deleteToken);

///////////////////////////////////////
// GET COURSE DATA ENDPOINT ///////////
///////////////////////////////////////

const addVariantsToItemIfHaveAny_succ = item => data => {
  const variants = pipe(
    prop('data'),
    map(pick(['title', 'id'])),
  )(data);

  return assoc('variants', variants, item);
};

const addVariantsToItemIfHaveAny = courseId => item => {
  const className = item.class;
  const itemId = item.id;

  if (!includes(className, ['multi', 'select'])) {
    return item;
  }

  const fail = () => assoc('error', errors.CANT_GET_ITEM_VARIANTS, item);

  const handler = resultHandler(addVariantsToItemIfHaveAny_succ(item), fail);

  return wis.get.itemVariants(courseId, itemId)
    .then(handler)
    .catch(fail);
};

const addVariantsForItemsWithTypeSelect = course => {
  const courseId = course.id;

  const succ = newItems => assoc('items', newItems, course);

  return Promise.all(map(addVariantsToItemIfHaveAny(courseId), course.items))
    .then(succ);
};

const getCourseInfoByAbbrev_succ = body => {
  const id = path(['data', 'id'], body);

  const succ = data => {
    const info = pick(['id', 'title', 'abbrv', 'sem', 'year'], body.data);
    const items = pipe(
      path(['body', 'data']),
      map(pick(['id', 'title', 'class', 'max'])),
    )(data);

    return mergeAll([info, { items }]);
  };

  return wis.get.courseItems(id)
    .then(succ)
    .then(addVariantsForItemsWithTypeSelect);
};

const getCourseInfoByAbbrev_failObj = err => ({
  error: errors.CANT_GET_COURSE_BY_ABREV,
  message: err,
});

const getCourseItemsByAbbrev = (req, res) => {
  const abbreviation = path(['query', 'abbrv'], req);
  if (!abbreviation) {
    res.json({ error: errors.NO_ABBREV_ATTR });
    return;
  }

  const courseByAbbrevHandler = resultHandler(getCourseInfoByAbbrev_succ);

  wis.get.courseByAbbrev(abbreviation)
    .then(courseByAbbrevHandler)
    .catch(getCourseInfoByAbbrev_failObj)
    .then(d => res.json(d));
};

const init_getCourseItemsByAbbrev = app => app.get('/api/app/course', getCourseItemsByAbbrev);

///////////////////////////////////////
// GET ITEM DATA ENDPOINT /////////////
///////////////////////////////////////
const addPointsToStudent = (courseId, itemId) => student => {
  const studentId = student.person_id;
  const pointsFromState = state.awardedPoints.get(courseId, itemId, studentId);

  return assoc('awardedPoints', pointsFromState, student);
};

const emailToLogin = student => {
  const { email } = student;
  const login = pipe(
    split('@'),
    head,
  )(email);

  return pipe(
    dissoc('email'),
    assoc('login', login),
  )(student);
};

export const getItemStudents = (courseId, itemId) => {
  const succ = pipe(
    prop('data'),
    map(pick(['id', 'person_id', 'name', 'email', 'points'])),
    map(emailToLogin),
    map(addPointsToStudent(courseId, itemId)),
  );

  const fail = () => ({ error: errors.CANT_GET_ITEMS_STUDENTS });
  const handler = resultHandler(succ, fail);

  return wis.get.itemStudents(courseId, itemId)
    .then(handler)
    .catch(fail);
};

const getItemData_succ = (courseId, itemId) => body => {
  const activeItem = state.activeItem.get();
  const isActive = activeItem && activeItem.course === courseId && activeItem.item === itemId;

  const data = pipe(
    prop('data'),
    pick(['class', 'title']),
    assoc('course', courseId),
    assoc('item', itemId),
    assoc('pointsPerItem', state.pointsPerItem.get(courseId, itemId)),
    assoc('isActive', isActive),
  )(body);

  const addStudentsToData = students => assoc('students', students, data);

  return getItemStudents(courseId, itemId)
    .then(addStudentsToData);
};

const getItemData = (req, res) => {
  const courseId = path(['query', 'course'], req);
  const itemId = path(['query', 'item'], req);

  if (!courseId || !itemId) {
    const error = courseId ? errors.NO_ITEM_ID : errors.NO_COURSE_ID;
    res.send({ error });

    return;
  }

  const course = parseInt(courseId, 10);
  const item = parseInt(itemId, 10);

  const succ = getItemData_succ(course, item);
  const fail = () => ({ error: errors.CANT_GET_ITEM_DATA });

  const handler = resultHandler(succ, fail);

  wis.get.itemInfo(courseId, itemId)
    .then(handler)
    .catch(fail)
    .then(d => res.json(d));
};

const init_getItemData = app => app.get('/api/app/course/item', getItemData);

///////////////////////////////////////
// SET ITEM  POINTS ENDPOINT //////////
///////////////////////////////////////
const setItemPoints = (req, res) => {
  const data = req.body;
  const { course, item, value } = data;

  if (!course || !item) {
    const error = course ? errors.NO_ITEM_ID : errors.NO_COURSE_ID;
    res.send({ error });

    return;
  }

  state.pointsPerItem.set(course, item, value);

  res.json({ error: null });
};

const init_setItemPoints = app => app.post('/api/app/course/item/points', setItemPoints);

///////////////////////////////////////
// SET ACTIVE ITEM ENDPOINT ///////////
///////////////////////////////////////
const setActiveItem = (req, res) => {
  const data = req.body;
  const { course, item } = data;

  if (!course || !item) {
    const error = course ? errors.NO_ITEM_ID : errors.NO_COURSE_ID;
    res.send({ error });

    return;
  }

  state.activeItem.set(data);
  res.json({ error: null });
};

const init_setActiveItem = app => app.post('/api/app/course/item/', setActiveItem);

///////////////////////////////////////
// ENDPOINT INITIALIZERS //////////////
///////////////////////////////////////

const initializers = [
  init_addAuthToken,
  init_deleteAuthToken,
  init_getCourseItemsByAbbrev,
  init_getItemData,
  init_setItemPoints,
  init_setActiveItem,
];

export const initFeEndpoints = app => forEach(f => f(app), initializers);
