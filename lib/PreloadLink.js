'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.configure = exports.PRELOAD_FAIL = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouterDom = require('react-router-dom');

var _helpers = require('./helpers');

var _constants = require('./constants');

var c = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// let Preload Link know the fetch failed with this constant
var PRELOAD_FAIL = c.PRELOAD_FAIL;
exports.PRELOAD_FAIL = PRELOAD_FAIL;

var PreloadLink = function (_React$Component) {
    _inherits(PreloadLink, _React$Component);

    function PreloadLink() {
        _classCallCheck(this, PreloadLink);

        var _this = _possibleConstructorReturn(this, (PreloadLink.__proto__ || Object.getPrototypeOf(PreloadLink)).call(this));

        _this.setLoading = function () {
            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _helpers.noop;
            var process = PreloadLink.process;
            var noInterrupt = _this.props.noInterrupt;


            if (!noInterrupt && process.busy && process.uid !== _this.uid) {
                process.cancelUid = process.uid;
            } else if (noInterrupt) {
                // any further clicks can not cancel this process
                process.canCancel = false;
            }

            PreloadLink.process = _extends({}, process, {
                uid: _this.uid,
                busy: true
            });

            _this.setState({ loading: true }, function () {
                return callback();
            });
        };

        _this.setLoaded = function () {
            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _helpers.noop;

            // reset for further navigation
            if (!PreloadLink.process.canCancel) {
                PreloadLink.process.canCancel = true;
            }

            PreloadLink.process = _extends({}, PreloadLink.process, {
                uid: 0,
                busy: false
            });

            _this.setState({ loading: false }, function () {
                return callback();
            });
        };

        _this.update = function (state) {
            var method = PreloadLink[state];

            // execution of lifecycle hooks
            var execute = function execute(fn) {
                if (!fn) return;

                if (typeof fn !== 'function') {
                    console.error('PreloadLink: Method for lifecycle \'' + state + '\' is not a function.');
                } else {
                    fn();
                }
            };

            // update state and call lifecycle hook
            if (_this.props[state]) {
                // the override prop returns a function with the default lifecycle hooks as param.
                _this.props[state](function () {
                    return execute(method);
                });
                _this.setLoading();
            } else {
                _this.setLoading(function () {
                    return execute(method);
                });
            }
        };

        _this.navigate = function () {
            var _this$props = _this.props,
                history = _this$props.history,
                to = _this$props.to;


            history.push(to);

            if (PreloadLink[c.ON_NAVIGATE]) {
                PreloadLink[c.ON_NAVIGATE]();
            }
        };

        _this.prepareNavigation = function () {
            var process = PreloadLink.process;
            var load = _this.props.load;

            var isArray = Array.isArray(load);
            var toLoad = void 0;

            // create functions of our load props
            if (isArray) {
                var loadList = load.map(function (fn) {
                    return fn();
                });
                toLoad = Promise.all(loadList);
            } else {
                toLoad = load();
            }

            // wait for all async functions to resolve
            // set in- and external loading states and proceed to navigation if successful
            toLoad.then(function (result) {
                // do not perform further navigation if this was ordered for cancel
                if (process.cancelUid === _this.uid) {
                    return;
                }

                var preloadFailed = isArray ? result.includes(PRELOAD_FAIL) : result === PRELOAD_FAIL;

                if (preloadFailed) {
                    _this.update(c.ON_FAIL);
                    _this.setLoaded();
                } else {
                    _this.update(c.ON_SUCCESS);
                    _this.setLoaded(function () {
                        return _this.navigate();
                    });
                }
            }).catch(function () {
                // loading failed. Set in- and external states to reflect this
                _this.update(c.ON_FAIL);
                _this.setLoaded();
            });
        };

        _this.handleClick = function (e) {
            var process = PreloadLink.process;

            // prevents navigation

            e.preventDefault();

            // prevent navigation if we can't override a load with a new click
            if (process.busy && !process.canCancel) return;

            if (!_this.props.load) {
                // nothing to load -- we can navigate
                _this.navigate();
            } else {
                // fire external loading method
                _this.update(c.ON_LOADING);

                if (!_this.state.loading) {
                    // set internal loading state and prepare to navigate
                    _this.setLoading(function () {
                        return _this.prepareNavigation();
                    });
                }
            }
        };

        _this.state = {
            loading: false
        };

        _this.uid = (0, _helpers.uuid)();
        return _this;
    }

    // Initialize the lifecycle hooks


    // update fetch state and execute lifecycle hooks


    // navigate with react-router to new URL


    // prepares the page transition. Wait on all promises to resolve before changing route.


    _createClass(PreloadLink, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                to = _props.to,
                children = _props.children;

            return _react2.default.createElement(
                _reactRouterDom.Link,
                { to: to, onClick: this.handleClick },
                children
            );
        }
    }]);

    return PreloadLink;
}(_react2.default.Component);

PreloadLink.process = {
    uid: 0,
    busy: false,
    cancelUid: 0,
    canCancel: true
};

PreloadLink.init = function (options) {
    PreloadLink[c.ON_LOADING] = options.onLoading;
    PreloadLink[c.ON_SUCCESS] = options.onSuccess;
    PreloadLink[c.ON_FAIL] = options.onFail;
    PreloadLink[c.ON_NAVIGATE] = options.onNavigate;
};

PreloadLink.propTypes = {
    children: _propTypes2.default.any,
    history: _propTypes2.default.shape({
        // eslint-disable-next-line react/no-unused-prop-types
        push: _propTypes2.default.func
    }),
    load: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.arrayOf(_propTypes2.default.func)]),
    to: _propTypes2.default.string.isRequired,
    /* eslint-disable react/no-unused-prop-types */
    onLoading: _propTypes2.default.func,
    onSuccess: _propTypes2.default.func,
    onFail: _propTypes2.default.func,
    /* eslint-enable */
    noInterrupt: _propTypes2.default.bool
};

PreloadLink.defaultProps = {
    onLoading: null,
    onSuccess: null,
    onFail: null,
    noInterrupt: false
};

// component initialization function
var configure = exports.configure = PreloadLink.init;

// component
exports.default = (0, _reactRouterDom.withRouter)(PreloadLink);