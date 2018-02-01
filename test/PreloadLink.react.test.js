/* eslint-disable no-undef */
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router } from 'react-router-dom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';

import PreloadLink, * as pll from 'react-preload-link';
import Root from '../examples/src/Root';

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
    const fakeFn = sinon.spy();

    const timeoutFn = () => new Promise((resolve) => setTimeout(() => {
        resolves.push(true);
        resolve();
    }, LOAD_DELAY));

    const timeoutFnFail = () => new Promise((_, reject) => setTimeout(() => reject(), LOAD_DELAY));

    const getPreloadLink = () => (
        wrapper.find(PreloadLink)
    );

    const getPathname = () => (
        wrapper.instance().history.location.pathname
    );

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
            wrapper = mount(
                <Router>
                    <PreloadLink to="page1" />
                </Router>
            );

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
            wrapper = mount(
                <Router>
                    <PreloadLink to="page1" load={timeoutFn} />
                </Router>
            );
        });

        it('Does not crash without configuration', (done) => {
            expect.assertions(1);

            pll.configure({
                onNavigate: () => {
                    expect(getPathname()).toEqual('/page1');
                    done();
                },
            });

            getPreloadLink().simulate('click');
            clock.tick(LOAD_DELAY);
        });

        it('Calls correct lifecycle hooks on succesful navigation', (done) => {
            expect.assertions(2);

            const fn1 = sinon.spy();
            const fn2 = sinon.spy();

            pll.configure({
                onLoading: fn1,
                onSuccess: fn1,
                onFail: fn2,
                onNavigate: () => {
                    expect(fn1.calledTwice).toBe(true);
                    expect(fn2.notCalled).toBe(true);
                    done();
                },
            });

            getPreloadLink().simulate('click');
            clock.tick(LOAD_DELAY);
        });

        it('Calls correct lifecycle hook on failed navigation', (done) => {
            expect.assertions(2);

            const fn1 = sinon.spy();
            const fn2 = sinon.spy();

            pll.configure({
                onLoading: fn1,
                onSuccess: fn1,
                onFail: () => {
                    fn2();

                    expect(fn1.calledOnce).toBe(true);
                    expect(fn2.calledOnce).toBe(true);

                    done();
                },
            });

            wrapper = mount(
                <Router>
                    <PreloadLink to="page1" load={timeoutFnFail} />
                </Router>
            );

            getPreloadLink().simulate('click');
            clock.tick(LOAD_DELAY);
        });
    });

    describe('Navigating', () => {
        beforeEach(() => {
            wrapper = mount(
                <Router>
                    <Fragment>
                        <PreloadLink to="page1" />
                        <PreloadLink to="page2" />
                        <PreloadLink to="page3" noInterrupt load={timeoutFn} />
                        <PreloadLink to="page4" load={fakeFn} />
                        <PreloadLink to="page5" load={[timeoutFn, timeoutFn]} />
                    </Fragment>
                </Router>
            );

            link = getPreloadLink();
        });

        it('Directly navigate to "page1" after a click without load function', () => {
            link.at(0).simulate('click');
            expect(getPathname()).toEqual('/page1');
        });

        it(`Navigate to "/page2" after ${LOAD_DELAY}ms`, (done) => {
            expect.assertions(2);
            //
            pll.configure({
                onNavigate: () => {
                    expect(getPathname()).toEqual('/page2');
                    done();
                },
            });

            link.at(1).simulate('click');

            expect(getPathname()).toEqual('/page2');

            clock.tick(LOAD_DELAY);
        });

        it('Clicking a link does not interrupt a uninterruptable link and routes to correct route', (done) => {
            expect.assertions(1);

            pll.configure({
                onNavigate: () => {
                    expect(getPathname()).toEqual('/page3');
                    done();
                },
            });

            link.at(2).simulate('click'); // with noInterrupt
            link.at(0).simulate('click'); // without
            clock.tick(LOAD_DELAY);
        });

        it('Subsequent click(s) when a link is uninterruptable will not trigger new load function(s)', () => {
            link.at(2).simulate('click');
            link.at(3).simulate('click');

            clock.tick(LOAD_DELAY);

            expect(PreloadLinkObj.process.busy).toBe(true);
            expect(PreloadLinkObj.process.canCancel).toBe(false);
            expect(fakeFn.notCalled).toBe(true);
        });

        it('Wait for all load functions before navigating', (done) => {
            expect.assertions(3);

            pll.configure({
                onNavigate: () => {
                    expect(resolves.length).toEqual(2);
                    expect(getPathname()).toEqual('/page5');
                    done();
                },
            });

            link.at(4).simulate('click');

            expect(getPathname()).not.toEqual('/page5');

            clock.tick(LOAD_DELAY);
        });
    });
});
