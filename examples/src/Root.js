/* eslint-disable */
import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PreloadLinkInit } from 'react-preload-link';
import Progress from 'react-progress-2';
import 'react-progress-2/main.css';
import './styles/main.css';

import Store from './Store';
import { setFailed, setLoading, setSuccess } from './ducks/app';

import Home from './modules/Home';
import Profile from './modules/Profile';

PreloadLinkInit({
    setFailed: { action: setFailed },
    setLoading: { action: setLoading },
    setSuccess: { action: setSuccess },
});

const Routes = () => (
    <Switch>
        <Route exact path="/(|inline-content)" component={Home} />
        <Route path="/profile" component={Profile} />
    </Switch>
);

const Root = () => (
    <Provider store={Store}>
        <BrowserRouter>
            <div>
                <Progress.Component />
                <Route path="/" component={Routes} />
            </div>
        </BrowserRouter>
    </Provider>
);

export default Root;
