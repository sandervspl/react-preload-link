import React from 'react';
import PT from 'prop-types';
import { withRouter, Link, NavLink } from 'react-router-dom';
import { uuid, noop } from './helpers';
import * as c from './constants';

let globalLinkState = Object.freeze({
    [c.ON_LOADING]: noop,
    [c.ON_SUCCESS]: noop,
    [c.ON_FAIL]: noop,
    [c.ON_NAVIGATE]: noop,
    process: {
        uid: 0,
        busy: false,
        cancelUid: null,
        canCancel: true,
    },
});

const setGlobalLinkState = (nextState) => {
    globalLinkState = Object.freeze({
        ...globalLinkState,
        ...nextState,
    });
};

export const configure = (options) => {
    setGlobalLinkState({
        [c.ON_LOADING]: options[c.ON_LOADING] || noop,
        [c.ON_SUCCESS]: options[c.ON_SUCCESS] || noop,
        [c.ON_FAIL]: options[c.ON_FAIL] || noop,
        [c.ON_NAVIGATE]: options[c.ON_NAVIGATE] || noop,
    });
};

export class PreloadLink extends React.Component {
    static getGlobalState = () => globalLinkState;

    // Initialize the lifecycle hooks
    constructor() {
        super();

        this.state = {
            loading: false,
        };

        this.uid = uuid();
    }

    setLoading = (callback = noop) => {
        const { process } = globalLinkState;
        const { noInterrupt } = this.props;
        const nextProcess = {
            uid: this.uid,
            busy: true,
        };

        if (!noInterrupt && process.busy && process.uid !== this.uid) {
            nextProcess.cancelUid = process.uid;
        } else if (noInterrupt) {
            // any further clicks can not cancel this process
            nextProcess.canCancel = false;
        }

        setGlobalLinkState({
            process: {
                ...globalLinkState.process,
                ...nextProcess,
            },
        });

        this.setState({ loading: true }, callback);
    }

    setLoaded = (callback = noop) => {
        const nextProcess = {
            uid: 0,
            cancelUid: null,
            busy: false,
            canCancel: true,
        };

        setGlobalLinkState({
            process: {
                ...globalLinkState.process,
                ...nextProcess,
            },
        });

        this.setState({ loading: false }, callback);
    }

    // navigate with react-router to new URL
    navigate = () => {
        const { history, to } = this.props;
        const hook = () => this.executeHook(c.ON_NAVIGATE);

        history.push(to);

        if (this.props[c.ON_NAVIGATE]) {
            this.props[c.ON_NAVIGATE](hook);
        } else {
            hook();
        }
    }

    // NOTE: it's best to use prepareHookCall if you want to execute hooks,
    // because it will ensure the correct loading state is set
    executeHook = (state) => {
        const fn = globalLinkState[state];

        if (!fn) return;

        if (typeof fn !== 'function') {
            console.error(`PreloadLink: Method for lifecycle '${state}' is not a function.`);
        } else {
            fn();
        }
    }

    prepareHookCall = (state, fn = noop) => {
        const setLoadState = state === c.ON_LOADING ? this.setLoading : this.setLoaded;
        const hook = () => this.executeHook(state);

        if (this.props[state]) {
            if (typeof this.props[state] !== 'function') {
                console.error(`PreloadLink: Method for lifecycle '${state}' is not a function.`);
            } else {
                this.props[state](hook);
                setLoadState(fn);
            }
        } else {
            setLoadState(() => {
                hook();
                fn();
            });
        }
    }

    unwrapWithMiddleware = (fn) => (
        fn().then((data) => {
            this.props.loadMiddleware(data);
        })
    )

    // prepares the page transition. Wait on all promises to resolve before changing route.
    prepareNavigation = () => {
        const { process } = globalLinkState;
        const { load } = this.props;
        const isArray = Array.isArray(load);
        let toLoad;

        // create functions of our load props
        if (isArray) {
            const loadList = load.map(fn => this.unwrapWithMiddleware(fn));
            toLoad = Promise.all(loadList);
        } else {
            toLoad = this.unwrapWithMiddleware(load);
        }

        // wait for all async functions to resolve
        // set in- and external loading states and proceed to navigation if successful
        // TODO: give error if function does not return a promise with explanation
        toLoad
            .then(() => {
                // do not perform further navigation if this was ordered for cancel
                if (process.cancelUid === this.uid) {
                    return false;
                }

                this.prepareHookCall(c.ON_SUCCESS, this.navigate);
            })
            .catch(() => {
                // loading failed. Set in- and external states to reflect this
                this.prepareHookCall(c.ON_FAIL);
            });
    }

    handleClick = (e) => {
        const { process } = globalLinkState;
        const { onClick } = this.props;

        // prevents navigation
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        // prevent navigation if we can't override a load with a new click
        if (process.busy && !process.canCancel) return;

        onClick();

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
        const { to, children, navLink, className, activeClassName } = this.props;
        const Element = navLink || activeClassName ? NavLink : Link;
        const props = {};

        if (navLink) {
            props.activeClassName = activeClassName;
        }

        return (
            <Element className={className} to={to} onClick={this.handleClick} {...props}>
                {children}
            </Element>
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
    onNavigate: PT.func,
    noInterrupt: PT.bool,
    loadMiddleware: PT.func,
    className: PT.string,
    navLink: PT.bool,
    activeClassName: PT.string,
    onClick: PT.func,
};

PreloadLink.defaultProps = {
    onLoading: null,
    onSuccess: null,
    onFail: null,
    onNavigate: null,
    noInterrupt: false,
    loadMiddleware: noop,
    navLink: false,
    onClick: noop,
};

// component
export default withRouter(PreloadLink);
