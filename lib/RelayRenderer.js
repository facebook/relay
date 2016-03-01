/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRenderer
 * @typechecks
 * 
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var RelayFragmentPointer = require('./RelayFragmentPointer');
var React = require('react');

var RelayPropTypes = require('./RelayPropTypes');
var RelayStore = require('./RelayStore');

var StaticContainer = require('react-static-container');

var getRelayQueries = require('./getRelayQueries');
var invariant = require('fbjs/lib/invariant');
var mapObject = require('fbjs/lib/mapObject');

var PropTypes = React.PropTypes;

/**
 * @public
 *
 * RelayRenderer renders a container and query config after fulfilling its data
 * dependencies. Precise rendering behavior is configured via the `render` prop
 * which takes a callback.
 *
 * The container created using `Relay.createContainer` must be supplied via the
 * `Container` prop, and the query configuration that conforms to the shape of a
 * `RelayQueryConfig` must be supplied via the `queryConfig` prop.
 *
 * === Render Callback ===
 *
 * The `render` callback is called with an object with the following properties:
 *
 *   props: ?Object
 *     If present, sufficient data is ready to render the container. This object
 *     must be spread into the container using the spread attribute operator. If
 *     absent, there is insufficient data to render the container.
 *
 *   done: boolean
 *     Whether all data dependencies have been fulfilled. If `props` is present
 *     but `done` is false, then sufficient data is ready to render, but some
 *     data dependencies have not yet been fulfilled.
 *
 *   error: ?Error
 *     If present, an error occurred while fulfilling data dependencies. If
 *     `props` and `error` are both present, then sufficient data is ready to
 *     render, but an error occurred while fulfilling deferred dependencies.
 *
 *   retry: ?Function
 *     A function that can be called to re-attempt to fulfill data dependencies.
 *     This property is only present if an `error` has occurred.
 *
 *   stale: boolean
 *     When `forceFetch` is enabled, a request is always made to fetch updated
 *     data. However, if all data dependencies can be immediately fulfilled, the
 *     `props` property will be present. In this case, `stale` will be true.
 *
 * The `render` callback can return `undefined` to continue rendering the last
 * view rendered (e.g. when transitioning from one `queryConfig` to another).
 *
 * If a `render` callback is not supplied, the default behavior is to render the
 * container if data is available, the existing view if one exists, or nothing.
 *
 * === Refs ===
 *
 * References to elements rendered by the `render` callback can be obtained by
 * using the React `ref` prop. For example:
 *
 *   <FooComponent {...props} ref={handleFooRef} />
 *
 *   function handleFooRef(component) {
 *     // Invoked when `<FooComponent>` is mounted or unmounted. When mounted,
 *     // `component` will be the component. When unmounted, `component` will
 *     // be null.
 *   }
 *
 */

var RelayRenderer = (function (_React$Component) {
  _inherits(RelayRenderer, _React$Component);

  function RelayRenderer(props, context) {
    _classCallCheck(this, RelayRenderer);

    _React$Component.call(this, props, context);
    var garbageCollector = RelayStore.getStoreData().getGarbageCollector();
    this.gcHold = garbageCollector && garbageCollector.acquireHold();
    this.mounted = true;
    this.pendingRequest = null;
    this.state = this._buildState(null, null, null, null);
  }

  /**
   * @private
   */

  RelayRenderer.prototype._buildState = function _buildState(activeContainer, activeQueryConfig, readyState, props) {
    var _this = this;

    return {
      activeContainer: activeContainer,
      activeQueryConfig: activeQueryConfig,
      readyState: readyState && _extends({}, readyState, { mounted: true }),
      renderArgs: {
        done: !!readyState && readyState.done,
        error: readyState && readyState.error,
        props: props,
        retry: function retry() {
          return _this._retry();
        },
        stale: !!readyState && readyState.stale
      }
    };
  };

  RelayRenderer.prototype.getChildContext = function getChildContext() {
    return {
      relay: RelayStore,
      route: this.props.queryConfig
    };
  };

  RelayRenderer.prototype.componentDidMount = function componentDidMount() {
    this._runQueries(this.props);
  };

  /**
   * @private
   */

  RelayRenderer.prototype._runQueries = function _runQueries(_ref) {
    var _this2 = this;

    var Container = _ref.Container;
    var forceFetch = _ref.forceFetch;
    var onForceFetch = _ref.onForceFetch;
    var onPrimeCache = _ref.onPrimeCache;
    var queryConfig = _ref.queryConfig;

    var querySet = getRelayQueries(Container, queryConfig);
    var onReadyStateChange = function onReadyStateChange(readyState) {
      if (!_this2.mounted) {
        _this2._handleReadyStateChange(_extends({}, readyState, { mounted: false }));
        return;
      }
      if (request !== _this2.pendingRequest) {
        // Ignore (abort) ready state if we have a new pending request.
        return;
      }
      if (readyState.aborted || readyState.done || readyState.error) {
        _this2.pendingRequest = null;
      }
      var props = _this2.state.renderArgs.props;

      if (readyState.ready && !props) {
        props = _extends({}, queryConfig.params, mapObject(querySet, createFragmentPointerForRoot));
      }
      _this2.setState(_this2._buildState(Container, queryConfig, readyState, props));
    };

    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }

    var request = this.pendingRequest = forceFetch ? onForceFetch ? onForceFetch(querySet, onReadyStateChange) : RelayStore.forceFetch(querySet, onReadyStateChange) : onPrimeCache ? onPrimeCache(querySet, onReadyStateChange) : RelayStore.primeCache(querySet, onReadyStateChange);
  };

  /**
   * Returns whether or not the view should be updated during the current render
   * pass. This is false between invoking `Relay.Store.{primeCache,forceFetch}`
   * and the first invocation of the `onReadyStateChange` callback if there is
   * an actively rendered container and query configuration.
   *
   * @private
   */

  RelayRenderer.prototype._shouldUpdate = function _shouldUpdate() {
    var _state = this.state;
    var activeContainer = _state.activeContainer;
    var activeQueryConfig = _state.activeQueryConfig;
    var Container = this.props.Container;

    return (!activeContainer || Container === activeContainer) && (!activeQueryConfig || this.props.queryConfig === activeQueryConfig);
  };

  /**
   * @private
   */

  RelayRenderer.prototype._runQueriesAndSetState = function _runQueriesAndSetState(props) {
    this._runQueries(props);
    this.setState(this._buildState(this.state.activeContainer, this.state.activeQueryConfig, null, null));
  };

  /**
   * @private
   */

  RelayRenderer.prototype._retry = function _retry() {
    var readyState = this.state.readyState;

    !(readyState && readyState.error) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRenderer: You tried to call `retry`, but the last request did ' + 'not fail. You can only call this when the last request has failed.') : invariant(false) : undefined;
    this._runQueriesAndSetState(this.props);
  };

  RelayRenderer.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.Container !== this.props.Container || nextProps.queryConfig !== this.props.queryConfig || nextProps.forceFetch && !this.props.forceFetch) {
      this._runQueriesAndSetState(nextProps);
    }
  };

  RelayRenderer.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    // `prevState` should exist; the truthy check is for Flow soundness.
    var readyState = this.state.readyState;

    if (readyState) {
      if (!prevState || readyState !== prevState.readyState) {
        this._handleReadyStateChange(readyState);
      }
    }
  };

  /**
   * @private
   */

  RelayRenderer.prototype._handleReadyStateChange = function _handleReadyStateChange(readyState) {
    var onReadyStateChange = this.props.onReadyStateChange;

    if (onReadyStateChange) {
      onReadyStateChange(readyState);
    }
  };

  RelayRenderer.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }
    if (this.gcHold) {
      this.gcHold.release();
    }
    this.gcHold = null;
    this.mounted = false;
  };

  RelayRenderer.prototype.render = function render() {
    var children = undefined;
    var shouldUpdate = this._shouldUpdate();
    if (shouldUpdate) {
      var _props = this.props;
      var _Container = _props.Container;
      var _render = _props.render;
      var _renderArgs = this.state.renderArgs;

      if (_render) {
        children = _render(_renderArgs);
      } else if (_renderArgs.props) {
        children = React.createElement(_Container, _renderArgs.props);
      }
    }
    if (children === undefined) {
      children = null;
      shouldUpdate = false;
    }
    return React.createElement(
      StaticContainer,
      { shouldUpdate: shouldUpdate },
      children
    );
  };

  return RelayRenderer;
})(React.Component);

function createFragmentPointerForRoot(query) {
  return query ? RelayFragmentPointer.createForRoot(RelayStore.getStoreData().getQueuedStore(), query) : null;
}

RelayRenderer.propTypes = {
  Container: RelayPropTypes.Container,
  forceFetch: PropTypes.bool,
  onReadyStateChange: PropTypes.func,
  queryConfig: RelayPropTypes.QueryConfig.isRequired,
  render: PropTypes.func
};

RelayRenderer.childContextTypes = {
  relay: RelayPropTypes.Context,
  route: RelayPropTypes.QueryConfig.isRequired
};

module.exports = RelayRenderer;