/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRootContainer
 * @typechecks
 * 
 */

'use strict';

var React = require('react');

var RelayPropTypes = require('./RelayPropTypes');

var RelayRenderer = require('./RelayRenderer');

var PropTypes = React.PropTypes;

/**
 * @public
 *
 * RelayRootContainer sends requests for data required to render the supplied
 * `Component` and `route`. The `Component` must be a container created using
 * `Relay.createContainer`.
 *
 * === Render Callbacks ===
 *
 * Whenever the RelayRootContainer renders, one of three render callback props
 * are invoked depending on whether data is being loaded, can be resolved, or if
 * an error is incurred.
 *
 *  ReactDOM.render(
 *    <RelayRootContainer
 *      Component={FooComponent}
 *      route={fooRoute}
 *      renderLoading={function() {
 *        return <View>Loading...</View>;
 *      }}
 *      renderFetched={function(data) {
 *        // Must spread `data` into <FooComponent>.
 *        return <FooComponent {...data} />;
 *      }}
 *      renderFailure={function(error) {
 *        return <View>Error: {error.message}</View>;
 *      }}
 *    />,
 *    ...
 *  );
 *
 * If a callback is not supplied, it has a default behavior:
 *
 *  - Without `renderFetched`, `Component` will be rendered with fetched data.
 *  - Without `renderFailure`, an error will render to null.
 *  - Without `renderLoading`, the existing view will continue to render. If
 *    this is the initial mount (with no existing view), renders to null.
 *
 * In addition, supplying a `renderLoading` that returns undefined has the same
 * effect as not supplying the callback. (Usually, an undefined return value is
 * an error in React).
 *
 * === Refs ===
 *
 * References to elements rendered by any of these callbacks can be obtained by
 * using the React `ref` prop. For example:
 *
 *   <FooComponent {...data} ref={handleFooRef} />
 *
 *   function handleFooRef(component) {
 *     // Invoked when `<FooComponent>` is mounted or unmounted. When mounted,
 *     // `component` will be the component. When unmounted, `component` will
 *     // be null.
 *   }
 *
 */
function RelayRootContainer(_ref) {
  var Component = _ref.Component;
  var forceFetch = _ref.forceFetch;
  var onReadyStateChange = _ref.onReadyStateChange;
  var renderFailure = _ref.renderFailure;
  var renderFetched = _ref.renderFetched;
  var renderLoading = _ref.renderLoading;
  var route = _ref.route;

  return React.createElement(RelayRenderer, {
    Container: Component,
    forceFetch: forceFetch,
    onReadyStateChange: onReadyStateChange,
    queryConfig: route,
    render: function (_ref2) {
      var done = _ref2.done;
      var error = _ref2.error;
      var props = _ref2.props;
      var retry = _ref2.retry;
      var stale = _ref2.stale;

      if (error) {
        if (renderFailure) {
          return renderFailure(error, retry);
        }
      } else if (props) {
        if (renderFetched) {
          return renderFetched(props, { done: done, stale: stale });
        } else {
          return React.createElement(Component, props);
        }
      } else {
        if (renderLoading) {
          return renderLoading();
        }
      }
      return undefined;
    }
  });
}

RelayRootContainer.propTypes = {
  Component: RelayPropTypes.Container,
  forceFetch: PropTypes.bool,
  onReadyStateChange: PropTypes.func,
  renderFailure: PropTypes.func,
  renderFetched: PropTypes.func,
  renderLoading: PropTypes.func,
  route: RelayPropTypes.QueryConfig.isRequired
};

RelayRootContainer.childContextTypes = {
  route: RelayPropTypes.QueryConfig.isRequired
};

module.exports = RelayRootContainer;