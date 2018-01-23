/* eslint-disable */
import React from 'react';
import { Route, Switch, HashRouter, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PreloadLinkInit } from 'react-preload-link';
import NProgress from 'nprogress';

import Store from './Store';
import { setFailed, setLoading, setSuccess } from './ducks/app';

import Home from './modules/Home';
import Profile from './modules/Profile';
import Page2 from './modules/Page2';

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
                <h1>React Preload Link</h1>
            </Link>
        </header>

        <div className="subheader">
            <div className="content">
                <a
                    id="github-stars-button"
                    className="github-button"
                    data-size="large"
                    href="https://github.com/sandervspl/react-preload-link"
                    data-show-count="true"
                    aria-label="Star sandervspl/react-preload-link on GitHub"
                >
                    Star on Github
                </a>
                <div className="description">
                    React Preload Link is a <a href="https://github.com/facebook/react">React</a> component built on the <a href="https://github.com/ReactTraining/react-router">React Router</a> Link that waits on all your data to load before navigating.
                </div>
            </div>
        </div>

        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/profile/:id" component={Profile} />
            <Route path="/page2" component={Page2} />
        </Switch>

        <div className="footer">
            <div className="content">
                <span className="copyright">
                    Copyright &copy; <a href="https://github.com/sandervspl">Sander Vispoel</a> {new Date().getFullYear()}
                </span>
            </div>
        </div>
    </main>
);

const Root = () => (
    <Provider store={Store}>
        <HashRouter>
            <Route path="/" component={App} />
        </HashRouter>
    </Provider>
);

export default Root;
