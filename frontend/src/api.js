import axios from 'axios';

import store from './store';
import {setLoadingOff, setLoadingOn} from './actions/loadingActions';

const ROOT = 'https://attendancelist-api.nesad.fit.vutbr.cz';
const API_ROOT = `${ROOT}/api/app/`;

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
        url: 'auth_token',
        method: 'post',
        data: {token}
    });
};

export const deauthUser = () => request({
    url: 'auth_token',
    method: 'delete'
});

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
