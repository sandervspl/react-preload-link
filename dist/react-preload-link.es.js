import React from 'react';
import PT from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

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

var noop = function noop() {};

// lifecycle constants
var SET_LOADING = 'setLoading';
var SET_SUCCESS = 'setSuccess';
var SET_FAILED = 'setFailed';

// let Preload Link know the fetch failed with this constant
var PRELOAD_FAIL = 'preloadLink/fail';

var PreloadLink$1 = function (_React$Component) {
    inherits(PreloadLink, _React$Component);

    function PreloadLink() {
        var _ref;

        var _temp, _this, _ret;

        classCallCheck(this, PreloadLink);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = PreloadLink.__proto__ || Object.getPrototypeOf(PreloadLink)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            loading: false
        }, _this.setLoading = function () {
            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
            return _this.setState({ loading: true }, function () {
                return callback();
            });
        }, _this.setLoaded = function () {
            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : noop;
            return _this.setState({ loading: false }, function () {
                return callback();
            });
        }, _this.update = function (state) {
            var method = PreloadLink[state];

            // execution of lifecycle methods
            var execute = function execute(fn) {
                if (!fn) return;

                if (typeof fn !== 'function') {
                    console.error('PreloadLink: Method for lifecycle \'' + state + '\' is not a function.');
                } else {
                    fn();
                }
            };

            // update state and call lifecycle method
            if (_this.props[state]) {
                // the override prop returns a function with the default lifecycle method as param.
                _this.props[state](function () {
                    return execute(method);
                });
                _this.setLoading();
            } else {
                _this.setLoading(function () {
                    return execute(method);
                });
            }
        }, _this.navigate = function () {
            var _this$props = _this.props,
                history = _this$props.history,
                to = _this$props.to;


            history.push(to);
        }, _this.prepareNavigation = function () {
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
                var preloadFailed = isArray ? result.includes(PRELOAD_FAIL) : result === PRELOAD_FAIL;

                if (preloadFailed) {
                    _this.update(SET_FAILED);
                    _this.setLoaded();
                } else {
                    _this.update(SET_SUCCESS);
                    _this.setLoaded(function () {
                        return _this.navigate();
                    });
                }
            }).catch(function () {
                // loading failed. Set in- and external states to reflect this
                _this.update(SET_FAILED);
                _this.setLoaded();
            });
        }, _this.handleClick = function (e) {
            // prevents navigation
            e.preventDefault();

            // fire external loading method
            _this.update(SET_LOADING);

            if (!_this.state.loading) {
                // set internal loading state and prepare to navigate
                _this.setLoading(function () {
                    return _this.prepareNavigation();
                });
            }
        }, _temp), possibleConstructorReturn(_this, _ret);
    }

    // Initialize the lifecycle functions of page loading.


    // update fetch state and execute lifecycle methods


    // navigate with react-router to new URL


    // prepares the page transition. Wait on all promises to resolve before changing route.


    createClass(PreloadLink, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                to = _props.to,
                children = _props.children;

            return React.createElement(
                Link,
                { to: to, onClick: this.handleClick },
                children
            );
        }
    }]);
    return PreloadLink;
}(React.Component);

PreloadLink$1.init = function (_ref2) {
    var setLoading = _ref2.setLoading,
        setSuccess = _ref2.setSuccess,
        setFailed = _ref2.setFailed;

    PreloadLink$1[SET_LOADING] = setLoading;
    PreloadLink$1[SET_SUCCESS] = setSuccess;
    PreloadLink$1[SET_FAILED] = setFailed;
};

PreloadLink$1.propTypes = {
    children: PT.any,
    history: PT.shape({
        // eslint-disable-next-line react/no-unused-prop-types
        push: PT.func
    }),
    load: PT.oneOfType([PT.func, PT.arrayOf(PT.func)]).isRequired,
    to: PT.string.isRequired,
    /* eslint-disable react/no-unused-prop-types */
    setLoading: PT.func,
    setSuccess: PT.func,
    setFailed: PT.func
    /* eslint-enable */
};

PreloadLink$1.defaultProps = {
    setLoading: null,
    setSuccess: null,
    setFailed: null
};

// component initialization function
var PreloadLinkInit = PreloadLink$1.init;

// component
var PreloadLink$2 = withRouter(PreloadLink$1);

export { PRELOAD_FAIL, PreloadLinkInit };
export default PreloadLink$2;
