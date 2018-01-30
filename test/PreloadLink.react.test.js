/* eslint-disable no-undef */
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router } from 'react-router-dom';
// import * as renderer from 'react-test-renderer';
import { shallow, mount, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import PreloadLink, * as pll from 'react-preload-link';
import Root from '../examples/src/Root';

// configure enzyme
configure({ adapter: new Adapter() });

describe('App', () => {
    it('Renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Root />, div);
    });
});

describe('<PreloadLink>', () => {
    let component;
    let instance;

    const timeoutFn = () => new Promise((resolve) => setTimeout(() => resolve(), 1000));
    const getPreloadLink = () => component.find(PreloadLink);
    const getPathname = () => component.instance().history.location.pathname;

    describe('[to="page2"]', () => {
        beforeEach(() => {
            component = mount(
                <Router>
                    <PreloadLink to="page2" />
                </Router>
            );

            instance = getPreloadLink();
        });

        it('Renders a <PreloadLink> component', () => {
            expect(instance.length).toEqual(1);
        });

        it('Prop "to" is "page2"', () => {
            expect(instance.prop('to')).toEqual('page2');
        });

        it('Changes route to "page2" after a click', () => {
            instance.simulate('click');
            expect(getPathname()).toEqual('/page2');
        });
    });

    describe('[noInterrupt=true]', () => {
        beforeEach(() => {
            component = mount(
                <Router>
                    <Fragment>
                        <PreloadLink to="/" noInterrupt load={timeoutFn} />
                        <PreloadLink to="/page2" />
                    </Fragment>
                </Router>
            );

            instance = getPreloadLink();
        });

        it('Prop "noInterrupt" is "true"', () => {
            expect(instance.at(0).prop('noInterrupt')).toEqual(true);
        });

        it('Clicking a link does not interrupt a noInterrupt link', () => {
            instance.at(0).simulate('click');
            instance.at(1).simulate('click');

            expect(getPathname()).not.toEqual('/page2');
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
