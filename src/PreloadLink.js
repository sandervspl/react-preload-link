import React from 'react';
import PT from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

const noop = () => {};

// lifecycle constants
const SET_LOADING = 'setLoading';
const SET_SUCCESS = 'setSuccess';
const SET_FAILED = 'setFailed';

// let Preload Link know the fetch failed with this constant
export const PRELOAD_FAIL = 'preloadLink/fail';

class PreloadLink extends React.Component {
    static [SET_LOADING];
    static [SET_SUCCESS];
    static [SET_FAILED];
    static defaultLifecycleOptions = {
        action: null,
        dispatch: true,
    };

    // Initialize the lifecycle functions of page loading.
    static init = ({ setLoading, setSuccess, setFailed }) => {
        const options = PreloadLink.defaultLifecycleOptions;

        PreloadLink[SET_LOADING] = { ...options, ...setLoading };
        PreloadLink[SET_SUCCESS] = { ...options, ...setSuccess };
        PreloadLink[SET_FAILED] = { ...options, ...setFailed };
    }

    constructor(props) {
        super(props);

        if (!PreloadLink[SET_LOADING].action
            || !PreloadLink[SET_SUCCESS].action
            || !PreloadLink[SET_FAILED].action) {
            throw Error(`Not all lifecycle methods have been defined an action for PreloadLink. You can do this by importing 'PreloadLinkInit' once and defining an object with 'action' for all properties: ${SET_LOADING}, ${SET_SUCCESS}, ${SET_FAILED} (i.e. { action: someFunction }.`);
        }

        this.state = {
            loading: false,
        };
    }

    setLoading = (callback = noop) => (this.setState({ loading: true }, () => callback()));
    setLoaded = (callback = noop) => (this.setState({ loading: false }, () => callback()));

    // update fetch state and execute lifecycle methods
    update = (state) => {
        const { dispatch } = this.props;
        const method = PreloadLink[state];

        // execution of lifecycle methods
        // scoped as it's only relevant in update()
        const execute = (fn) => {
            const isFn = typeof fn === 'function';

            if (!isFn && !fn.type) {
                throw Error(`Lifecycle method for '${state}' is not a function nor a valid Redux action. Property 'type' is missing.`);
            }

            if (method.dispatch) {
                dispatch(isFn ? fn() : fn);
            } else {
                if (!isFn) {
                    throw Error(`Lifecycle method for '${state}' should be a function if 'dispatch' is set to false.`);
                }

                fn();
            }
        };

        // update state and call lifecycle method
        if (this.props[state]) {
            // the override prop returns a function with the default lifecycle method as param.
            this.props[state](() => execute(method.action));
            this.setLoading();
        } else {
            this.setLoading(() => execute(method.action));
        }
    }

    // navigate with react-router to new URL
    navigate = () => {
        const { history, to } = this.props;

        history.push(to);
    }

    // prepares the page transition. Wait on all promises to resolve before changing route.
    prepareNavigation = () => {
        const { load } = this.props;
        let toLoad;

        // create functions of our load props
        if (Array.isArray(load)) {
            const loadList = load.map(fn => fn());
            toLoad = Promise.all(loadList);
        } else {
            toLoad = load();
        }

        // wait for all async functions to resolve
        // set in- and external loading states and proceed to navigation if successful
        toLoad
            .then((result) => {
                if (result === PRELOAD_FAIL) {
                    this.update(SET_FAILED);
                } else {
                    this.update(SET_SUCCESS);
                    this.setLoaded(() => this.navigate());
                }
            })
            .catch(() => {
                // loading failed. Set in- and external states to reflect this
                this.update(SET_FAILED);
                this.setLoaded();
            });
    }

    handleClick = (e) => {
        // prevents navigation
        e.preventDefault();

        // fire external loading method
        this.update(SET_LOADING);

        if (!this.state.loading) {
            // set internal loading state and prepare to navigate
            this.setLoading(() => this.prepareNavigation());
        }
    }

    render() {
        const { to, children } = this.props;
        return (
            <Link to={to} onClick={this.handleClick}>
                {children}
            </Link>
        );
    }
}

PreloadLink.propTypes = {
    children: PT.any,
    dispatch: PT.func,
    history: PT.shape({
        // eslint-disable-next-line react/no-unused-prop-types
        push: PT.func,
    }),
    load: PT.oneOfType([PT.func, PT.arrayOf(PT.func)]).isRequired,
    to: PT.string.isRequired,
    /* eslint-disable react/no-unused-prop-types */
    setLoading: PT.func,
    setSuccess: PT.func,
    setFailed: PT.func,
    /* eslint-enable */
};

PreloadLink.defaultProps = {
    setLoading: null,
    setSuccess: null,
    setFailed: null,
};

// component initialization function
export const PreloadLinkInit = PreloadLink.init;

// component
export default compose(
    withRouter,
    connect(),
)(PreloadLink);
