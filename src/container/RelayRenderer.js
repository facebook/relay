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

const RelayFragmentPointer = require('RelayFragmentPointer');
const React = require('React');
import type {RelayQueryConfigSpec} from 'RelayContainer';
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
import type {GarbageCollectionHold} from 'RelayGarbageCollector';
import type {RelayQuerySet} from 'RelayInternalTypes';
const RelayPropTypes = require('RelayPropTypes');
import type {
  Abortable,
  ComponentReadyState,
  ReadyState,
  RelayContainer,
} from 'RelayTypes';
const StaticContainer = require('StaticContainer.react');
import type {Root as RelayQueryRoot} from 'RelayQuery';

const getRelayQueries = require('getRelayQueries');
const invariant = require('invariant');
const mapObject = require('mapObject');

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
  environment: RelayEnvironmentInterface;
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
  activeEnvironment: ?RelayEnvironmentInterface;
  activeQueryConfig: ?RelayQueryConfigSpec;
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
  pendingRequest: ?Abortable;
  props: RelayRendererProps;
  state: RelayRendererState;

  constructor(props: RelayRendererProps, context: any) {
    super(props, context);
    const garbageCollector =
      this.props.environment.getStoreData().getGarbageCollector();
    this.gcHold = garbageCollector && garbageCollector.acquireHold();
    this.mounted = true;
    this.pendingRequest = null;
    this.state = this._buildState(null, null, null, null, null);
  }

  /**
   * @private
   */
  _buildState(
    activeContainer: ?RelayContainer,
    activeEnvironment: ?RelayEnvironmentInterface,
    activeQueryConfig: ?RelayQueryConfigSpec,
    readyState: ?ReadyState,
    props: ?Object
  ): RelayRendererState {
    return {
      activeContainer,
      activeEnvironment,
      activeQueryConfig,
      readyState: readyState && {...readyState, mounted: true},
      renderArgs: {
        done: !!readyState && readyState.done,
        error: readyState && readyState.error,
        props,
        retry: () => this._retry(),
        stale: !!readyState && readyState.stale,
      },
    };
  }

  getChildContext(): Object {
    return {
      relay: this.props.environment,
      route: this.props.queryConfig,
    };
  }

  componentDidMount(): void {
    this._runQueries(this.props);
  }

  /**
   * @private
   */
  _runQueries(
    {
      Container,
      forceFetch,
      onForceFetch,
      onPrimeCache,
      queryConfig,
      environment,
    }: RelayRendererProps
  ): void {
    const querySet = getRelayQueries(Container, queryConfig);
    const onReadyStateChange = readyState => {
      if (!this.mounted) {
        this._handleReadyStateChange({...readyState, mounted: false});
        return;
      }
      if (request !== this.pendingRequest) {
        // Ignore (abort) ready state if we have a new pending request.
        return;
      }
      if (readyState.aborted || readyState.done || readyState.error) {
        this.pendingRequest = null;
      }
      let {props} = this.state.renderArgs;
      if (readyState.ready && !props) {
        props = {
          ...queryConfig.params,
          ...mapObject(
            querySet,
            query => createFragmentPointerForRoot(environment, query)
          ),
        };
      }
      this.setState(
        this._buildState(
          Container,
          environment,
          queryConfig,
          readyState,
          props
        )
      );
    };

    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }

    const request = this.pendingRequest = forceFetch ?
      (
        onForceFetch ?
          onForceFetch(querySet, onReadyStateChange) :
          environment.forceFetch(querySet, onReadyStateChange)
      ) :
      (
        onPrimeCache ?
          onPrimeCache(querySet, onReadyStateChange) :
          environment.primeCache(querySet, onReadyStateChange)
      );
  }

  /**
   * Returns whether or not the view should be updated during the current render
   * pass. This is false between invoking `Relay.Store.{primeCache,forceFetch}`
   * and the first invocation of the `onReadyStateChange` callback if there is
   * an actively rendered Relay context, container and query configuration.
   *
   * @private
   */
  _shouldUpdate(): boolean {
    const {activeContainer, activeEnvironment, activeQueryConfig} = this.state;
    const {Container, queryConfig, environment} = this.props;
    return (
      (!activeContainer || Container === activeContainer) &&
      (!activeEnvironment || environment === activeEnvironment) &&
      (!activeQueryConfig || queryConfig === activeQueryConfig)
    );
  }

  /**
   * @private
   */
  _runQueriesAndSetState(props: RelayRendererProps): void {
    this._runQueries(props);
    this.setState(
      this._buildState(
        this.state.activeContainer,
        this.state.activeEnvironment,
        this.state.activeQueryConfig,
        null,
        null
      )
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
    this._runQueriesAndSetState(this.props);
  }

  componentWillReceiveProps(nextProps: RelayRendererProps): void {
    if (nextProps.Container !== this.props.Container ||
        nextProps.environment !== this.props.environment ||
        nextProps.queryConfig !== this.props.queryConfig ||
        (nextProps.forceFetch && !this.props.forceFetch)) {
      if (nextProps.environment !== this.props.environment) {
        if (this.gcHold) {
          this.gcHold.release();
        }
        const garbageCollector =
          nextProps.environment.getStoreData().getGarbageCollector();
        this.gcHold = garbageCollector && garbageCollector.acquireHold();
      }
      this._runQueriesAndSetState(nextProps);
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
    if (this.pendingRequest) {
      this.pendingRequest.abort();
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

function createFragmentPointerForRoot(
  environment,
  query: RelayQueryRoot
) {
  return query ?
    RelayFragmentPointer.createForRoot(
      environment.getStoreData().getQueuedStore(),
      query
    ) :
    null;
}

RelayRenderer.propTypes = {
  Container: RelayPropTypes.Container,
  forceFetch: PropTypes.bool,
  onReadyStateChange: PropTypes.func,
  queryConfig: RelayPropTypes.QueryConfig.isRequired,
  environment: RelayPropTypes.Environment,
  render: PropTypes.func,
};

RelayRenderer.childContextTypes = {
  relay: RelayPropTypes.Environment,
  route: RelayPropTypes.QueryConfig.isRequired,
};

module.exports = RelayRenderer;
