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
 * @flow
 */

'use strict';

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const React = require('React');
import type {RelayQueryConfigSpec} from 'RelayContainer';
import type {GarbageCollectionHold} from 'RelayGarbageCollector';
import type {RelayQuerySet} from 'RelayInternalTypes';
const RelayPropTypes = require('RelayPropTypes');
const RelayStore = require('RelayStore');
import type {
  Abortable,
  ComponentReadyState,
  ReadyState,
  RelayContainer,
} from 'RelayTypes';
const StaticContainer = require('StaticContainer.react');

const getRelayQueries = require('getRelayQueries');
const invariant = require('invariant');
const isRelayContainer = require('isRelayContainer');
const mapObject = require('mapObject');
const sprintf = require('sprintf');
const warning = require('warning');

type RelayRendererProps = {
  Container: RelayContainer;
  forceFetch?: ?boolean;
  onForceFetch?: ?(
    querySet: RelayQuerySet,
    callback: (readyState: ReadyState) => void
  ) => Abortable;
  onPrimeCache?: ?(
    querySet: RelayQuerySet,
    callback: (readyState: ReadyState) => void
  ) => Abortable;
  onReadyStateChange?: ?(readyState: ReadyState) => void;
  queryConfig: RelayQueryConfigSpec;
  render?: ?RelayRendererRenderCallback;
};
export type RelayRendererRenderCallback =
  (renderArgs: RelayRendererRenderArgs) => ?ReactElement;
type RelayRendererRenderArgs = {
  done: boolean;
  error: ?Error;
  props: ?Object;
  retry: ?Function;
  stale: boolean;
};
type RelayRendererState = {
  activeContainer: ?RelayContainer;
  activeQueryConfig: ?RelayQueryConfigSpec;
  pendingRequest: ?Abortable;
  readyState: ?ComponentReadyState;
  renderArgs: RelayRendererRenderArgs;
};

const {PropTypes} = React;

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
class RelayRenderer extends React.Component {
  gcHold: ?GarbageCollectionHold;
  mounted: boolean;
  props: RelayRendererProps;
  state: RelayRendererState;

  constructor(props: RelayRendererProps, context: any) {
    super(props, context);
    const garbageCollector =
      RelayStore.getStoreData().getGarbageCollector();
    this.gcHold = garbageCollector && garbageCollector.acquireHold();
    this.mounted = true;
    this.state = this._runQueries(this.props);
  }

  getChildContext(): Object {
    return {
      relay: RelayStore,
      route: this.props.queryConfig,
    };
  }

  /**
   * @private
   */
  _runQueries(props: RelayRendererProps): RelayRendererState {
    const {Container, forceFetch, queryConfig} = props;
    const querySet = getRelayQueries(Container, queryConfig);
    const onReadyStateChange = readyState => {
      if (!this.mounted) {
        this._handleReadyStateChange({...readyState, mounted: false});
        return;
      }
      let {pendingRequest, renderArgs: {props}} = this.state;
      if (request !== pendingRequest) {
        // Ignore (abort) ready state if we have a new pending request.
        return;
      }
      if (readyState.aborted || readyState.done || readyState.error) {
        pendingRequest = null;
      }
      if (readyState.ready && !props) {
        props = {
          ...queryConfig.params,
          ...mapObject(querySet, createFragmentPointerForRoot),
        };
      }
      this.setState({
        activeContainer: Container,
        activeQueryConfig: queryConfig,
        pendingRequest,
        readyState: {...readyState, mounted: true},
        renderArgs: {
          done: readyState.done,
          error: readyState.error,
          props,
          retry: this.state.renderArgs.retry,
          stale: readyState.stale,
        },
      });
    };

    const request = forceFetch ?
      (
        props.onForceFetch ?
          props.onForceFetch(querySet, onReadyStateChange) :
          RelayStore.forceFetch(querySet, onReadyStateChange)
      ) :
      (
        props.onPrimeCache ?
          props.onPrimeCache(querySet, onReadyStateChange) :
          RelayStore.primeCache(querySet, onReadyStateChange)
      );

    return {
      activeContainer: this.state ? this.state.activeContainer : null,
      activeQueryConfig: this.state ? this.state.activeQueryConfig : null,
      pendingRequest: request,
      readyState: null,
      renderArgs: {
        done: false,
        error: null,
        props: null,
        retry: this._retry.bind(this),
        stale: false,
      },
    };
  }

  /**
   * Returns whether or not the view should be updated during the current render
   * pass. This is false between invoking `Relay.Store.{primeCache,forceFetch}`
   * and the first invocation of the `onReadyStateChange` callback if there is
   * an actively rendered container and query configuration.
   *
   * @private
   */
  _shouldUpdate(): boolean {
    const {activeContainer, activeQueryConfig} = this.state;
    const {Container} = this.props;
    return (
      (!activeContainer || Container === activeContainer) &&
      (!activeQueryConfig || this.props.queryConfig === activeQueryConfig)
    );
  }

  /**
   * @private
   */
  _retry(): void {
    const {readyState} = this.state;
    invariant(
      readyState && readyState.error,
      'RelayRenderer: You tried to call `retry`, but the last request did ' +
      'not fail. You can only call this when the last request has failed.'
    );
    this.setState(this._runQueries(this.props));
  }

  componentWillReceiveProps(nextProps: RelayRendererProps): void {
    if (nextProps.Container !== this.props.Container ||
        nextProps.queryConfig !== this.props.queryConfig ||
        (nextProps.forceFetch && !this.props.forceFetch)) {
      if (this.state.pendingRequest) {
        this.state.pendingRequest.abort();
      }
      this.setState(this._runQueries(nextProps));
    }
  }

  componentDidUpdate(
    prevProps: RelayRendererProps,
    prevState?: RelayRendererState
  ): void {
    // `prevState` should exist; the truthy check is for Flow soundness.
    const {readyState} = this.state;
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
    const {onReadyStateChange} = this.props;
    if (onReadyStateChange) {
      onReadyStateChange(readyState);
    }
  }

  componentWillUnmount(): void {
    if (this.state.pendingRequest) {
      this.state.pendingRequest.abort();
    }
    if (this.gcHold) {
      this.gcHold.release();
    }
    this.gcHold = null;
    this.mounted = false;
  }

  render(): ?ReactElement {
    let children;
    let shouldUpdate = this._shouldUpdate();
    if (shouldUpdate) {
      const {Container, render} = this.props;
      const {renderArgs} = this.state;
      if (render) {
        children = render(renderArgs);
      } else if (renderArgs.props) {
        children = <Container {...renderArgs.props} />;
      }
    }
    if (children === undefined) {
      children = null;
      shouldUpdate = false;
    }
    return (
      <StaticContainer shouldUpdate={shouldUpdate}>
        {children}
      </StaticContainer>
    );
  }
}

function createFragmentPointerForRoot(query) {
  return query ?
    GraphQLFragmentPointer.createForRoot(
      RelayStore.getStoreData().getQueuedStore(),
      query
    ) :
    null;
}

RelayRenderer.propTypes = {
  Container: RelayPropTypes.Container,
  forceFetch: PropTypes.bool,
  onReadyStateChange: PropTypes.func,
  queryConfig: RelayPropTypes.QueryConfig.isRequired,
  render: PropTypes.func,
};

RelayRenderer.childContextTypes = {
  relay: RelayPropTypes.Context.isRequired,
  route: RelayPropTypes.QueryConfig.isRequired,
};

module.exports = RelayRenderer;
