import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './ducks';

/* eslint-disable no-underscore-dangle */
const middleware = window.__REDUX_DEVTOOLS_EXTENSION__
    ? compose(applyMiddleware(thunk), window.__REDUX_DEVTOOLS_EXTENSION__())
    : applyMiddleware(thunk);

const store = createStore(
    combineReducers({ ...reducers }),
    middleware,
);
/* eslint-enable */

export default store;
