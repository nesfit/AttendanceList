import {assoc, identity, pipe, dissoc} from 'ramda';

import {
    USER_LOGIN,
    COURSE_INFO_RECEIVED,
    DELETE_COURSE,
    ITEM_RECEIVED,
    ADD_NOTIFICATION,
    DELETE_NOTIFICATION,
    DELETE_ITEM,
    LOADING_ON,
    LOADING_OFF
} from "../actions/actionTypes";

const initialState = { reloadTicker: null };

const loginReducer = (state = {}, info) => assoc('user', info, state);

const courseInfoReceived = (state, {abbrev, info}) => pipe(
    assoc('course', info),
    assoc('courseSearchAbbrev', abbrev)
)(state);

const deleteCourse = pipe(
    dissoc('course'),
    dissoc('item'),
    dissoc('courseSearchAbbrev')
);

const addNotification = (state, notification) => assoc('notification', notification, state);
const deleteNotification = dissoc('notification');

const itemReceived = (state, item) => assoc('item', item, state);
const deleteItem = dissoc('item');

const setLoadingOn = assoc('loading', true);
const setLoadingOff = assoc('loading', false);

const reducers = {
    [USER_LOGIN]: loginReducer,
    [COURSE_INFO_RECEIVED]: courseInfoReceived,
    [DELETE_COURSE]: deleteCourse,
    [ITEM_RECEIVED]: itemReceived,
    [DELETE_ITEM]: deleteItem,
    [ADD_NOTIFICATION]: addNotification,
    [DELETE_NOTIFICATION]: deleteNotification,
    [LOADING_ON]: setLoadingOn,
    [LOADING_OFF]: setLoadingOff,
    fallback: identity
};

const rootReducer = (state = initialState, action) => {
    const reducer = reducers[action.type] || reducers.fallback;

    return reducer(state, action.payload);
};

export default rootReducer;
