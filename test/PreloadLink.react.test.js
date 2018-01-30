/* eslint-disable no-undef */
import React from 'react';
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

    const getPreloadLink = () => component.find(PreloadLink);

    describe('[to="/"]', () => {
        beforeEach(() => {
            component = mount(
                <Router>
                    <PreloadLink to="/" />
                </Router>
            );

            instance = getPreloadLink();
        });

        it('Renders a <PreloadLink> component', () => {
            expect(instance.length).toEqual(1);
        });

        it('"to" is "/"', () => {
            expect(instance.prop('to')).toEqual('/');
        });
    });

    const url = '/page2';
    describe(`[to="${url}"]`, () => {
        beforeEach(() => {
            component = mount(
                <Router>
                    <PreloadLink to={url} />
                </Router>
            );

            instance = getPreloadLink();
        });

        it(`Changes route to "${url}" after click`, () => {
            instance.simulate('click');
            expect(component.instance().history.location.pathname).toEqual(url);
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
