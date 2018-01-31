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

describe('App', () => {
    it('Renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Root />, div);
    });
});

describe('<PreloadLink>', () => {
    let wrapper;
    let link;

    const timeoutFn = () => new Promise((resolve) => setTimeout(() => {
        console.log('timeoutFn resolve');
        resolve();
    }, 100));
    const getPreloadLink = () => wrapper.find(PreloadLink);
    const getPathname = () => wrapper.instance().history.location.pathname;

    describe('[to="page2"]', () => {
        beforeEach(() => {
            wrapper = mount(
                <Router>
                    <PreloadLink to="page2" />
                </Router>
            );

            link = getPreloadLink();
        });

        it('Renders a <PreloadLink> component', () => {
            expect(link.length).toEqual(1);
        });

        it('Prop "to" is "page2"', () => {
            expect(link.prop('to')).toEqual('page2');
        });

        it('Changes route to "page2" after a click', () => {
            link.simulate('click');
            expect(getPathname()).toEqual('/page2');
        });
    });

    describe('[noInterrupt=true]', () => {
        let clock;

        beforeEach(() => {
            clock = sinon.useFakeTimers();

            wrapper = mount(
                <Router>
                    <Fragment>
                        <PreloadLink to="page1" noInterrupt load={timeoutFn} />
                        <PreloadLink to="page2" />
                    </Fragment>
                </Router>
            );

            link = getPreloadLink();
        });

        afterEach(() => {
            clock.restore();
        });

        it('Prop "noInterrupt" is "true"', () => {
            expect(link.at(0).prop('noInterrupt')).toEqual(true);
        });

        it('Navigate to "/page2" after 100ms', (done) => {
            expect.assertions(1);

            pll.configure({
                onNavigate: () => {
                    expect(getPathname()).toEqual('/page2');
                    done();
                },
            });

            link.at(1).simulate('click');

            clock.tick(100);
        });

        it('Clicking a link does not interrupt a noInterrupt link', (done) => {
            expect.assertions(1);

            pll.configure({
                onNavigate: () => {
                    expect(getPathname()).toEqual('/page1');
                    done();
                },
            });

            link.at(0).simulate('click');
            link.at(1).simulate('click');

            clock.tick(100);
        });
    });
});

// describe('<PreloadLink to="/" noInterrupt />', () => {
//     let component;
//     let instance;
//
//     beforeEach(() => {
//         component = shallow(<Router>
//             <PreloadLink to="/" noInterrupt />
//         </Router>);
//     });
//
//     const getPreloadLink = () => component.find(PreloadLink);
//
//     it('"noInterrupt" is true', () => {
//         instance = getPreloadLink();
//         expect(instance.prop('noInterrupt')).toEqual(true);
//     });
// });
//
// describe('PreloadLink with hook override props', () => {
//     let component;
//     let instance;
//
//     const getPreloadLink = () => component.find(PreloadLink);
//
//     beforeEach(() => {
//         component = shallow(<Router>
//             <PreloadLink to="/" noInterrupt />
//         </Router>);
//     });
//
//     it('<PreloadLink onLoading={fn} /> has prop', () => {
//         instance = getPreloadLink();
//         expect(instance.prop('onLoading')).not.toEqual(null);
//     });
//
//     it('<PreloadLink onSuccess={fn} /> has prop', () => {
//         instance = getPreloadLink();
//         expect(instance.prop('onSuccess')).not.toEqual(null);
//     });
//
//     it('<PreloadLink onFail={fn} /> has prop', () => {
//         instance = getPreloadLink();
//         expect(instance.prop('onFail')).not.toEqual(null);
//     });
// });
//
// describe('Configuration', () => {
//     const Class = PreloadLink.WrappedComponent;
//
//     it('Has a function for "onLoading"', () => {
//         pll.configure({
//             onLoading: () => {},
//         });
//
//         expect(Class.onLoading).not.toEqual(undefined);
//         expect(Class.onSuccess).toEqual(undefined);
//         expect(Class.onFail).toEqual(undefined);
//     });
//
//     it('Has a function for "onLoading", "onSuccess"', () => {
//         pll.configure({
//             onLoading: () => {},
//             onSuccess: () => {},
//         });
//
//         expect(Class.onLoading).not.toEqual(undefined);
//         expect(Class.onSuccess).not.toEqual(undefined);
//         expect(Class.onFail).toEqual(undefined);
//     });
//
//     it('Has a function for "onLoading", "onSuccess", "onFail"', () => {
//         pll.configure({
//             onLoading: () => {},
//             onSuccess: () => {},
//             onFail: () => {},
//         });
//
//         expect(Class.onLoading).not.toEqual(undefined);
//         expect(Class.onSuccess).not.toEqual(undefined);
//         expect(Class.onFail).not.toEqual(undefined);
//     });
// });
