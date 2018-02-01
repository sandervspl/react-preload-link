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
        PreloadLink[c.ON_LOADING] = options[c.ON_LOADING];
        PreloadLink[c.ON_SUCCESS] = options[c.ON_SUCCESS];
        PreloadLink[c.ON_FAIL] = options[c.ON_FAIL];
        PreloadLink[c.ON_NAVIGATE] = options[c.ON_NAVIGATE];
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

    // navigate with react-router to new URL
    navigate = () => {
        const { history, to } = this.props;

        this.executeHook(c.ON_NAVIGATE);
        history.push(to);
    }

    // NOTE: it's best to use prepareHookCall if you want to execute hooks,
    // because it will ensure the correct loading state is set
    executeHook = (state) => {
        const fn = PreloadLink[state];

        if (!fn) return;

        if (typeof fn !== 'function') {
            console.error(`PreloadLink: Method for lifecycle '${state}' is not a function.`);
        } else {
            fn();
        }
    };

    prepareHookCall = (state, fn = noop) => {
        const setLoadState = state === c.ON_LOADING ? this.setLoading : this.setLoaded;
        const hook = () => {
            this.executeHook(state);
            fn();
        };

        if (this.props[state]) {
            setLoadState();
            this.props[state](hook);
        } else {
            setLoadState(hook);
        }
    }

    // prepares the page transition. Wait on all promises to resolve before changing route.
    prepareNavigation = () => {
        const { process } = PreloadLink;
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
                // do not perform further navigation if this was ordered for cancel
                if (process.cancelUid === this.uid) {
                    return;
                }

                const preloadFailed = isArray
                    ? result.includes(PRELOAD_FAIL)
                    : result === PRELOAD_FAIL;

                if (preloadFailed) {
                    this.prepareHookCall(c.ON_FAIL);
                } else {
                    this.prepareHookCall(c.ON_SUCCESS, this.navigate);
                }
            })
            .catch(() => {
                // loading failed. Set in- and external states to reflect this
                this.prepareHookCall(c.ON_FAIL);
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
            this.prepareHookCall(c.ON_LOADING);

            if (!this.state.loading) {
                this.prepareNavigation();
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
        push: PT.func,
    }),
    load: PT.oneOfType([PT.func, PT.arrayOf(PT.func)]),
    to: PT.string.isRequired,
    onLoading: PT.func,
    onSuccess: PT.func,
    onFail: PT.func,
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
