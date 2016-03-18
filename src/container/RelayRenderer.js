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

const React = require('React');
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
import type {GarbageCollectionHold} from 'RelayGarbageCollector';
import type {RelayQuerySet} from 'RelayInternalTypes';
const RelayPropTypes = require('RelayPropTypes');
import type {RelayQueryConfigInterface} from 'RelayQueryConfig';
const RelayReadyStateRenderer = require('RelayReadyStateRenderer');
import type {
  RelayRenderCallback,
  RelayRetryCallback,
} from 'RelayReadyStateRenderer';
import type {
  Abortable,
  ComponentReadyState,
  ReadyState,
  RelayContainer,
} from 'RelayTypes';

const getRelayQueries = require('getRelayQueries');
const invariant = require('invariant');

type Props = {
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
  queryConfig: RelayQueryConfigInterface;
  environment: RelayEnvironmentInterface;
  render?: ?RelayRenderCallback;
};
type State = {
  active: boolean;
  readyState: ?ComponentReadyState;
  retry: RelayRetryCallback;
};

const {PropTypes} = React;

const INACTIVE_READY_STATE = {
  aborted: false,
  done: false,
  error: null,
  ready: false,
  stale: false,
};

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
 *   props: ?{[propName: string]: mixed}
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
class RelayRenderer extends React.Component<void, Props, State> {
  gcHold: ?GarbageCollectionHold;
  mounted: boolean;
  pendingRequest: ?Abortable;
  props: Props;
  querySet: ?RelayQuerySet;
  state: State;

  constructor(props: Props, context: any) {
    super(props, context);
    const garbageCollector =
      this.props.environment.getStoreData().getGarbageCollector();
    this.gcHold = garbageCollector && garbageCollector.acquireHold();
    this.mounted = true;
    this.pendingRequest = null;
    this.querySet = null;
    this.state = {
      active: false,
      readyState: null,
      retry: this._retry.bind(this),
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
    }: Props
  ): void {
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
      this.setState({
        active: true,
        readyState: {
          ...readyState,
          mounted: true,
        },
      });
    };

    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }

    this.containerProps = null;
    this.querySet = getRelayQueries(Container, queryConfig);
    const request = this.pendingRequest = forceFetch ?
      (
        onForceFetch ?
          onForceFetch(this.querySet, onReadyStateChange) :
          environment.forceFetch(this.querySet, onReadyStateChange)
      ) :
      (
        onPrimeCache ?
          onPrimeCache(this.querySet, onReadyStateChange) :
          environment.primeCache(this.querySet, onReadyStateChange)
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
    this._runQueries(this.props);
    this.setState({readyState: null});
  }

  componentWillReceiveProps(nextProps: Props): void {
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
      this._runQueries(nextProps);
      this.setState({readyState: null});
    }
  }

  componentDidUpdate(
    prevProps: Props,
    prevState?: State
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

  render(): ?React$Element {
    const readyState = this.state.active ?
      this.state.readyState :
      INACTIVE_READY_STATE;

    return (
      <RelayReadyStateRenderer
        Container={this.props.Container}
        environment={this.props.environment}
        queryConfig={this.props.queryConfig}
        readyState={readyState}
        render={this.props.render}
        retry={this.state.retry}
      />
    );
  }
}

RelayRenderer.propTypes = {
  Container: RelayPropTypes.Container,
  forceFetch: PropTypes.bool,
  onReadyStateChange: PropTypes.func,
  queryConfig: RelayPropTypes.QueryConfig.isRequired,
  environment: RelayPropTypes.Environment,
  render: PropTypes.func,
};

module.exports = RelayRenderer;
