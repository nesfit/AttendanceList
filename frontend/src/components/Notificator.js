import React from 'react';

import store from '../store';

const Notificator = props => {
    //stub for notistack: https://iamhosseindhv.com/notistack

    const {notification} = store.getState();
    if(notification) {
        props.enqueueSnackbar(notification.message, notification);
    }

    return '';
};

export default Notificator;
