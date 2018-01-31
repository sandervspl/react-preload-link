import React from 'react';
import PT from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { uuid, noop } from './helpers';
import * as c from './constants';

// let Preload Link know the fetch failed with this constant
export const { PRELOAD_FAIL } = c;

class PreloadLink extends React.Component {
    static [c.ON_LOADING];
    static [c.ON_SUCCESS];
    static [c.ON_FAIL];
    static [c.ON_NAVIGATE];
    static process = {
        uid: 0,
        busy: false,
        cancelUid: 0,
        canCancel: true,
    };

    // Initialize the lifecycle hooks
    static init = (options) => {
        PreloadLink[c.ON_LOADING] = options.onLoading;
        PreloadLink[c.ON_SUCCESS] = options.onSuccess;
        PreloadLink[c.ON_FAIL] = options.onFail;
        PreloadLink[c.ON_NAVIGATE] = options.onNavigate;
    }

    constructor() {
        super();

        this.state = {
            loading: false,
        };

        this.uid = uuid();
    }

    setLoading = (callback = noop) => {
        const { process } = PreloadLink;
        const { noInterrupt } = this.props;

        if (!noInterrupt && process.busy && process.uid !== this.uid) {
            process.cancelUid = process.uid;
        } else if (noInterrupt) {
            // any further clicks can not cancel this process
            process.canCancel = false;
        }

        PreloadLink.process = {
            ...process,
            uid: this.uid,
            busy: true,
        };

        this.setState({ loading: true }, () => callback());
    }

    setLoaded = (callback = noop) => {
        // reset for further navigation
        if (!PreloadLink.process.canCancel) {
            PreloadLink.process.canCancel = true;
        }

        PreloadLink.process = {
            ...PreloadLink.process,
            uid: 0,
            busy: false,
        };

        this.setState({ loading: false }, () => callback());
    }

    // update fetch state and execute lifecycle hooks
    update = (state) => {
        const method = PreloadLink[state];

        // execution of lifecycle hooks
        const execute = (fn) => {
            if (!fn) return;

            if (typeof fn !== 'function') {
                console.error(`PreloadLink: Method for lifecycle '${state}' is not a function.`);
            } else {
                fn();
            }
        };

        // update state and call lifecycle hook
        if (this.props[state]) {
            // the override prop returns a function with the default lifecycle hooks as param.
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

        if (PreloadLink[c.ON_NAVIGATE]) {
            PreloadLink[c.ON_NAVIGATE]();
        }
    }

    handleFailed = () => {
        this.update(c.ON_FAIL);
        this.setLoaded();
    }

    returnsPromise = (fn) => {
        const obj = fn();
        return Promise.resolve(obj) === obj;
    }

    // prepares the page transition. Wait on all promises to resolve before changing route.
    prepareNavigation = () => {
        const { process } = PreloadLink;
        const { load } = this.props;
        const isArray = Array.isArray(load);
        let toLoad;

        // create functions of our load props
        if (isArray) {
            const loadList = [];
            for (let i = 0; i < load.length; i += 1) {
                const fn = load[i];

                if (!this.returnsPromise(fn)) {
                    console.error('Error: Not all given functions are returning a Promise. Aborting navigation. ');
                    return this.handleFailed();
                }

                loadList.push(fn);
            }

            toLoad = Promise.all(loadList);
        } else {
            if (!this.returnsPromise(load)) {
                console.error('Error: Given load function does not return a Promise. Aborting navigation. ');
                return this.handleFailed();
            }

            toLoad = load();
        }

        // wait for all async functions to resolve
        // set in- and external loading states and proceed to navigation if successful
        toLoad
            .then((result) => {
                // do not perform further navigation if this was ordered for cancel
                if (process.cancelUid === this.uid) {
                    return;
                }

                const preloadFailed = isArray
                    ? result.includes(PRELOAD_FAIL)
                    : result === PRELOAD_FAIL;

                if (preloadFailed) {
                    this.handleFailed();
                } else {
                    this.update(c.ON_SUCCESS);
                    this.setLoaded(() => this.navigate());
                }
            })
            .catch(() => {
                // loading failed. Set in- and external states to reflect this
                this.handleFailed();
            });
    }

    handleClick = (e) => {
        const { process } = PreloadLink;

        // prevents navigation
        e.preventDefault();

        // prevent navigation if we can't override a load with a new click
        if (process.busy && !process.canCancel) return;

        if (!this.props.load) {
            // nothing to load -- we can navigate
            this.navigate();
        } else {
            // fire external loading method
            this.update(c.ON_LOADING);

            if (!this.state.loading) {
                // set internal loading state and prepare to navigate
                this.setLoading(() => this.prepareNavigation());
            }
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
    load: PT.oneOfType([PT.func, PT.arrayOf(PT.func)]),
    to: PT.string.isRequired,
    /* eslint-disable react/no-unused-prop-types */
    onLoading: PT.func,
    onSuccess: PT.func,
    onFail: PT.func,
    /* eslint-enable */
    noInterrupt: PT.bool,
};

PreloadLink.defaultProps = {
    onLoading: null,
    onSuccess: null,
    onFail: null,
    noInterrupt: false,
};

// component initialization function
export const configure = PreloadLink.init;

// component
export default withRouter(PreloadLink);
