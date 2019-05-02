import {path, pipe, isNil} from 'ramda';

import {authUser, getCourseByAbbrev, getItemInfo, setItemPoints, setActiveItem} from "../api";
import {
    USER_LOGIN,
    USER_LOGIN_SEND,
    USER_LOGOUT,
    GET_COURSE_BY_ABBREV_SEND,
    DELETE_NOTIFICATION,
    ADD_NOTIFICATION,
    COURSE_INFO_RECEIVED,
    DELETE_COURSE,
    GET_ITEM_SEND,
    ITEM_RECEIVED,
    DELETE_ITEM,
    SET_ITEM_POINTS_SEND,
    POINTS_SAVED,
    POINTS_SAVE_ERROR,
    ACTIVE_ITEM_SET,
} from './actionTypes';

import store from '../store';

export const deleteNotification = () => ({type: DELETE_NOTIFICATION});

const innerAddNotification = (variant, message, timeout) => ({
    type: ADD_NOTIFICATION,
    payload: {variant, message, timeout}
});

const addNotification = (variant, message, timeout) => {
    store.dispatch(innerAddNotification(variant, message, timeout));
    store.dispatch(deleteNotification());
};

export const addError = (message, timeout) => addNotification('error', message, timeout);
export const addInfo = (message, timeout) => addNotification('info', message, timeout);
export const addSuccess = (message, timeout) => addNotification('success', message, timeout);

export const logOutUser = () => {
    addInfo('User logged out');

    return {type: USER_LOGOUT};
};

export const logInUser = user => {
    addSuccess('User logged in');

    return {type: USER_LOGIN, payload: user};
};

const parsePayload = pipe(
    path(['request', 'response']),
    JSON.parse
);

export const sendLogInUser = user => {
    authUser(user)
        .then(response => {
            const data = parsePayload(response);

            if (response.status === 200 && isNil(data.error)) {
                store.dispatch(logInUser(user));
            } else {
                addError('Login failed');
            }
        })
        .catch(() => addError('Connection error'));

    return {type: USER_LOGIN_SEND};
};

const courseReceived = (abbrev, info) => ({
    type: COURSE_INFO_RECEIVED,
    payload: {abbrev, info}
});

const deleteCourse = () => ({
    type: DELETE_COURSE
});

export const loadCourse = abbrev => {
    getCourseByAbbrev(abbrev)
        .then(r => {
            const data = parsePayload(r);

            if (data.error) {
                addError('Can\'t find course info by abbreviation');
                store.dispatch(deleteCourse());
            } else {
                store.dispatch(courseReceived(abbrev, data));
            }
        })
        .catch(() => addError('Connection error'));

    return {type: GET_COURSE_BY_ABBREV_SEND};
};

const itemReceived = item => ({
    type: ITEM_RECEIVED,
    payload: item
});

export const deleteItem = () => ({type:DELETE_ITEM});

export const loadItemInfo = (...ids) => {
    getItemInfo(...ids)
        .then(r => {
            const data = parsePayload(r);

            if (data.error) {
                addError('Can\'t find item info');
            } else {
                store.dispatch(itemReceived(data));
            }
        })
        .catch(() => addError('Connection error'));

    return {type: GET_ITEM_SEND};
};

export const mockStartup = () => {
    store.dispatch(sendLogInUser({login: 'zbysek', pass: 'voda'}));

    setTimeout(() => store.dispatch(loadCourse('PDS')), 1000);
    setTimeout(() => store.dispatch(loadItemInfo(12876, 73044)), 1000);
};

const pointsSaved = () => {
    addSuccess('Points saved');

    return {type: POINTS_SAVED};
};

const pointSaveError = () => {
    addError('Connection error');

    return {type:POINTS_SAVE_ERROR};
};

export const savePointsAward = (course, item, points) => {
    setItemPoints(course, item, points)
        .then(r => {
            const data = parsePayload(r);

            if (data.error) {
                addError('Can\'t write points to item');
            } else {
                store.dispatch(pointsSaved(data));
            }
        })
        .catch(pointSaveError);

    return {type: SET_ITEM_POINTS_SEND};
};

export const setItemActive = info => {
    setActiveItem(info)
        .then(r => {
            const data = parsePayload(r);

            if (data.error) {
                addError('Can\'t set active item');
            } else {
                addSuccess('Active item set');
            }
        })
        .catch(() => addError('Connection error'));

    return { type: ACTIVE_ITEM_SET };
};
