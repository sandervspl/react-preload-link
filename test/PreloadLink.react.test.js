/* eslint-disable no-undef */
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router } from 'react-router-dom';
import { shallow, mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';

import PreloadLink, * as pll from 'react-preload-link';
import Root from '../examples/src/Root';

// configure enzyme
configure({ adapter: new Adapter() });

// configure jest
jest.useFakeTimers();

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

    const timeoutFn = () => new Promise((resolve) => setTimeout(() => resolve(), LOAD_DELAY));
    const getPreloadLink = () => wrapper.find(PreloadLink);
    const getPathname = () => wrapper.instance().history.location.pathname;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        pll.configure({});
        clock.restore();
    });

    describe('Props', () => {
        beforeEach(() => {
            wrapper = mount(
                <Router>
                    <Fragment>
                        <PreloadLink to="page1" />
                        <PreloadLink to="page2" noInterrupt />
                        <PreloadLink to="page3" load={timeoutFn} />
                    </Fragment>
                </Router>
            );

            link = getPreloadLink();
        });

        it('Renders a <PreloadLink> component', () => {
            expect(link.at(0).length).toEqual(1);
        });

        it('Prop "noInterrupt" default is "false"', () => {
            expect(PreloadLink.WrappedComponent.defaultProps.noInterrupt).toEqual(false);
        });
    });

    describe('Configuration', () => {
        it('Does not crash without configuration', (done) => {
            expect.assertions(1);

            pll.configure({
                onNavigate: () => {
                    expect(getPathname()).toEqual('/page3');
                    done();
                },
            });

            link.at(2).simulate('click');

            clock.tick(LOAD_DELAY);
        });
    });

    describe('Navigating', () => {
        beforeEach(() => {
            wrapper = mount(
                <Router>
                    <Fragment>
                        <PreloadLink to="page1" />
                        <PreloadLink to="page2" load={timeoutFn} />
                        <PreloadLink to="page3" noInterrupt load={timeoutFn} />
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
            expect.assertions(1);

            pll.configure({
                onNavigate: () => {
                    expect(getPathname()).toEqual('/page2');
                    done();
                },
            });

            link.at(1).simulate('click');

            clock.tick(LOAD_DELAY);
        });

        it('Clicking a link does not interrupt a noInterrupt link', (done) => {
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

        it('Wait for all load functions before navigating');
    });
});
