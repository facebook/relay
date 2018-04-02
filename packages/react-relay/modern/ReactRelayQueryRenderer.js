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
const deepFreeze = require('deepFreeze');

import type {RelayEnvironmentInterface as ClassicEnvironment} from '../classic/store/RelayEnvironment';
import type {
  CacheConfig,
  GraphQLTaggedNode,
  IEnvironment,
  RelayContext,
  Snapshot,
  Variables,
} from 'RelayRuntime';

type RetryCallbacks = {
  handleDataChange: ({
    error?: Error,
    snapshot?: Snapshot,
  }) => void,
  handleRetryAfterError: (error: Error) => void,
};

export type RenderProps = {
  error: ?Error,
  props: ?Object,
  retry: ?() => void,
};

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
  prevPropsEnvironment: IEnvironment | ClassicEnvironment,
  prevPropsVariables: Variables,
  prevQuery: ?GraphQLTaggedNode,
  queryFetcher: ReactRelayQueryFetcher,
  relayContextEnvironment: IEnvironment | ClassicEnvironment,
  relayContextVariables: Variables,
  renderProps: RenderProps,
  retryCallbacks: RetryCallbacks,
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

    const handleDataChange = ({
      error,
      snapshot,
    }: {
      error?: Error,
      snapshot?: Snapshot,
    }): void => {
      this.setState({
        renderProps: getRenderProps(
          error,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      });
    };

    const handleRetryAfterError = (error: Error) =>
      this.setState({renderProps: getLoadingRenderProps()});

    const retryCallbacks = {
      handleDataChange,
      handleRetryAfterError,
    };

    const queryFetcher = new ReactRelayQueryFetcher();

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
        ),
      };
    }

    return null;
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
      if (syncSnapshot) {
        retryCallbacks.handleDataChange({snapshot: syncSnapshot});
      } else if (error) {
        // If retrying after an error and no synchronous result available,
        // reset the render props
        retryCallbacks.handleRetryAfterError(error);
      }
    },
  };
}

function fetchQueryAndComputeStateFromProps(
  props: Props,
  queryFetcher: ReactRelayQueryFetcher,
  retryCallbacks: RetryCallbacks,
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
      // Use network data first, since it may be fresher
      const snapshot = querySnapshot || storeSnapshot;
      if (!snapshot) {
        return {
          relayContextEnvironment: environment,
          relayContextVariables: operation.variables,
          renderProps: getLoadingRenderProps(),
        };
      }

      return {
        relayContextEnvironment: environment,
        relayContextVariables: operation.variables,
        renderProps: getRenderProps(
          null,
          snapshot,
          queryFetcher,
          retryCallbacks,
        ),
      };
    } catch (error) {
      return {
        relayContextEnvironment: environment,
        relayContextVariables: operation.variables,
        renderProps: getRenderProps(error, null, queryFetcher, retryCallbacks),
      };
    }
  } else {
    queryFetcher.dispose();

    return {
      relayContextEnvironment: environment,
      relayContextVariables: variables,
      renderProps: getEmptyRenderProps(),
    };
  }
}

module.exports = ReactRelayQueryRenderer;
