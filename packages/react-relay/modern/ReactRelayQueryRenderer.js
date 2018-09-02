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

const React = require('React');
const ReactRelayQueryFetcher = require('./ReactRelayQueryFetcher');
const RelayPropTypes = require('../classic/container/RelayPropTypes');

const areEqual = require('areEqual');

const {deepFreeze} = require('relay-runtime');

import type {RelayEnvironmentInterface as ClassicEnvironment} from '../classic/store/RelayEnvironment';
import type {
  CacheConfig,
  GraphQLTaggedNode,
  IEnvironment,
  RelayContext,
  Snapshot,
  Variables,
  RequestNode,
} from 'relay-runtime';

type RetryCallbacks = {
  handleDataChange:
    | null
    | (({
        error?: Error,
        snapshot?: Snapshot,
      }) => void),
  handleRetryAfterError: null | ((error: Error) => void),
};

export type RenderProps = {
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
};

/**
 * React may double-fire the constructor, and we call 'fetch' in the
 * constructor. If a request is already in flight from a previous call to the
 * constructor, just reuse the query fetcher and wait for the response.
 */
const requestCache = {};

const NETWORK_ONLY = 'NETWORK_ONLY';
const STORE_THEN_NETWORK = 'STORE_THEN_NETWORK';
const DataFromEnum = {
  NETWORK_ONLY,
  STORE_THEN_NETWORK,
};
type DataFrom = $Keys<typeof DataFromEnum>;

export type Props = {
  cacheConfig?: ?CacheConfig,
  dataFrom?: DataFrom,
  environment: IEnvironment | ClassicEnvironment,
  query: ?GraphQLTaggedNode,
  render: (renderProps: RenderProps) => React.Node,
  variables: Variables,
};

type State = {
  error: Error | null,
  prevPropsEnvironment: IEnvironment | ClassicEnvironment,
  prevPropsVariables: Variables,
  prevQuery: ?GraphQLTaggedNode,
  queryFetcher: ReactRelayQueryFetcher,
  relayContextEnvironment: IEnvironment | ClassicEnvironment,
  relayContextVariables: Variables,
  renderProps: RenderProps,
  retryCallbacks: RetryCallbacks,
  requestCacheKey: ?string,
  snapshot: Snapshot | null,
};

/**
 * @public
 *
 * Orchestrates fetching and rendering data for a single view or view hierarchy:
 * - Fetches the query/variables using the given network implementation.
 * - Normalizes the response(s) to that query, publishing them to the given
 *   store.
 * - Renders the pending/fail/success states with the provided render function.
 * - Subscribes for updates to the root data and re-renders with any changes.
 */
class ReactRelayQueryRenderer extends React.Component<Props, State> {
  // TODO T25783053 Update this component to use the new React context API,
  // Once we have confirmed that it's okay to raise min React version to 16.3.
  static childContextTypes = {
    relay: RelayPropTypes.Relay,
  };

  _relayContext: RelayContext = {
    // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
    environment: (this.props.environment: IEnvironment),
    variables: this.props.variables,
  };

  constructor(props: Props, context: Object) {
    super(props, context);

    // Callbacks are attached to the current instance and shared with static
    // lifecyles by bundling with state. This is okay to do because the
    // callbacks don't change in reaction to props. However we should not
    // "leak" them before mounting (since we would be unable to clean up). For
    // that reason, we define them as null initially and fill them in after
    // mounting to avoid leaking memory.
    const retryCallbacks = {
      handleDataChange: null,
      handleRetryAfterError: null,
    };

    let queryFetcher;
    let requestCacheKey;
    if (props.query) {
      const {query} = props;

      // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
      const genericEnvironment = (props.environment: IEnvironment);

      const {getRequest} = genericEnvironment.unstable_internal;
      const request = getRequest(query);
      requestCacheKey = getRequestCacheKey(request, props.variables);
      queryFetcher = requestCache[requestCacheKey]
        ? requestCache[requestCacheKey]
        : new ReactRelayQueryFetcher();
    } else {
      queryFetcher = new ReactRelayQueryFetcher();
    }

    this.state = {
      prevPropsEnvironment: props.environment,
      prevPropsVariables: props.variables,
      prevQuery: props.query,
      queryFetcher,
      retryCallbacks,
      ...fetchQueryAndComputeStateFromProps(
        props,
        queryFetcher,
        retryCallbacks,
        requestCacheKey,
      ),
    };
  }

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State,
  ): $Shape<State> | null {
    if (
      prevState.prevQuery !== nextProps.query ||
      prevState.prevPropsEnvironment !== nextProps.environment ||
      !areEqual(prevState.prevPropsVariables, nextProps.variables)
    ) {
      return {
        prevQuery: nextProps.query,
        prevPropsEnvironment: nextProps.environment,
        prevPropsVariables: nextProps.variables,
        ...fetchQueryAndComputeStateFromProps(
          nextProps,
          prevState.queryFetcher,
          prevState.retryCallbacks,
          // passing no requestCacheKey will cause it to be recalculated internally
          // and we want the updated requestCacheKey, since variables may have changed
        ),
      };
    }

    return null;
  }

  componentDidMount() {
    const {retryCallbacks, queryFetcher, requestCacheKey} = this.state;
    if (requestCacheKey) {
      delete requestCache[requestCacheKey];
    }

    retryCallbacks.handleDataChange = (params: {
      error?: Error,
      snapshot?: Snapshot,
    }): void => {
      const error = params.error == null ? null : params.error;
      const snapshot = params.snapshot == null ? null : params.snapshot;

      this.setState(prevState => {
        const {requestCacheKey: prevRequestCacheKey} = prevState;
        if (prevRequestCacheKey) {
          delete requestCache[prevRequestCacheKey];
        }

        // Don't update state if nothing has changed.
        if (snapshot === prevState.snapshot && error === prevState.error) {
          return null;
        }
        return {
          renderProps: getRenderProps(
            error,
            snapshot,
            queryFetcher,
            retryCallbacks,
          ),
          snapshot,
          requestCacheKey: null,
        };
      });
    };

    retryCallbacks.handleRetryAfterError = (error: Error) =>
      this.setState(prevState => {
        const {requestCacheKey: prevRequestCacheKey} = prevState;
        if (prevRequestCacheKey) {
          delete requestCache[prevRequestCacheKey];
        }

        return {
          renderProps: getLoadingRenderProps(),
          requestCacheKey: null,
        };
      });

    // Re-initialize the ReactRelayQueryFetcher with callbacks.
    // If data has changed since constructions, this will re-render.
    if (this.props.query) {
      queryFetcher.setOnDataChange(retryCallbacks.handleDataChange);
    }
  }

  componentDidUpdate(): void {
    // We don't need to cache the request after the component commits
    const {requestCacheKey} = this.state;
    if (requestCacheKey) {
      delete requestCache[requestCacheKey];
      // HACK
      delete this.state.requestCacheKey;
    }
  }

  componentWillUnmount(): void {
    this.state.queryFetcher.dispose();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      nextProps.render !== this.props.render ||
      nextState.renderProps !== this.state.renderProps
    );
  }

  getChildContext(): Object {
    return {
      relay: this._relayContext,
    };
  }

  render() {
    const {
      relayContextEnvironment,
      relayContextVariables,
      renderProps,
    } = this.state;

    // HACK Mutate the context.relay object before updating children,
    // To account for any changes made by static gDSFP.
    // Updating this value in gDSFP would be less safe, since props changes
    // could be interrupted and we might re-render based on a setState call.
    // Child containers rely on context.relay being mutated (also for gDSFP).
    // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
    this._relayContext.environment = (relayContextEnvironment: IEnvironment);
    this._relayContext.variables = relayContextVariables;

    // Note that the root fragment results in `renderProps.props` is already
    // frozen by the store; this call is to freeze the renderProps object and
    // error property if set.
    if (__DEV__) {
      deepFreeze(renderProps);
    }
    return this.props.render(renderProps);
  }
}

function getLoadingRenderProps(): RenderProps {
  return {
    error: null,
    props: null, // `props: null` indicates that the data is being fetched (i.e. loading)
    retry: null,
  };
}

function getEmptyRenderProps(): RenderProps {
  return {
    error: null,
    props: {}, // `props: {}` indicates no data available
    retry: null,
  };
}

function getRenderProps(
  error: ?Error,
  snapshot: ?Snapshot,
  queryFetcher: ReactRelayQueryFetcher,
  retryCallbacks: RetryCallbacks,
): RenderProps {
  return {
    error: error ? error : null,
    props: snapshot ? snapshot.data : null,
    retry: () => {
      const syncSnapshot = queryFetcher.retry();
      if (
        syncSnapshot &&
        typeof retryCallbacks.handleDataChange === 'function'
      ) {
        retryCallbacks.handleDataChange({snapshot: syncSnapshot});
      } else if (
        error &&
        typeof retryCallbacks.handleRetryAfterError === 'function'
      ) {
        // If retrying after an error and no synchronous result available,
        // reset the render props
        retryCallbacks.handleRetryAfterError(error);
      }
    },
  };
}

function getRequestCacheKey(
  request: RequestNode,
  variables: Variables,
): string {
  if (request.kind === 'BatchRequest') {
    return JSON.stringify({
      id: request.requests.map(req => String(req.id || req.text)),
      variables,
    });
  } else {
    const requestID = request.id || request.text;
    return JSON.stringify({
      id: String(requestID),
      variables,
    });
  }
}

function fetchQueryAndComputeStateFromProps(
  props: Props,
  queryFetcher: ReactRelayQueryFetcher,
  retryCallbacks: RetryCallbacks,
  requestCacheKey: ?string,
): $Shape<State> {
  const {environment, query, variables} = props;
  if (query) {
    // $FlowFixMe TODO t16225453 QueryRenderer works with old+new environment.
    const genericEnvironment = (environment: IEnvironment);

    const {
      createOperationSelector,
      getRequest,
    } = genericEnvironment.unstable_internal;
    const request = getRequest(query);
    const operation = createOperationSelector(request, variables);

    if (typeof requestCacheKey === 'string' && requestCache[requestCacheKey]) {
      // This same request is already in flight.
      // Render loading state
      return {
        error: null,
        relayContextEnvironment: environment,
        relayContextVariables: operation.variables,
        renderProps: getLoadingRenderProps(),
        snapshot: null,
        requestCacheKey,
      };
    }

    try {
      const storeSnapshot =
        props.dataFrom === STORE_THEN_NETWORK
          ? queryFetcher.lookupInStore(genericEnvironment, operation)
          : null;
      const querySnapshot = queryFetcher.fetch({
        cacheConfig: props.cacheConfig,
        dataFrom: props.dataFrom,
        environment: genericEnvironment,
        onDataChange: retryCallbacks.handleDataChange,
        operation,
      });
      requestCacheKey =
        requestCacheKey || getRequestCacheKey(request, props.variables);
      requestCache[requestCacheKey] = queryFetcher;
      // Use network data first, since it may be fresher
      const snapshot = querySnapshot || storeSnapshot;
      if (!snapshot) {
        return {
          error: null,
          relayContextEnvironment: environment,
          relayContextVariables: operation.variables,
          renderProps: getLoadingRenderProps(),
          snapshot: null,
          requestCacheKey,
        };
      }

      return {
        error: null,
        relayContextEnvironment: environment,
        relayContextVariables: operation.variables,
        renderProps: getRenderProps(
          null,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
        snapshot,
        requestCacheKey,
      };
    } catch (error) {
      return {
        error,
        relayContextEnvironment: environment,
        relayContextVariables: operation.variables,
        renderProps: getRenderProps(error, null, queryFetcher, retryCallbacks),
        snapshot: null,
        requestCacheKey,
      };
    }
  } else {
    queryFetcher.dispose();

    return {
      error: null,
      relayContextEnvironment: environment,
      relayContextVariables: variables,
      renderProps: getEmptyRenderProps(),
      requestCacheKey: null, // if there is an error, don't cache request
    };
  }
}

module.exports = ReactRelayQueryRenderer;
