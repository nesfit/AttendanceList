import {
    LOADING_OFF,
    LOADING_ON
} from "./actionTypes";

export const setLoadingOn = () => ({ type: LOADING_ON });

export const setLoadingOff = () => ({ type: LOADING_OFF });
