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
const RelayReadyStateRenderer = require('./RelayReadyStateRenderer');

const getRelayQueries = require('./getRelayQueries');

import type {RelayQueryConfigInterface} from '../query-config/RelayQueryConfig';
import type {RelayEnvironmentInterface} from '../store/RelayEnvironment';
import type {RelayQuerySet} from '../tools/RelayInternalTypes';
import type {
  Abortable,
  ComponentReadyState,
  ReadyState,
} from '../tools/RelayTypes';
import type {
  RelayRenderCallback,
  RelayRetryCallback,
} from './RelayReadyStateRenderer';

type Props = {
  Container: React.ComponentType<any>,
  shouldFetch?: ?boolean,
  forceFetch?: ?boolean,
  onForceFetch?: ?(
    querySet: RelayQuerySet,
    callback: (readyState: ReadyState) => void,
  ) => Abortable,
  onPrimeCache?: ?(
    querySet: RelayQuerySet,
    callback: (readyState: ReadyState) => void,
  ) => Abortable,
  onReadyStateChange?: ?(readyState: ReadyState) => void,
  queryConfig: RelayQueryConfigInterface,
  environment: RelayEnvironmentInterface,
  render?: ?RelayRenderCallback,
};
type State = {
  active: boolean,
  readyState: ?ComponentReadyState,
  retry: RelayRetryCallback,
};

const INACTIVE_READY_STATE = {
  aborted: false,
  done: false,
  error: null,
  events: [],
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
class RelayRenderer extends React.Component<Props, State> {
  static propTypes = {
    Container: RelayPropTypes.Container,
    forceFetch: PropTypes.bool,
    onReadyStateChange: PropTypes.func,
    queryConfig: RelayPropTypes.QueryConfig.isRequired,
    environment: RelayPropTypes.Environment,
    render: PropTypes.func,
    shouldFetch: PropTypes.bool,
  };

  static defaultProps = {
    shouldFetch: true,
  };

  lastRequest: ?Abortable;
  mounted: boolean;
  pendingRequest: ?Abortable;
  props: Props;
  state: State;

  constructor(props: Props, context: any) {
    super(props, context);
    this.mounted = true;
    this.pendingRequest = null;
    this.state = {
      active: false,
      readyState: null,
      retry: this._retry.bind(this),
    };
  }

  componentDidMount(): void {
    this._validateProps(this.props);
    this._runQueries(this.props);
  }

  /**
   * @private
   */
  _validateProps(props: Props) {
    const error = RelayRenderer.propTypes.Container(
      props,
      'Container',
      'RelayRenderer',
    );
    if (error) {
      throw error;
    }
  }

  /**
   * @private
   */
  _runQueries({
    Container,
    forceFetch,
    onForceFetch,
    onPrimeCache,
    queryConfig,
    environment,
    shouldFetch,
  }: Props): void {
    if (!shouldFetch) {
      return;
    }

    const onReadyStateChange = readyState => {
      if (!this.mounted) {
        this._handleReadyStateChange({...readyState, mounted: false});
        return;
      }
      if (request !== this.lastRequest) {
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

    const querySet = getRelayQueries(Container, queryConfig);
    const request = (this.pendingRequest = forceFetch
      ? onForceFetch
        ? onForceFetch(querySet, onReadyStateChange)
        : environment.forceFetch(querySet, onReadyStateChange)
      : onPrimeCache
        ? onPrimeCache(querySet, onReadyStateChange)
        : environment.primeCache(querySet, onReadyStateChange));
    this.lastRequest = request;
  }

  /**
   * @private
   */
  _retry(): void {
    const {readyState} = this.state;
    if (readyState && readyState.error) {
      this._runQueries(this.props);
      this.setState({readyState: null});
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (
      nextProps.Container !== this.props.Container ||
      nextProps.environment !== this.props.environment ||
      nextProps.queryConfig !== this.props.queryConfig ||
      nextProps.shouldFetch !== this.props.shouldFetch ||
      (nextProps.forceFetch && !this.props.forceFetch)
    ) {
      this._validateProps(nextProps);
      this._runQueries(nextProps);
      this.setState({readyState: null});
    }
  }

  componentDidUpdate(prevProps: Props, prevState?: State): void {
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
    this.mounted = false;
  }

  render(): React.Node {
    const readyState = this.state.active
      ? this.state.readyState
      : INACTIVE_READY_STATE;

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

module.exports = RelayRenderer;
