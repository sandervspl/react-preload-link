/* eslint-disable */
import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PreloadLinkInit } from 'react-preload-link';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './styles/main.css';

import Store from './Store';
import { setFailed, setLoading, setSuccess } from './ducks/app';

import Home from './modules/Home';
import Profile from './modules/Profile';

NProgress.configure({
    showSpinner: false,
    trickleSpeed: 500,
    minimum: .25,
});

PreloadLinkInit({
    setFailed: () => Store.dispatch(setFailed()),
    setLoading: () => Store.dispatch(setLoading()),
    setSuccess: () => Store.dispatch(setSuccess()),
});

const Routes = () => (
    <Switch>
        <Route exact path="/(|inline-content)" component={Home} />
        <Route path="/profile/:id" component={Profile} />
    </Switch>
);

const Root = () => (
    <Provider store={Store}>
        <BrowserRouter>
            <Route path="/" component={Routes} />
        </BrowserRouter>
    </Provider>
);

export default Root;
