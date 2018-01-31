(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('prop-types'), require('react-router-dom')) :
	typeof define === 'function' && define.amd ? define(['react', 'prop-types', 'react-router-dom'], factory) :
	(global.PreloadLink = factory(global.React,global.PropTypes,global.ReactRouterDOM));
}(this, (function (React,PT,reactRouterDom) { 'use strict';

React = React && React.hasOwnProperty('default') ? React['default'] : React;
PT = PT && PT.hasOwnProperty('default') ? PT['default'] : PT;

var idCounter = 0;

var noop = function noop() {};

// eslint-disable-next-line no-plusplus
var uuid = function uuid() {
  return ++idCounter;
};

// eslint-disable-next-line
var ON_LOADING = 'onLoading';
var ON_SUCCESS = 'onSuccess';
var ON_FAIL = 'onFail';
var ON_NAVIGATE = 'onNavigate';
var PRELOAD_FAIL$1 = 'preloadLink/fail';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

// let Preload Link know the fetch failed with this constant
var PRELOAD_FAIL = PRELOAD_FAIL$1;
var PreloadLink$1 = function (_React$Component) {
    inherits(PreloadLink, _React$Component);

    function PreloadLink() {
        classCallCheck(this, PreloadLink);

        var _this = possibleConstructorReturn(this, (PreloadLink.__proto__ || Object.getPrototypeOf(PreloadLink)).call(this));

        _this.setLoading = function () {
            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
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
            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;

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

            if (PreloadLink[ON_NAVIGATE]) {
                PreloadLink[ON_NAVIGATE]();
            }
        };

        _this.handleFailed = function () {
            _this.update(ON_FAIL);
            _this.setLoaded();
        };

        _this.returnsPromise = function (fn) {
            var obj = fn();
            return Promise.resolve(obj) === obj;
        };

        _this.prepareNavigation = function () {
            var process = PreloadLink.process;
            var load = _this.props.load;

            var isArray = Array.isArray(load);
            var toLoad = void 0;

            // create functions of our load props
            if (isArray) {
                var loadList = [];
                for (var i = 0; i < load.length; i += 1) {
                    var fn = load[i];

                    if (!_this.returnsPromise(fn)) {
                        console.error('Error: Not all given functions are returning a Promise. Aborting navigation. ');
                        return _this.handleFailed();
                    }

                    loadList.push(fn);
                }

                toLoad = Promise.all(loadList);
            } else {
                if (!_this.returnsPromise(load)) {
                    console.error('Error: Given load function does not return a Promise. Aborting navigation. ');
                    return _this.handleFailed();
                }

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
                    _this.handleFailed();
                } else {
                    _this.update(ON_SUCCESS);
                    _this.setLoaded(function () {
                        return _this.navigate();
                    });
                }
            }).catch(function () {
                // loading failed. Set in- and external states to reflect this
                _this.handleFailed();
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
                _this.update(ON_LOADING);

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

        _this.uid = uuid();
        return _this;
    }

    // Initialize the lifecycle hooks


    // update fetch state and execute lifecycle hooks


    // navigate with react-router to new URL


    // prepares the page transition. Wait on all promises to resolve before changing route.


    createClass(PreloadLink, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                to = _props.to,
                children = _props.children;

            return React.createElement(
                reactRouterDom.Link,
                { to: to, onClick: this.handleClick },
                children
            );
        }
    }]);
    return PreloadLink;
}(React.Component);

PreloadLink$1.process = {
    uid: 0,
    busy: false,
    cancelUid: 0,
    canCancel: true
};

PreloadLink$1.init = function (options) {
    PreloadLink$1[ON_LOADING] = options.onLoading;
    PreloadLink$1[ON_SUCCESS] = options.onSuccess;
    PreloadLink$1[ON_FAIL] = options.onFail;
    PreloadLink$1[ON_NAVIGATE] = options.onNavigate;
};

PreloadLink$1.propTypes = {
    children: PT.any,
    history: PT.shape({
        // eslint-disable-next-line react/no-unused-prop-types
        push: PT.func
    }),
    load: PT.oneOfType([PT.func, PT.arrayOf(PT.func)]),
    to: PT.string.isRequired,
    /* eslint-disable react/no-unused-prop-types */
    onLoading: PT.func,
    onSuccess: PT.func,
    onFail: PT.func,
    /* eslint-enable */
    noInterrupt: PT.bool
};

PreloadLink$1.defaultProps = {
    onLoading: null,
    onSuccess: null,
    onFail: null,
    noInterrupt: false
};

// component initialization function
var configure = PreloadLink$1.init;

// component
var PreloadLink$2 = reactRouterDom.withRouter(PreloadLink$1);

PreloadLink$2.PRELOAD_FAIL = PRELOAD_FAIL$1;
PreloadLink$2.configure = configure;

return PreloadLink$2;

})));
