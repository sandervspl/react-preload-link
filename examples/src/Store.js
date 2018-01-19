import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './ducks';

const middleware = applyMiddleware(thunk);

/* eslint-disable no-underscore-dangle */
const store = createStore(
    combineReducers({ ...reducers }),
    compose(
        middleware,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    ),
);
/* eslint-enable */

export default store;
