/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRootContainer
 * @flow
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('RelayPropTypes');
import type {RelayQueryConfigInterface} from 'RelayQueryConfig';
const RelayStore = require('RelayStore');
import type {
  ComponentFetchState,
  ReadyState,
  RelayContainer,
} from 'RelayTypes';
const RelayRenderer = require('RelayRenderer');

type RootContainerProps = {
  Component: RelayContainer;
  forceFetch?: ?boolean;
  onReadyStateChange?: ?(readyState: ReadyState) => void;
  renderFailure?: ?(error: Error, retry: ?() => void) => React$Element;
  renderFetched?: ?(
    data: Object,
    fetchState: ComponentFetchState
  ) => React$Element;
  renderLoading?: ?() => React$Element;
  route: RelayQueryConfigInterface;
};

const {PropTypes} = React;

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
function RelayRootContainer({
  Component,
  forceFetch,
  onReadyStateChange,
  renderFailure,
  renderFetched,
  renderLoading,
  route,
}: RootContainerProps): React$Element {
  return (
    <RelayRenderer
      Container={Component}
      forceFetch={forceFetch}
      onReadyStateChange={onReadyStateChange}
      queryConfig={route}
      environment={RelayStore}
      render={({done, error, props, retry, stale}) => {
        if (error) {
          if (renderFailure) {
            return renderFailure(error, retry);
          }
        } else if (props) {
          if (renderFetched) {
            return renderFetched(props, {done, stale});
          } else {
            return <Component {...props} />;
          }
        } else {
          if (renderLoading) {
            return renderLoading();
          }
        }
        return undefined;
      }}
    />
  );
}

RelayRootContainer.propTypes = {
  Component: RelayPropTypes.Container,
  forceFetch: PropTypes.bool,
  onReadyStateChange: PropTypes.func,
  renderFailure: PropTypes.func,
  renderFetched: PropTypes.func,
  renderLoading: PropTypes.func,
  route: RelayPropTypes.QueryConfig.isRequired,
};

RelayRootContainer.childContextTypes = {
  route: RelayPropTypes.QueryConfig.isRequired,
};

module.exports = RelayRootContainer;
