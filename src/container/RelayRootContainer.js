/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRootContainer
 * @typechecks
 * @flow
 */

'use strict';

var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var React = require('React');
var RelayDeprecated = require('RelayDeprecated');
import type {RelayQueryConfigSpec} from 'RelayContainer';
var RelayStore = require('RelayStore');
var RelayStoreData = require('RelayStoreData');
var RelayPropTypes = require('RelayPropTypes');
import type {
  Abortable,
  ComponentFetchState,
  ComponentReadyState,
  ReadyState,
  RelayContainer
} from 'RelayTypes';
var StaticContainer = require('StaticContainer.react');

var getRelayQueries = require('getRelayQueries');
var invariant = require('invariant');
var mapObject = require('mapObject');

type GraphQLFragmentPointers =
  {[propName: string]: ?GraphQLFragmentPointer};
type RootContainerProps = {
  Component: RelayContainer;
  forceFetch?: ?boolean;
  onReadyStateChange?: ?(readyState: ReadyState) => void;
  refetchRoute?: ?boolean; // TODO: Deprecate, #6247867.
  renderFailure?: ?(error: Error, retry: () => void) => ReactElement;
  renderFetched?: ?(
    data: GraphQLFragmentPointers,
    fetchState: ComponentFetchState
  ) => ReactElement;
  renderLoading?: ?() => ReactElement;
  route: RelayQueryConfigSpec;
};
type RootContainerState = {
  activeComponent: ?RelayContainer;
  activeRoute: ?RelayQueryConfigSpec;
  error: ?Error;
  fragmentPointers: ?GraphQLFragmentPointers;
  pendingRequest: ?Abortable;
  readyState: ?ComponentReadyState;
  fetchState: ComponentFetchState;
};

var {PropTypes} = React;

var storeData = RelayStoreData.getDefaultInstance();

/**
 * @public
 *
 * RelayRootContainer sends requests for data required to render the supplied
 * `Component` and `route`. The `Component` must be a container created using
 * `Relay.createContainer`.
 *
 * See the `RelayStore` module for documentation on `onReadyStateChange`.
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
class RelayRootContainer extends React.Component {
  mounted: boolean;
  props: RootContainerProps;
  state: RootContainerState;

  constructor(props: RootContainerProps, context: any) {
    super(props, context);
    this.mounted = true;
    this.state = this._runQueries(this.props);
  }

  getChildContext(): Object {
    return {route: this.props.route};
  }

  /**
   * @private
   */
  _runQueries(
    {Component, forceFetch, refetchRoute, route}: RootContainerProps
  ): RootContainerState {
    var querySet = getRelayQueries(Component, route);
    var onReadyStateChange = readyState => {
      if (!this.mounted) {
        this._handleReadyStateChange({...readyState, mounted: false});
        return;
      }
      var {fragmentPointers, pendingRequest} = this.state;
      if (request !== pendingRequest) {
        // Ignore (abort) ready state if we have a new pending request.
        return;
      }
      if (readyState.aborted || readyState.done || readyState.error) {
        pendingRequest = null;
      }
      if (readyState.ready && !fragmentPointers) {
        fragmentPointers = mapObject(
          querySet,
          query => query ?
            GraphQLFragmentPointer.createForRoot(
              storeData.getQueuedStore(),
              query
            ) :
            null
        );
      }
      this.setState({
        activeComponent: Component,
        activeRoute: route,
        error: readyState.error,
        fragmentPointers,
        pendingRequest,
        readyState: {...readyState, mounted: true},
        fetchState: {
          done: readyState.done,
          stale: readyState.stale,
        },
      });
    };

    if (typeof refetchRoute !== 'undefined') {
      RelayDeprecated.warn({
        was: 'RelayRootContainer.refetchRoute',
        now: 'RelayRootContainer.forceFetch',
      });
      forceFetch = refetchRoute;
    }

    var request = forceFetch ?
      RelayStore.forceFetch(querySet, onReadyStateChange) :
      RelayStore.primeCache(querySet, onReadyStateChange);

    return {
      activeComponent: null,
      activeRoute: null,
      error: null,
      fragmentPointers: null,
      pendingRequest: request,
      readyState: null,
      fetchState: {
        done: false,
        stale: false,
      },
    };
  }

  /**
   * Returns whether or not the view should be updated during the current render
   * pass. This is false between invoking `Relay.Store.{primeCache,forceFetch}`
   * and the first invocation of the `onReadyStateChange` callback.
   *
   * @private
   */
  _shouldUpdate(): boolean {
    return (
      this.props.Component === this.state.activeComponent &&
      this.props.route === this.state.activeRoute
    );
  }

  /**
   * Exposed as the second argument to the `onFailure` prop.
   *
   * @private
   */
  _retry(): void {
    invariant(
      this.state.error,
      'RelayRootContainer: Can only invoke `retry` in a failure state.'
    );
    this.setState(this._runQueries(this.props));
  }

  componentWillReceiveProps(nextProps: RootContainerProps): void {
    if (nextProps.Component !== this.props.Component ||
        nextProps.route !== this.props.route) {
      if (this.state.pendingRequest) {
        this.state.pendingRequest.abort();
      }
      this.setState(this._runQueries(nextProps));
    }
  }

  componentDidUpdate(
    prevProps: RootContainerProps,
    prevState?: RootContainerState
  ): void {
    // `prevState` should exist; the truthy check is for Flow soundness.
    var readyState = this.state.readyState;
    if (readyState) {
      if (!prevState || readyState !== prevState.readyState) {
        this._handleReadyStateChange(readyState);
      }
    }
  }

  /**
   * @private
   */
  _handleReadyStateChange(readyState: ReadyState): void {
    var onReadyStateChange = this.props.onReadyStateChange;
    if (onReadyStateChange) {
      onReadyStateChange(readyState);
    }
  }

  componentWillUnmount(): void {
    if (this.state.pendingRequest) {
      this.state.pendingRequest.abort();
    }
    this.mounted = false;
  }

  render(): ?ReactElement {
    var children = null;
    var shouldUpdate = this._shouldUpdate();
    if (shouldUpdate && this.state.error) {
      var renderFailure = this.props.renderFailure;
      if (renderFailure) {
        children = renderFailure(this.state.error, this._retry.bind(this));
      }
    } else if (shouldUpdate && this.state.fragmentPointers) {
      var renderFetched = this.props.renderFetched;
      if (renderFetched) {
        children = renderFetched({
          ...this.props.route.params,
          ...this.state.fragmentPointers,
        }, this.state.fetchState);
      } else {
        var Component = this.props.Component;
        children =
          <Component
            {...this.props.route.params}
            {...this.state.fragmentPointers}
          />;
      }
    } else {
      var renderLoading = this.props.renderLoading;
      if (renderLoading) {
        children = renderLoading();
      } else {
        children = undefined;
      }
      if (children === undefined) {
        children = null;
        shouldUpdate = false;
      }
    }
    return (
      <StaticContainer shouldUpdate={shouldUpdate}>
        {children}
      </StaticContainer>
    );
  }
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
