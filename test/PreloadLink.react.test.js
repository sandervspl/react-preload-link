/* eslint-disable no-undef */
import React, { Fragment } from 'react';
import { MemoryRouter as Router, withRouter } from 'react-router-dom';
import { mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';
import * as ReactPL from 'react-preload-link';

const PreloadLink = withRouter(ReactPL.PreloadLinkComponent);

// configure enzyme
configure({ adapter: new Adapter() });

// configure jest
jest.setTimeout(200);

// constants
const LOAD_DELAY = 100;

describe('<PreloadLink>', () => {
    let wrapper;
    let clock;
    let resolves;

    const PreloadLinkObj = PreloadLink.WrappedComponent;

    const timeoutFn = () => new Promise((resolve) => setTimeout(() => {
        resolves.push(true);
        resolve(1);
    }, LOAD_DELAY));

    const timeoutFnFail = () => new Promise((_, reject) => (
        setTimeout(() => reject(), LOAD_DELAY)
    ));

    const getPreloadLink = () => (
        wrapper.find(PreloadLink)
    );

    const getPathname = () => (
        wrapper.instance().history.location.pathname
    );

    const mountWithRouter = (Component, props) => {
        wrapper = mount(
            <Router {...props}>
                {Component}
            </Router>
        )
    };

    const click = () => getPreloadLink().simulate('click');

    beforeEach(() => {
        ReactPL.configure({});
        resolves = [];
        clock = sinon.useFakeTimers();

        console.error = jest.fn();
    });

    afterEach(() => {
        clock.restore();
        console.error.mockClear();
    });

    it('Renders a <PreloadLink> component', () => {
        mountWithRouter(<PreloadLink to="page1" />);
        expect(getPreloadLink().length).toEqual(1);
    });

    describe('Props', () => {
        it('noInterrupt default value is false', () => {
            expect(PreloadLink.WrappedComponent.defaultProps.noInterrupt).toEqual(false);
        });

        it('Calls onLoading/onSuccess/onNavigate prop callback functions', (done) => {
            expect.assertions(1);

            const fn = sinon.spy();

            mountWithRouter(
                <PreloadLink
                    to="page1"
                    load={timeoutFn}
                    onLoading={fn}
                    onSuccess={fn}
                    onNavigate={fn}
                />
            );

            click();
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn.callCount).toEqual(3);
                done();
            });
        });

        it('Calls onLoading/onFail prop callback functions', (done) => {
            expect.assertions(1);

            const fn = sinon.spy();

            mountWithRouter(
                <PreloadLink
                    to="page1"
                    load={timeoutFnFail}
                    onLoading={fn}
                    onFail={fn}
                />
            );

            click();
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn.callCount).toEqual(2);
                done();
            });
        });

        it('Receive related function from configure on lifecycle prop functions', (done) => {
            expect.assertions(3);

            const fnLoad = sinon.spy();
            const fnSuccess = sinon.spy();
            const fnOnNavigate = sinon.spy();

            const handleLoading = (load) => load();
            const handleSuccess = (success) => success();
            const handleNavigate = (navigate) => navigate();

            ReactPL.configure({
                onLoading: fnLoad,
                onSuccess: fnSuccess,
                onNavigate: fnOnNavigate,
            });

            mountWithRouter(
                <PreloadLink
                    to="/page1"
                    load={timeoutFn}
                    onLoading={handleLoading}
                    onSuccess={handleSuccess}
                    onNavigate={handleNavigate}
                />
            );

            click();
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fnLoad.calledOnce).toBe(true);
                expect(fnSuccess.calledOnce).toBe(true);
                expect(fnOnNavigate.calledOnce).toBe(true);
                done();
            });
        });

        it('Receives related function from configure on onFail lifecycle prop function', (done) => {
            expect.assertions(1);

            const fnFail = sinon.spy();
            const handleFail = (fail) => fail();

            ReactPL.configure({
                onFail: fnFail,
            });

            mountWithRouter(
                <PreloadLink
                    to="/page1"
                    load={timeoutFnFail}
                    onFail={handleFail}
                />
            );

            click();
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fnFail.calledOnce).toBe(true);
                done();
            });
        });

        it('Has no activeClassName as NavLink on different route', () => {
            mountWithRouter(
                <PreloadLink
                    to="/page1"
                    navLink
                    activeClassName="active"
                />
            );

            expect(getPreloadLink()
                .hasClass('active'))
                .toBe(false);
        });

        it('Has the activeClassName as NavLink on active route', () => {
            mountWithRouter(
                <PreloadLink
                    to="/"
                    navLink
                    activeClassName="active"
                />
            );

            expect(getPreloadLink()
                .render()
                .hasClass('active'))
                .toBe(true);
        });

        it('Has the activeClassName as NavLink after navigating to route', () => {
            mountWithRouter(
                <PreloadLink
                    to="/page"
                    navLink
                    activeClassName="active"
                />
            );

            expect(getPreloadLink()
                .render()
                .hasClass('active'))
                .toBe(false);

            click();

            expect(getPreloadLink()
                .render()
                .hasClass('active'))
                .toBe(true);
        });

        it('Is an NavLink when only an activeClassName is passed', () => {
            mountWithRouter(<PreloadLink to="/" activeClassName="active" />);

            expect(getPreloadLink()
                .render()
                .hasClass('active'))
                .toBe(true);
        });

        it('Calls onClick function', () => {
            const fn = sinon.spy();
            mountWithRouter(<PreloadLink to="/page1" onClick={fn} />);

            click();

            expect(fn.calledOnce).toBe(true);
        });

        it('Logs an error when a hook is not a function', () => {
            mountWithRouter(<PreloadLink to="/page1" load={timeoutFn} onLoading={1} />);
            click();
            clock.tick(LOAD_DELAY);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Configuration', () => {
        beforeEach(() => {
            mountWithRouter(<PreloadLink to="page1" load={timeoutFn} />);
        });

        it('Does not crash without configuration', (done) => {
            expect.assertions(1);

            click();
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

            ReactPL.configure({
                onLoading: fn1,
                onSuccess: fn1,
                onFail: fn2,
                onNavigate: fn1,
            });

            click();
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn1.calledThrice).toBe(true);
                expect(fn2.notCalled).toBe(true);
                done();
            });
        });

        it('Calls correct lifecycle hook on failed navigation', (done) => {
            mountWithRouter(<PreloadLink to="page1" load={timeoutFnFail} />);

            expect.assertions(2);

            const fn1 = sinon.spy();
            const fn2 = sinon.spy();

            ReactPL.configure({
                onLoading: fn1,
                onSuccess: fn1,
                onFail: fn2,
            });

            click();
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn1.calledOnce).toBe(true);
                expect(fn2.calledOnce).toBe(true);

                done();
            });
        });

        it('Calls onNavigate after navigation', (done) => {
            mountWithRouter(<PreloadLink to="page1" load={timeoutFn} />);
            const fn = sinon.spy();

            expect.assertions(2);

            ReactPL.configure({
                onNavigate: fn,
            });

            click();
            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn.called).toBe(true);
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Logs an error when a hook is not a function', () => {
            ReactPL.configure({
                onLoading: 1,
            });
            mountWithRouter(<PreloadLink to="/page1" load={timeoutFn} />);
            click();
            clock.tick(LOAD_DELAY);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Navigating', () => {
        it('Directly navigates to "/page1" after a click without load function', () => {
            mountWithRouter(<PreloadLink to="page1" />);
            click();

            expect(getPathname()).toEqual('/page1');
        });

        it(`Navigates to "/page1" after ${LOAD_DELAY}ms with timeout function`, (done) => {
            expect.assertions(2);

            mountWithRouter(<PreloadLink to="page1" load={timeoutFn} />);

            click();

            expect(getPathname()).not.toEqual('/page1');

            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Is impossible to interrupt an uninterruptable link', (done) => {
            expect.assertions(6);

            const loadCb = sinon.spy();
            mountWithRouter(
                <Fragment>
                    <PreloadLink to="page1" noInterrupt load={timeoutFn} />
                    <PreloadLink to="page2" load={loadCb} />
                </Fragment>
            );

            getPreloadLink().at(0).simulate('click'); // with noInterrupt
            getPreloadLink().at(1).simulate('click'); // without

            expect(PreloadLinkObj.process.busy).toBe(true);
            expect(PreloadLinkObj.process.canCancel).toBe(false);
            expect(loadCb.notCalled).toBe(true);

            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(PreloadLinkObj.process.busy).toBe(false);
                expect(PreloadLinkObj.process.canCancel).toBe(true);
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Waits for all load Promises to resolve before navigating', (done) => {
            expect.assertions(3);

            mountWithRouter(<PreloadLink to="page1" load={[timeoutFn, timeoutFn]} />);

            click();

            expect(getPathname()).not.toEqual('/page1');

            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(resolves.length).toEqual(2);
                expect(getPathname()).toEqual('/page1');
                done();
            });
        });

        it('Safely fails when a Promise from an array rejects', (done) => {
            const fn = sinon.spy();

            ReactPL.configure({
                onFail: fn,
            });

            mountWithRouter(<PreloadLink to="page1" load={[timeoutFn, timeoutFnFail]} />);

            click();

            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(fn.calledOnce).toBe(true);
                done();
            });
        });

        it('Returns correct data from loadMiddleware', (done) => {
            expect.assertions(1);

            const loadFn = () => new Promise((resolve) => resolve(10));
            const loadMiddleware = (data) => {
                expect(data).toEqual(10);
                done();
            };

            mountWithRouter(
                <PreloadLink
                    to="page1"
                    load={loadFn}
                    loadMiddleware={loadMiddleware}
                />
            );

            click();
        });
    });

    describe('PreloadLink process', () => {
        it('Does not fire onClick method if process is busy and can\'t cancel', () => {
            const onClickFn = sinon.spy();

            mountWithRouter(
                <Fragment>
                    <PreloadLink to="page1" noInterrupt load={timeoutFn} />
                    <PreloadLink to="page2" onClick={onClickFn} />
                </Fragment>
            );

            getPreloadLink().at(0).simulate('click');
            getPreloadLink().at(1).simulate('click');

            clock.tick(LOAD_DELAY);

            expect(onClickFn.called).toBe(false);
        });

        it('Correctly sets cancelUid', (done) => {
            expect.assertions(1);

            let uid;

            mountWithRouter(
                <Fragment>
                    <PreloadLink to="page1" load={timeoutFn} />
                    <PreloadLink to="page2" load={timeoutFn} />
                </Fragment>
            );

            getPreloadLink().at(0).simulate('click'); // with noInterrupt
            uid = PreloadLinkObj.process.uid;

            getPreloadLink().at(1).simulate('click'); // without

            process.nextTick(() => {
                expect(PreloadLinkObj.process.cancelUid).toEqual(uid);
                clock.tick(LOAD_DELAY);
                done();
            });
        });

        it('Correctly sets process canCancel to false', () => {
            mountWithRouter(
                <PreloadLink
                    to="page2"
                    load={timeoutFn}
                    noInterrupt
                />
            );

            click();

            expect(PreloadLinkObj.process.canCancel).toBe(false);
        });

        it('Does not continue load process if uid == cancelUid', (done) => {
            expect.assertions(1);

            const successFn = sinon.spy();

            mountWithRouter(
                <Fragment>
                    <PreloadLink to="page1" load={timeoutFn} onSuccess={successFn} />
                    <PreloadLink to="page2" load={timeoutFn} />
                </Fragment>
            );

            getPreloadLink().at(0).simulate('click');
            getPreloadLink().at(1).simulate('click');

            clock.tick(LOAD_DELAY);

            process.nextTick(() => {
                expect(successFn.calledOnce).toBe(false);
                done();
            });
        });
    });
});
