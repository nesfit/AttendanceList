import React from 'react';
import {SnackbarProvider, withSnackbar} from 'notistack';

import SignIn from './SignIn';
import Manager from './Manager';
import Notificator from './Notificator';

import store from '../store';

const NotificatorWithSnackbar = withSnackbar(Notificator);

const App = () => {
    const state = store.getState();

    return (
        <SnackbarProvider maxSnack={3}>
            <div>
                {state.user ? <Manager/> : <SignIn/>}
                <NotificatorWithSnackbar/>
            </div>
        </SnackbarProvider>
    );
};

export default App;
