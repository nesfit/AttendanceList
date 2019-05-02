import axios from 'axios';

import store from './store';
import {setLoadingOff, setLoadingOn} from './actions/loadingActions';

const ROOT = 'http://localhost:3001';
const API_ROOT = `${ROOT}/api/app/`;

const SET_AUTH_TOKEN_URL = `auth_token`;

const axiosCaller = axios.create();

const request = ({url, method, data}) => {
    store.dispatch(setLoadingOn());

    return axiosCaller({
        url,
        baseURL: API_ROOT,
        headers: {'Content-Type': 'application/json'},
        rejectUnauthorized: false,
        method,
        data
    })
        .then(x => {
            store.dispatch(setLoadingOff());

            return x;
        });
};

export const authUser = ({login, pass}) => {
    const token = btoa(`${login}:${pass}`);

    return request({
        url: SET_AUTH_TOKEN_URL,
        method: 'post',
        data: {token}
    });
};

export const getCourseByAbbrev = abbrev => request({
    url: `course?abbrv=${abbrev}`,
    method: 'get'
});

export const getItemInfo = (courseId, itemId) => request({
    url: `course/item?course=${courseId}&item=${itemId}`,
    method: 'get'
});

export const setItemPoints = (course, item, value) => request({
    url: 'course/item/points',
    method: 'post',
    data: {
        course,
        item,
        value
    }
});

export const setActiveItem = data => request({
    url: 'course/item',
    method: 'post',
    data
});
