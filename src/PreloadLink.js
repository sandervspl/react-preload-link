import React from 'react';
import PT from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

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

    // Initialize the lifecycle functions of page loading.
    static init = ({ setLoading, setSuccess, setFailed }) => {
        PreloadLink[SET_LOADING] = setLoading;
        PreloadLink[SET_SUCCESS] = setSuccess;
        PreloadLink[SET_FAILED] = setFailed;
    }

    state = {
        loading: false,
    }

    setLoading = (callback = noop) => this.setState({ loading: true }, () => callback());
    setLoaded = (callback = noop) => this.setState({ loading: false }, () => callback());

    // update fetch state and execute lifecycle methods
    update = (state) => {
        const method = PreloadLink[state];

        // execution of lifecycle methods
        const execute = (fn) => {
            if (!fn) return;

            if (typeof fn !== 'function') {
                console.error(`PreloadLink: Method for lifecycle '${state}' is not a function.`);
            } else {
                fn();
            }
        };

        // update state and call lifecycle method
        if (this.props[state]) {
            // the override prop returns a function with the default lifecycle method as param.
            this.props[state](() => execute(method));
            this.setLoading();
        } else {
            this.setLoading(() => execute(method));
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
        const isArray = Array.isArray(load);
        let toLoad;

        // create functions of our load props
        if (isArray) {
            const loadList = load.map(fn => fn());
            toLoad = Promise.all(loadList);
        } else {
            toLoad = load();
        }

        // wait for all async functions to resolve
        // set in- and external loading states and proceed to navigation if successful
        toLoad
            .then((result) => {
                const preloadFailed = isArray
                    ? result.includes(PRELOAD_FAIL)
                    : result === PRELOAD_FAIL;

                if (preloadFailed) {
                    this.update(SET_FAILED);
                    this.setLoaded();
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
export default withRouter(PreloadLink);
