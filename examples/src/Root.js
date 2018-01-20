/* eslint-disable */
import React from 'react';
import { Route, Switch, BrowserRouter, Link } from 'react-router-dom';
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

const App = () => (
    <main>
        <header>
            <Link to="/">
                <h1>Preload Link Examples</h1>
            </Link>
        </header>

        <div className="subheader content">
            <a
                id="github-stars-button"
                className="github-button"
                data-size="large"
                href="https://github.com/sandervspl/react-preload-link"
                data-count-href="/sandervspl/react-preload-link/stargazers"
                data-count-api="/repos/sandervspl/react-preload-link#stargazers_count"
                data-count-aria-label="# stargazers on GitHub"
                aria-label="Star sandervspl/react-preload-link on GitHub"
            >
                Star
            </a>
        </div>

        <Switch>
            <Route exact path="/(|inline-content)" component={Home} />
            <Route path="/profile/:id" component={Profile} />
        </Switch>

        <div className="footer content">
            <span className="copyright">
                Copyright &copy; <a href="#">Sander Vispoel</a> {new Date().getFullYear()}
            </span>
        </div>
    </main>
);

const Root = () => (
    <Provider store={Store}>
        <BrowserRouter>
            <Route path="/" component={App} />
        </BrowserRouter>
    </Provider>
);

export default Root;
