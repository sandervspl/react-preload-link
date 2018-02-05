/* eslint-disable no-undef */
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router } from 'react-router-dom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';

import PreloadLink, * as pll from 'react-preload-link';
import Root from '../examples/src/Root';
import { PRELOAD_FAIL } from 'react-preload-link';

// configure enzyme
configure({ adapter: new Adapter() });

// configure jest
jest.setTimeout(200);

// constants
const LOAD_DELAY = 100;

describe('App', () => {
    it('Renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Root />, div);
    });
});

describe('<PreloadLink>', () => {
    let wrapper;
    let link;
    let clock;
    let resolves;

    const PreloadLinkObj = PreloadLink.WrappedComponent;

    const timeoutFn = () => new Promise((resolve) => setTimeout(() => {
        resolves.push(true);
        resolve(1);
    }, LOAD_DELAY));

    const timeoutFnFail = () => new Promise((_, reject) => (
        setTimeout(() => reject(PRELOAD_FAIL), LOAD_DELAY)
    ));

    const getPreloadLink = () => (
        wrapper.find(PreloadLink)
    );

    const getPathname = () => (
        wrapper.instance().history.location.pathname
    );

    const createRouterWrapper = (Component) => {
        wrapper = mount(
            <Router>
                {Component}
            </Router>
        )
    };

    beforeEach(() => {
        pll.configure({});
        resolves = [];
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    describe('Props', () => {
        beforeEach(() => {
            createRouterWrapper(<PreloadLink to="page1" />);
            link = getPreloadLink();
        });

        it('Renders a <PreloadLink> component', () => {
            expect(link.length).toEqual(1);
        });

        it('Prop "noInterrupt" default value is "false"', () => {
            expect(PreloadLink.WrappedComponent.defaultProps.noInterrupt).toEqual(false);
        });
    });

    describe('Configuration', () => {
        beforeEach(() => {
            createRouterWrapper(<PreloadLink to="page1" load={timeoutFn} />);
            link = getPreloadLink();
        });

        it('Does not crash without configuration', (done) => {
            expect.assertions(1);

            link.simulate('click');
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Calls correct lifecycle hooks on successful navigation', (done) => {
            expect.assertions(2);

            const fn1 = sinon.spy();
            const fn2 = sinon.spy();

            pll.configure({
                onLoading: fn1,
                onSuccess: fn1,
                onFail: fn2,
                onNavigate: fn1,
            });

            link.simulate('click');
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn1.calledThrice).toBe(true);
                expect(fn2.notCalled).toBe(true);
                done();
            });
        });

        it('Calls correct lifecycle hook on failed navigation', (done) => {
            createRouterWrapper(<PreloadLink to="page1" load={timeoutFnFail} />);
            link = getPreloadLink();

            expect.assertions(2);

            const fn1 = sinon.spy();
            const fn2 = sinon.spy();

            pll.configure({
                onLoading: fn1,
                onSuccess: fn1,
                onFail: fn2,
            });

            link.simulate('click');
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn1.calledOnce).toBe(true);
                expect(fn2.calledOnce).toBe(true);

                done();
            });
        });

        it('Calls onNavigate after navigation', (done) => {
            createRouterWrapper(<PreloadLink to="page1" load={timeoutFn} />);
            link = getPreloadLink();
            const fn = sinon.spy();

            expect.assertions(2);

            pll.configure({
                onNavigate: fn,
            });

            link.simulate('click');
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn.called).toBe(true);
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });
    });

    describe('Navigating', () => {
        it('Directly navigates to "page1" after a click without load function', () => {
            createRouterWrapper(<PreloadLink to="page1" />);
            getPreloadLink().simulate('click');

            expect(getPathname()).toEqual('/page1');
        });

        it(`Navigates to "/page1" after ${LOAD_DELAY}ms with timeout function`, (done) => {
            expect.assertions(2);

            createRouterWrapper(<PreloadLink to="page1" load={timeoutFn} />);

            getPreloadLink().simulate('click');

            expect(getPathname()).toEqual('/');

            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Is impossible to interrupt an uninterruptable link', (done) => {
            expect.assertions(4);

            const loadCb = sinon.spy();
            createRouterWrapper(
                <Fragment>
                    <PreloadLink to="page1" noInterrupt load={timeoutFn} />
                    <PreloadLink to="page2" load={loadCb} />
                </Fragment>
            )

            link = getPreloadLink();

            link.at(0).simulate('click'); // with noInterrupt
            link.at(1).simulate('click'); // without
            clock.tick(LOAD_DELAY);

            expect(PreloadLinkObj.process.busy).toBe(true);
            expect(PreloadLinkObj.process.canCancel).toBe(false);
            expect(loadCb.notCalled).toBe(true);

            process.nextTick(() => {
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Waits for all load Promises to resolve before navigating', (done) => {
            expect.assertions(3);

            createRouterWrapper(<PreloadLink to="page1" load={[timeoutFn, timeoutFn]} />);

            getPreloadLink().simulate('click');

            expect(getPathname()).not.toEqual('/page1');

            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(resolves.length).toEqual(2);
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Safely fails when a Promise from an array rejects with PRELOAD_FAIL', (done) => {
            pll.configure({
                onFail: () => {
                    done();
                },
            });

            createRouterWrapper(<PreloadLink to="page1" load={[timeoutFn, timeoutFnFail]} />);

            getPreloadLink().simulate('click');

            clock.tick(LOAD_DELAY);
        });

        it('Returns correct data from loadMiddleware', (done) => {
            expect.assertions(1);

            const loadFn = () => new Promise((resolve) => resolve(10));
            const loadMiddleware = (data) => {
                expect(data).toEqual(10);
                done();
            };

            createRouterWrapper(<PreloadLink to="page1" load={loadFn} loadMiddleware={loadMiddleware} />);

            getPreloadLink().simulate('click');
        });

        // TODO
        it('Calls prop callback function if it exists');
    });
});
