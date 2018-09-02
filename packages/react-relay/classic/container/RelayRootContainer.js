/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const PropTypes = require('prop-types');
const React = require('React');
const RelayPropTypes = require('./RelayPropTypes');
const RelayRenderer = require('./RelayRenderer');
const RelayStore = require('../store/RelayStore');

import type {RelayQueryConfigInterface} from '../query-config/RelayQueryConfig';
import type {ComponentFetchState, ReadyState} from '../tools/RelayTypes';
import type {RelayRetryCallback} from './RelayReadyStateRenderer';

export type RootContainerProps = {
  Component: React.ComponentType<any>,
  forceFetch?: ?boolean,
  shouldFetch?: ?boolean,
  onReadyStateChange?: ?(readyState: ReadyState) => void,
  renderFailure?: ?(
    error: Error,
    retry: RelayRetryCallback,
  ) => ?React.Element<any>,
  renderFetched?: ?(
    data: Object,
    fetchState: ComponentFetchState,
  ) => ?React.Element<any>,
  renderLoading?: ?() => ?React.Element<any>,
  route: RelayQueryConfigInterface,
};

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
  shouldFetch,
}: RootContainerProps): ?React.Element<any> {
  return (
    <RelayRenderer
      Container={Component}
      forceFetch={forceFetch}
      onReadyStateChange={onReadyStateChange}
      queryConfig={route}
      environment={RelayStore}
      shouldFetch={shouldFetch}
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
  shouldFetch: PropTypes.bool,
};

module.exports = RelayRootContainer;
